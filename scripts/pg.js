const {
    Pool
} = require('pg');
const config = require('.././config.js');
const pool = new Pool(config.dbConfig);

/**
 * Поиск записи в таблице по docID и/или id.
 * @param {BigInt} docID - id таблицы document.
 * @param {BigInt} id - id таблицы docColumn.
 * @returns {Object.<string, string>} Возвращает строку таблицы в виде объекта, типа: Ключ - Наименование столбца, значение - Содержимое столбца.
 */
async function findByID({
    docID,
    id
}) {
    let response = {};
    let res = {};
    if (!docID) return response.Error = 'docID is null';
    if (!id) return response.Error = 'id is null';

    const client = await pool.connect();
    try {
        res = await client.query('SELECT * FROM document WHERE id = $1', [docID]);
        console.log('res=', res.rows[0]);
        const doc = res.rows[0];
        res = await client.query('SELECT * FROM ' + doc.tablename + ' WHERE id = $1', [id]);
        response = res.rows[0];
    } catch (error) {
        console.log(error.stack);
        response.Error = error.stack;
    } finally {
        client.release();
    };
    return response;
};

/**
 * Поиск записей в таблице по docID и/или условию where.
 * @param {BigInt} docID - id таблицы document.
 * @param {Object.<string, string>} where - условие поиска. Ключ - Наименование столбца, значение - Содержимое столбца.
 * @returns {rows[Object.<string, string>]} Возвращает строки таблицы в виде объекта, типа: Ключ - Наименование столбца, значение - Содержимое столбца.
 */
async function findAll({
    docID,
    where
}) {
    let response = {};
    let res = {};
    //if (!docID) return response.Error = 'docID is null';

    const client = await pool.connect();
    try {
        //Если есть where - ищем по условию в таблице документа
        if (where && docID) {
            res = await client.query('SELECT * FROM document WHERE id = $1', [docID]);
            console.log('res=', res.rows[0]);
            const doc = res.rows[0];
            const key = Object.keys(where);
            const value = Object.values(where);
            const tableData = await client.query('SELECT * FROM ' + doc.rows[0].tablename + ' WHERE $1 = $2', [key[0], value[0]]);
            response = tableData.rows;
        } else if (docID) { //Если нет where - ищем все записи в таблице документа
            const doc = await client.query('SELECT * FROM document WHERE id = $1', [docID]);
            console.log('doc=', doc.rows[0]);
            const tableData = await client.query('SELECT * FROM ' + doc.rows[0].tablename);
            response = tableData.rows;
        } else {
            let res = await client.query('SELECT * FROM document');
            const docModel = res.rows;
            res = await client.query('SELECT * FROM docColumn');
            const docColumnModel = res.rows;
            response = {
                docModel,
                docColumnModel
            };
        };
    } catch (error) {
        console.log(error.stack);
        response.Error = error.stack;
    } finally {
        client.release();
    };
    return response;
};

/**
 * Поиск записи в таблице по docID и id, также потск данных в дочерних таблицах.
 * @param {BigInt} docID - id таблицы document.
 * @param {BigInt} id - id таблицы docColumn.
 * @returns {rows[Object.<string, string>]} Возвращает строки таблиц в виде объекта, типа: Ключ - Наименование столбца, значение - Содержимое столбца.
 */
async function findWithChildren({
    docID,
    id
}) {
    //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!ДОДЕЛАТЬ!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    let response = {};
    if (!docID) return response.Error = 'docID is null';

    const client = await pool.connect();
    try {
        const mainTableName = await client.query('SELECT * FROM document WHERE id = $1', [docID]);
        const mainTableData = await client.query('SELECT * FROM ' + mainTableName.rows[0].tablename + ' WHERE id = $1');
        response.mainTableData = mainTableData;

        const childrenTableNames = await client.query('SELECT * FROM document WHERE parent = $1', [docID]);
        //Асинхронный перебор массива
        for await (const childrenTableName of childrenTableNames) {
            response[tableName] = await client.query('SELECT * FROM ' + tableName + ' WHERE' + mainTableName.rows[0].tablename + 'ID = $1', [id]);
        };

    } catch (error) {
        console.log(error.stack);
        response.Error = error.stack;
    } finally {
        client.release();
    };
    return response;
};

/**
 * Поиск в таблице document
 * @param {BigInt} docID - id таблицы document.
 * @returns {rows[Object.<string, string>]} Возвращает строки таблицы в виде объекта, типа: Ключ - Наименование столбца, значение - Содержимое столбца.
 */
async function find_Doc({
    docID
}) {
    let response = {};
    let res = {};
    const client = await pool.connect();
    try {
        //await client.query('drop table document');
        //return;

        if (docID) {
            res = await client.query('SELECT * FROM document WHERE id = $1', [docID]);
            response = res.rows[0];
        } else {
            res = await client.query('SELECT * FROM document');
            response = res.rows;
        };
    } catch (error) {
        console.log(error.stack);
        response.Error = error.stack;
    } finally {
        client.release();
    };
    return response;
};

/**
 * Поиск в таблице document
 * @param {BigInt} docID - id таблицы document.
 * @returns {rows[Object.<string, string>]} Возвращает строки таблицы в виде объекта, типа: Ключ - Наименование столбца, значение - Содержимое столбца.
 */
async function find_DocColumn({
    docID,
    id
}) {
    let response = {};
    let res = {};
    const client = await pool.connect();
    try {
        if (id) {
            res = await client.query('SELECT * FROM doccolumn WHERE id = $1', [id]);
            response = res.rows[0];
        };
        if (docID) {
            res = await client.query('SELECT * FROM doccolumn WHERE docID = $1', [docID]);
            response = res.rows;
        };
    } catch (error) {
        console.log(error.stack);
        response.Error = error.stack;
    } finally {
        client.release();
    };
    return response;
};

async function create({
    docID,
    docColumn = {}
}) {
    let response = {};
    let res = {};
    if (!docID) return response.Error = 'docID is null';

    let columns = '';
    let values = '';
    let variable = [];
    let id = 1;

    const client = await pool.connect();
    try {
        res = await client.query('SELECT * FROM document WHERE id = $1', [docID]);
        const docModel = res.rows[0];
        res = await client.query('SELECT * FROM doccolumn WHERE docid = $1', [docID]);
        const docColumnModel = res.rows;

        docColumnModel.forEach((row) => {
            //Пребираем объект
            Object.entries(docColumn).forEach(([key, value]) => {
                if (row.columnname == key) {
                    variable.push(value);
                    columns = columns == '' ? row.columnname : columns + ', ' + row.columnname;
                    values = values == '' ? '$' + id : values + ', ' + '$' + id;
                    id = id + 1;
                };
            });
        });
        //console.log('columns=', columns);
        //console.log('values=', values);
        //console.log('variable=', variable);

        const query = 'INSERT INTO ' + docModel.tablename + ' (' + columns + ') VALUES (' + values + ')';
        console.log('query=',query);
        await client.query(query, variable);

        res = await client.query('SELECT MAX(id) FROM ' + docModel.tablename);
        const newId = res.rows[0].max;
        //console.log('res=',res);
        const newDoc = await client.query('SELECT * FROM ' + docModel.tablename + ' WHERE id = $1', [newId]);
        response = newDoc.rows[0];
    } catch (error) {
        console.log(error.stack);
        response.Error = error.stack;
    } finally {
        client.release();
    };
    return response;
};

/**
 * Создание новой строки в таблице document.
 * @param {Object.<string, string>} docColumn - значения в новой строке. Ключ - Наименование столбца, значение - Содержимое столбца.
 * @returns {Object.<string, string>} Возвращает новую строку таблицы document в виде объекта, типа: Ключ - Наименование столбца, значение - Содержимое столбца.
 */
async function create_Doc({
    docColumn = {}
}) {
    let response = {};
    const client = await pool.connect();
    try {
        const doc = await client.query('SELECT MAX(id) FROM document');
        const newId = doc.rows[0].max ? Number(doc.rows[0].max) + 1 : 1;
        //console.log('newId=', newId);
        const name = docColumn.name ? docColumn.name : 'Новый_документ' + newId;
        const tableName = docColumn.tableName ? docColumn.tableName : 'newtable' + newId;
        const description = docColumn.description ? docColumn.description : '';
        const parent = docColumn.parent ? docColumn.parent : null;
        const variable = [newId, name, tableName, description, parent];

        const query = `INSERT INTO document (id, name, tableName, description, parent)
                        VALUES ($1, $2, $3, $4, $5)`;

        await client.query(query, variable);

        const newDoc = await client.query('SELECT * FROM document WHERE id = $1', [newId]);
        response = newDoc.rows[0];

        //const newDoc = await client.query('SELECT * FROM document');        
        //response = newDoc.rows;

    } catch (error) {
        console.log(error.stack);
        response.Error = error.stack;
    } finally {
        client.release();
    };
    return response;
};

/**
 * Создание новой строки в таблице docColumn.
 * @param {BigInt} docID - id таблицы document.
 * @param {Object.<string, string>} docColumn - значения в новой строке. Ключ - Наименование столбца, значение - Содержимое столбца.
 * @returns {Object.<string, string>} Возвращает новую строку таблицы docColumn в виде объекта, типа: Ключ - Наименование столбца, значение - Содержимое столбца.
 */
async function create_DocColumn({
    docID,
    docColumn = {}
}) {
    let response = {};
    const client = await pool.connect();
    if (!docID) return response.Error = 'docID is null';
    try {
        const doc = await client.query('SELECT MAX(id) FROM docColumn');
        const newId = doc.rows[0].max ? Number(doc.rows[0].max) + 1 : 1;
        //console.log('newId=', newId);
        const name = docColumn.name ? docColumn.name : 'Новый_столбец' + newId;
        const columnName = docColumn.columnName ? docColumn.columnName : 'newcolumn' + newId;
        const datatype = docColumn.datatype ? docColumn.datatype : 'TEXT';
        const description = docColumn.description ? docColumn.description : '';
        const variable = [newId, name, columnName, datatype, description, docID];

        const query = `INSERT INTO doccolumn (id, name, columnName, datatype, description, docid)
                        VALUES ($1, $2, $3, $4, $5, $6)`;

        await client.query(query, variable);

        const newDoc = await client.query('SELECT * FROM docColumn WHERE id = $1', [newId]);
        response = newDoc.rows[0];

        //const newDoc = await client.query('SELECT * FROM docColumn');        
        //response = newDoc.rows;

    } catch (error) {
        console.log(error.stack);
        response.Error = error.stack;
    } finally {
        client.release();
    };
    return response;
};



/**
 * Информация о таблице в БД
 * @param {Object.<string, string>} tableProperty - Schema, Name, docID.
 * @returns {Object.<string, string>} tableInfo: response.Exists, response.docColumn
 */
async function tableInfo(tableProperty) {
    let response = {};
    let variable = [];
    if (tableProperty.Schema) variable = [tableProperty.Name, tableProperty.Schema, ]
    else variable = [tableProperty.Name];
    let query = '';
    let resp = {};

    const client = await pool.connect();

    try {
        query = `SELECT EXISTS (
            SELECT 1
            FROM  information_schema.tables 
            WHERE table_name = $1 `;
        if (tableProperty.Schema) query = query + ' AND table_schema = $2 '
        query = query + ')';
        //console.log('query=',query, tableProperty.Name);

        //resp = await pool.query('SELECT * FROM  information_schema.tables');
        //console.log('resp=', resp.rows);

        resp = await pool.query(query, variable);
        //console.log('resp=', resp.rows[0]);

        response.Exists = resp.rows[0].exists;

        if (response.Exists) {
            query = `SELECT column_name, column_default, is_nullable, data_type
                FROM  information_schema.columns 
                WHERE table_name = $1 `;
            if (tableProperty.Schema) query = query + ' AND table_schema = $2'
            resp = await pool.query(query, variable);
            //console.log('resp=',resp.rows);
            response.docColumn = resp.rows;
        }
    } catch (error) {
        console.log(error.stack);
        response.Error = error.stack;
    } finally {
        client.release();
    };
    return response;
};

/**
 * Работа с объектами в БД
 * @param {string} Type - тип объекта: table, view.
 * @param {string} Name - наименование объекта.
 * @param {string} Method - метод изменения: create, alter, drop.
 * @param {rows[Object.<string, string>]} docColumn - значения объекта. Ключ - Наименование, значение - Содержимое.
 * @returns {Object.<string, string>} - информация: Message или Error.
 */
async function entityChange({
    Type,
    Name,
    Method,
    docColumn
}) {
    let response = {};
    let resp = {};
    let query = '';
    if (!Name) return response.Error = 'Name is null';

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        if (Method == 'create') {
            if (Type == 'table') {
                query = 'CREATE TABLE ' + Name + ' ( id BIGSERIAL PRIMARY KEY )';
                resp = await pool.query(query);
                //console.log('resp=', resp);
                response.Message = 'SUCCESSFULLY: ' + query;

                //Если есть docColumn
                if (docColumn) {
                    for await (const column of docColumn) {
                        const _columnGet = await columnGet(column);
                        if (_columnGet.Error) throw new UserException(_columnGet.Error);
                        query = 'ALTER TABLE ' + Name + ' ADD COLUMN ' + _columnGet.column;
                        console.log('query=', query);
                        resp = await pool.query(query);
                        //console.log('resp=', resp);
                        response.Message = 'SUCCESSFULLY: ' + query;
                    };
                };
            };
        };
        if (Method == 'alter') {
            if (Type == 'table') {
                //Если есть docColumn
                if (docColumn) {
                    for await (const column of docColumn) {
                        const _columnGet = columnGet(column);
                        if (_columnGet.Error) throw new UserException(_columnGet.Error);
                        query = 'ALTER TABLE ' + Name + ' ADD COLUMN ' + _columnGet.column;
                        console.log('query=', query);
                        //resp = await pool.query(query);
                        //console.log('resp=', resp);
                        response.Message = 'SUCCESSFULLY: ' + query;
                    };
                };
            };
        };

        await client.query('COMMIT');
    } catch (error) {
        console.log(error.stack);
        response.Error = error.stack;
        await client.query('ROLLBACK');
    } finally {
        client.release();
    };
    return response;
};

function UserException(message) {
    this.message = message;
    this.stack = message;
    this.name = "Исключение, определённое пользователем";
}

/**
 * Возвращает описание полей через запятую
 * @param {Object.<string, string>} docColumn - массив объектов с опиманием полей
 * @returns {Object.<string, string>} - response.Error или response.column
 */
function columnGet(column) {
    let response = {};
    if (!column) return response.Error = 'docColumn is null';

    const columnName = column.columnName;
    if (!columnName) return response.Error = 'columnName is null';

    const dataType = column.dataType;
    if (!dataType) return response.Error = 'dataType is null';

    let allowNull = 'true'; // По умолчанию true
    if (column.allowNull === undefined) allowNull = 'true'
    else if (!column.allowNull) allowNull = 'false';
    if (allowNull == 'false') allowNull = ' NOT NULL '
    else allowNull = ' NULL ';

    let _default = column.default ? 'default ' + column.default : '';

    let unique = 'false'; //По умолчанию false
    if (column.unique === undefined) unique = 'false'
    else if (column.unique) unique = 'true';
    if (unique == 'true') unique = ' UNIQUE '
    else unique = '';

    unique = _default ? '' : unique; //Поля взаимоисключающие

    let references = ' ';
    if (column.references) {
        references = ' REFERENCES ' + column.references + ' ';
        allowNull = '';
        _default = '';
        unique = '';
    };

    const query = columnName + ' ' + dataType + references + allowNull + unique + _default;
    //console.log('query=', query);
    response.column = query;

    return response;
};



module.exports = {
    findByID,
    findAll,
    create,
    find_Doc,
    find_DocColumn,
    create_Doc,
    create_DocColumn,
    tableInfo,
    entityChange,
};


/*
module.exports.getDocument = async ({
    docID,
    id
}) => {
    let response;
    try {
        let docs = [];
        const docModel = await prisma.document.findUnique({
            where: {
                id: Number(docID),
            },
        });
        //console.log('docModel=', docModel);

        const docModelName = docModel.tableName;
        if (!id) {
            docs = await prisma[docModelName].findMany();
        };
        console.log('docs=', docs);

        //Преобразуем JSON в текст
        response = JSON.stringify(resp);

    } catch (error) {
        console.error(error);
        response.Error = error;
    } finally {
        async () => {
            await prisma.$disconnect();
        };
    };
};



module.exports.get = async ( {    docModelName,    where,    columns}) => {
    let response = {};

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const queryText = 'SELECT NOW() as now';
        const res = await client.query(queryText);
        console.log('res=', res.rows[0]);
        //const queryText = 'INSERT INTO users(name) VALUES($1) RETURNING id'
        ///const res = await client.query(queryText, ['brianc'])
        //const insertPhotoText = 'INSERT INTO photos(user_id, photo_url) VALUES ($1, $2)'
        ////const insertPhotoValues = [res.rows[0].id, 's3.bucket.foo']
        //await client.query(insertPhotoText, insertPhotoValues)
        await client.query('COMMIT');
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    };
     
    
    
    
    
    try {
        let docs = [];
        if (where && columns) {
            docs = await prisma[docModelName].findMany({
                where,
                select: columns
            });
        } else if (where) {
            docs = await prisma[docModelName].findMany({
                where
            });
        } else if (columns) {
            docs = await prisma[docModelName].findMany({
                select: columns
            });
        } else docs = await prisma[docModelName].findMany();

        // console.dir(docs, {depth: null});

        let resp = []
        docs.forEach((row) => {
            resp.push( //Собираем в массив объектов
                Object.fromEntries( // преобразовать в массив, затем map, затем fromEntries обратно объект
                    Object.entries(row).map(([key, value]) => [key, value ? value.toString() : value]) // Значения превращаем в строку .toString()
                ))
        });

        //console.log('resp=', resp);
        response = resp;


    } catch (error) {
        console.error(error);
        response.Error = error;
    } finally {
        async () => {
            await prisma.$disconnect();
        };
    };

    return response;
};
*/
/*
module.exports.create = async ({
    docModelName,
    docID,
    docColumns
}) => {
    let response = {};
    let _data = {};

    //console.log('docColumns=',docColumns);
    try {
        if (docModelName == 'document') {
            if (!docColumns) {
                //Ищем максимальный id
                const getMaxId = await prisma.document.findMany({
                    take: 1,
                    orderBy: {
                        id: "desc"
                    }
                });

                const maxId = (Number(getMaxId[0] ? getMaxId[0].id : 0) + 1).toString();

                _data = {
                    name: 'Новый документ' + maxId,
                    tableName: 'newTable' + maxId,
                    createdAt: new Date()
                };

                let resp = await prisma[docModelName].create({
                    data: _data
                });
            } else {
                for (const row of docColumns) {
                    _data = {
                        name: row.name,
                        tableName: row.tableName,
                        description: row.description,
                        parent: row.parent ? Number(row.parent) : null
                    };
                    //console.log('_data=', _data);
                    let resp = await prisma.document.update({
                        where: {
                            id: Number(row.id)
                        },
                        data: _data
                    });
                    //console.log('resp=', resp);
                };
            };
        };

        if (docModelName == 'docColumn') {
            //Дообогащаем объект _data
            //Object.keys(data).forEach((key) => _data[key] = data[key]);
            //console.log('_data=', _data);

            //Ищем максимальный id
            if (!docColumns) {
                const getMaxId = await prisma.docColumn.findMany({
                    take: 1,
                    orderBy: {
                        id: "desc"
                    }
                });

                const maxId = (Number(getMaxId[0] ? getMaxId[0].id : 0) + 1).toString();

                _data = {
                    name: 'Новое поле' + maxId,
                    columnName: 'newColumn' + maxId,
                    dataTypes: 'String',
                    createdAt: new Date(),
                    documentID: Number(docID)
                };
                const resp = await prisma.docColumn.create({
                    data: _data
                });
                //console.log('resp=', resp);
            } else {
                for (const row of docColumns) {
                    _data = {
                        name: row.name,
                        columnName: row.columnName,
                        dataTypes: row.dataTypes,
                        description: row.description,
                        documentID: Number(docID)
                    };
                    //console.log('_data=', _data);
                    let resp = await prisma.docColumn.update({
                        where: {
                            id: Number(row.id)
                        },
                        data: _data
                    });
                    //console.log('resp=', resp);
                };
            };
        };

    } catch (error) {
        console.error(error);
        response.Error = error;
    } finally {
        async () => {
            await prisma.$disconnect();
        };
    };

    return response;
};

module.exports.delete = async ({
    docModelName,
    docID,
    id
}) => {
    let response = {};
    //Превращаем в массив
    const arrID = id.split(',');

    try {
        for (const _id of arrID) {
            //console.log('_id=', _id);
            const del = await prisma[docModelName].delete({
                where: {
                    id: Number(_id)
                },
            });
            console.log('del=', del);
        };
    } catch (error) {
        console.error(error);
        response.Error = error;
    } finally {
        async () => {
            await prisma.$disconnect();
        };
    };
    return response;
};

*/
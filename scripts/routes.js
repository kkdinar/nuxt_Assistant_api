const pg = require('./pg.js');
const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

module.exports.get_api = (ctx) => {
    ctx.body =
        `<html>
    <head>
     <meta http-equiv="content-type" content="text/html; charset=utf-8">
     <title>Ассистент сервер</title>
    </head>
    <body>
     <p>"Ассистент - удобный доступ к Вашим данным"</p>
     <p>"Сервер Ассистент запущен"</p>
     <p><a href="api">Тест get</a></p>
     <p><a href="migrateDB">Создание таблиц</a></p>
     <!--
     <p><a href="testDbConnection">Тест подключения к базе</a></p>
      -->
    </body>
   </html>`
};

module.exports.get = async (ctx) => {
    console.log('get.query=', ctx.query);
    let type = ctx.query.type; //Тип окна
    let docID = ctx.query.docID; //id таблицы Documents
    let id = ctx.query.id; //id таблицы
    let response = {};
    let where = {};

    
    //response = await pg.create({
    //    docID:1,
    //    docColumn: {newcolumn1:'newcolumn1',newcolumn3:'newcolumn3'}
    //});
    response = await pg.findByID({docID:1,id:3});
    
    //response = await pg.findAll({docID:1});

    //Преобразуем JSON в текст
    ctx.response.body = JSON.stringify(response);
    return;

    switch (type) {
        case 'documentConstructor':
            if (docID) where.id = Number(docID);
            response = await prisma.get({
                docModelName: 'document',
                where
            });
            break;

        case 'documentConstructorColumn':
            where.documentID = Number(docID);
            response = await prisma.get({
                docModelName: 'docColumn',
                where
            });
            break;

        case 'docJournal':
            let columns = {
                id: true,
                name: true
            };
            response = await prisma.get({
                docModelName: 'document',
                columns
            });
            break;

        case 'document':
            response = await prisma.getDocument({
                docID,
                id
            });
            console.log('response=', response);
            break;

        default:
            response.Error = 'Error, dont find type';
            break;
    };
    //Преобразуем JSON в текст
    ctx.response.body = JSON.stringify(response);
};


module.exports.post = async (ctx) => {
    console.log("post_body:", ctx.request.body);
    let type = ctx.request.body.type; //Тип окна
    let docID = ctx.request.body.docID; //id таблицы Documents
    let docColumns = ctx.request.body.docColumns; //{} с полями и их значениями
    let response = {};

    switch (type) {
        case 'documentConstructor':
            response = await prisma.create({
                docModelName: 'document',
                docID,
                docColumns
            });
            break;

        case 'documentConstructorColumn':
            response = await prisma.create({
                docModelName: 'docColumn',
                docID,
                docColumns
            });
            break;

        default:
            response.Error = 'Error, dont find type';
            break;
    };
    //console.log('response=', response);
    ctx.response.body = response;
};


module.exports.delete = async (ctx) => {
    console.log("delete.query:", ctx.query);
    let type = ctx.query.type; //Тип окна docID
    let docID = ctx.query.docID; //id таблицы Documents
    let id = ctx.query.id; //id через запятую
    let response = {};

    switch (type) {
        case 'documentConstructor':
            response = await prisma.delete({
                docModelName: 'document',
                docID,
                id
            });
            break;

        case 'documentConstructorColumn':
            response = await prisma.delete({
                docModelName: 'docColumn',
                docID,
                id
            });
            break;

        default:
            response.error = 'Error, dont find type';
            break;
    };
    console.log("delete_response:", response);
    ctx.response.body = response;
};

module.exports.migrateDB = async (ctx) => {
    let response = [];
    //Проверяем есть ли таблица document в базе
    let tableProperty = {
        Name: 'document'
    };
    let TableInfo = await pg.tableInfo(tableProperty);
    //console.log('TableInfo=', TableInfo);
    let docColumn = [];
    //Если таблицы нет - создаём
    if (!TableInfo.Exists) {
        docColumn[0] = {
            columnName: 'name',
            dataType: 'text',
            allowNull: false
        };
        docColumn[1] = {
            columnName: 'tablename',
            dataType: 'text',
            allowNull: false,
            unique: true
        };
        docColumn[2] = {
            columnName: 'description',
            dataType: 'text',
        };
        docColumn[3] = {
            columnName: 'parent',
            dataType: 'bigint',
        };
        docColumn[4] = {
            columnName: 'createdat',
            dataType: 'timestamp',
            allowNull: false,
            default: ' NOW() '
        };
        docColumn[5] = {
            columnName: 'updatedat',
            dataType: 'timestamp',
            allowNull: false,
            default: ' NOW() '
        };
        let Entity = {
            Type: 'table',
            Name: 'document',
            Method: 'create',
            docColumn
        };

        let EntityChange = await pg.entityChange(Entity);
        console.log('EntityChange=', EntityChange);
    };

    //Проверяем есть ли таблица docColumn в базе
    tableProperty = {
        Name: 'doccolumn'
    };
    TableInfo = await pg.tableInfo(tableProperty);
    //console.log('TableInfo=', TableInfo);
    docColumn = [];
    //Если таблицы нет - создаём
    if (!TableInfo.Exists) {
        docColumn[0] = {
            columnName: 'name',
            dataType: 'text',
            allowNull: false
        };
        docColumn[1] = {
            columnName: 'columnname',
            dataType: 'text',
            allowNull: false
        };
        docColumn[2] = {
            columnName: 'datatype',
            dataType: 'text',
            allowNull: false
        };
        docColumn[3] = {
            columnName: 'description',
            dataType: 'text',
        };
        docColumn[4] = {
            columnName: 'createdat',
            dataType: 'timestamp',
            allowNull: false,
            default: ' NOW() '
        };
        docColumn[5] = {
            columnName: 'updatedat',
            dataType: 'timestamp',
            allowNull: false,
            default: ' NOW() '
        };
        docColumn[6] = {
            columnName: 'docid',
            dataType: 'bigserial',
            allowNull: false,
            references: 'document (id)'
        };
        let Entity = {
            Type: 'table',
            Name: 'doccolumn',
            Method: 'create',
            docColumn
        };

        let EntityChange = await pg.entityChange(Entity);
        console.log('EntityChange=', EntityChange);
    };

    const docModels = await pg.find_Doc({});

    for await (const docModel of docModels) {
        console.log('docModel.tablename=', docModel.tablename);
        const docID = docModel.id;
        const docColumnModels = await pg.find_DocColumn({
            docID
        });
        tableProperty = {
            Name: docModel.tablename
        };
        TableInfo = await pg.tableInfo(tableProperty);
        console.log('TableInfo=', TableInfo);
        //Если таблицы нет - создаём
        if (!TableInfo.Exists) {
            const Entity = {
                Type: 'table',
                Name: docModel.tablename,
                Method: 'create'
            };
            const EntityChange = await pg.entityChange(Entity);
            console.log('EntityChange=', EntityChange);
            response.push(EntityChange);
        };
        
        for await (const docColumnModel of docColumnModels) {
            console.log('docColumnModel=', docColumnModel.columnname);
            const haveColumn = TableInfo.docColumn.some(row => row.column_name == docColumnModel.columnname);
            console.log('haveColumn=', haveColumn);
            docColumn = [];
            //Если столбца нет - создаём
            if (!haveColumn) {
                docColumn.push({
                    columnName: docColumnModel.columnname,
                    dataType: docColumnModel.datatype
                });
                const Entity = {
                    Type: 'table',
                    Name: docModel.tablename,
                    Method: 'alter',
                    docColumn
                };
                const EntityChange = await pg.entityChange(Entity);
                console.log('EntityChange=', EntityChange);
                response.push(EntityChange);
            };
        };
    };
    //Преобразуем JSON в текст
    ctx.response.body = JSON.stringify(response);
};
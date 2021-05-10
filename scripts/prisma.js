const {
    PrismaClient
} = require('@prisma/client');
const prisma = new PrismaClient();

module.exports.get = async ({
    docModelName,
    where,
    columns
}) => {
    let response = {};

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

    return response;
};


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
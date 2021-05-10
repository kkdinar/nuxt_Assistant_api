const prisma = require('./prisma.js');

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
     <!--
     <p><a href="testDbConnection">Тест подключения к базе</a></p>
     <p><a href="createDB">Создание служебных таблиц</a></p> -->
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

        default:
            response.Error = 'Error, dont find type';
            break;
    };

    //console.log('response=', response);
    ctx.response.body = response;
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
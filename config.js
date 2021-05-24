//app.listen()
module.exports.main_port = 3001;

module.exports.dbConfig ={
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'assistant',
    port: 5432,
  }

//Подключение к БД sqlite3/main.db Windows
/*module.exports.dbConfig = {
    dialect: 'sqlite',
    storage: './sqlite/main.db'
};
*/

//npx prisma migrate - помощь
//npx prisma migrate reset - всё сбросить
//npx prisma migrate dev - применить изменения
//npx prisma migrate deploy - работа в продакшене

//sendMail Настройки отправки почты, от имени кого отправлять
module.exports.sendMail_host = 'smtp.yandex.ru';
module.exports.sendMail_port = 465;
module.exports.sendMail_secure = true;
module.exports.sendMail_user = "kkdinar@yandex.ru";
module.exports.sendMail_pass = "q*159753";

//Телеграмм БОТ workAssistantBot
module.exports.bot_chat_id = '1428565883';
module.exports.bot_token = '1428565883:AAEaSPndJe4RC3-dF-YQ-lsYTfX_1I7IYQ8';
//400738545 Хабибуллин chat_id 
module.exports.kdinar_chat_id = '400738545';
//Группа Башпринт Ассистент
module.exports.group_chat_id = '-431221987';

//Мэппинг docID таблиц
module.exports.docID = {
    'Пользователи': 1,
    'Группы товаров': 2,
    'Товары': 3,
    'Клиенты': 4,
    'Корзина': 5,
    'Настройки': 6,
    'Группы услуг': 7,
    'Услуги': 8,
    'Заявки': 9,
    'Информирование': 10,
    'Информирование, группы рассылки': 11,
    'Группы': 12,
    'Данные групп': 13,
    'Номенклатура': 14,
    'Группы номенклатуры': 15,
    'Файлы': 16
};

//Мэппинг способов Информирования //Тип информирования
module.exports.informType = {
    0: 'Email',
    1: 'Telegram',
    2: 'SMS',
    3: 'VK',
    4: 'Instagram',
    5: 'Viber'
};
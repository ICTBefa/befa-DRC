const mysql = require('mysql');
const dbWrapper = require('./databaseWrapper');

const config = {
    local: {
        connectionLimit: 10,
        host: process.env.DB_HOST_LOCAL,
        port: process.env.DB_PORT_LOCAL || 3306,
        user: process.env.DB_USER_LOCAL,
        password: process.env.DB_PASSWORD_LOCAL,
        database: process.env.DB_DATABASE_LOCAL,
        charset: process.env.DB_CHARSET_LOCAL,
        supportBigNumbers: true,
        multipleStatements :true
    }
};


const db = {
    local: new dbWrapper(mysql.createPool(config.local))
};
module.exports = db;

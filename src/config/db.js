'use strict';

const mysql2 = require('mysql2')

const connection = mysql2.createConnection({
    host: 'database-hexam.cedili81rqar.ap-south-1.rds.amazonaws.com',
    port: '3305',
    user: 'admin',
    password: '123456789',
    database: 'hexamdb'
});

module.exports = connection;
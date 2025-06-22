const mysql = require('mysql')

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    connectionLimit: 10,
    authPlugin: 'mysql_native_password'
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err.code);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('La conexión a la base de datos fue perdida.');
        } else if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Demasiadas conexiones a la base de datos.');
        } else if (err.code === 'ECONNREFUSED') {
            console.error('Conexión a la base de datos rechazada.');
        }
        return;
    }
    if (connection) {
        connection.release();
        console.log('Se logro conectarse a la base de datos');
    }
});

module.exports = pool;
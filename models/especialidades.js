// Conexion a la base de datos
const connection = require('../config/database');

// Función para listar todas las especialidades
const listar = (callback) => {
    const query = 'SELECT * FROM Especialidades ORDER BY nombre_especialidad';
    connection.query(query, [], (error, results) => {
        if (error) {
            return callback(error, null);
        }
        callback(null, results);
    });
};

// Función para agregar una nueva especialidad
const agregar = (especialidad, callback) => {
    const query = 'INSERT INTO Especialidades (nombre_especialidad) VALUES (?)';
    connection.query(query, [especialidad.nombre_especialidad], (error, results) => {
        if (error) {
            return callback(error);
        }
        callback(null, results);
    });
};

// Función para actualizar una especialidad
const actualizar = (especialidad, callback) => {
    const query = 'UPDATE Especialidades SET nombre_especialidad = ? WHERE id = ?';
    const params = [especialidad.nombre_especialidad, especialidad.id];
    connection.query(query, params, (error, results) => {
        if (error) {
            return callback(error);
        }
        return callback(null, results);
    });
};

// Función para eliminar una especialidad
const eliminar = (id_especialidad, callback) => {
    const query = 'DELETE FROM Especialidades WHERE id = ?';
    connection.query(query, [id_especialidad], (error, results) => {
        if (error) {
            return callback(error);
        }
        return callback(null, results);
    });
};


module.exports = {
    listar,
    agregar,
    actualizar,
    eliminar
};
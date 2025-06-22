// models/especialidades.js

const connection = require('../config/database');

const Especialidad = {};

/**
 * Lista todas las especialidades disponibles.
 * @param {function} callback - Función de callback (error, resultados).
 */
Especialidad.listar = (callback) => {
    const query = 'SELECT * FROM Especialidades ORDER BY nombre_especialidad';
    connection.query(query, (error, results) => {
        if (error) {
            return callback(error, null);
        }
        callback(null, results);
    });
};

/**
 * Agrega una nueva especialidad.
 * @param {object} especialidadData - Datos de la especialidad (nombre_especialidad).
 * @param {function} callback - Función de callback (error, resultado).
 */
Especialidad.agregar = (especialidadData, callback) => {
    const query = 'INSERT INTO Especialidades (nombre_especialidad) VALUES (?)';
    connection.query(query, [especialidadData.nombre_especialidad], (error, results) => {
        if (error) {
            return callback(error);
        }
        callback(null, results);
    });
};

/**
 * Actualiza una especialidad existente.
 * @param {number} id - El ID de la especialidad.
 * @param {object} especialidadData - Los nuevos datos.
 * @param {function} callback - Función de callback (error, resultado).
 */
Especialidad.actualizar = (id, especialidadData, callback) => {
    const query = 'UPDATE Especialidades SET nombre_especialidad = ? WHERE id = ?';
    const params = [especialidadData.nombre_especialidad, id];
    connection.query(query, params, (error, results) => {
        if (error) {
            return callback(error);
        }
        return callback(null, results);
    });
};

/**
 * Elimina una especialidad de la base de datos.
 * @param {number} id - El ID de la especialidad a eliminar.
 * @param {function} callback - Función de callback (error, resultado).
 */
Especialidad.eliminar = (id, callback) => {
    const query = 'DELETE FROM Especialidades WHERE id = ?';
    connection.query(query, [id], (error, results) => {
        if (error) {
            return callback(error);
        }
        return callback(null, results);
    });
};

module.exports = Especialidad;
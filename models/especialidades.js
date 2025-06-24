// models/especialidades.js

const connection = require('../config/database');

const Especialidad = {};

/**
 * Lista todas las especialidades.
 * @param {function} callback - Callback que maneja la respuesta.
 */
Especialidad.listar = (callback) => {
    const sql = 'SELECT * FROM Especialidades ORDER BY nombre_especialidad ASC';
    connection.query(sql, callback);
};

// Función para agregar una nueva especialidad.
/**
 * Agrega una nueva especialidad a la base de datos.
 * @param {string} nombre_especialidad - El nombre de la especialidad.
 * @param {function} callback - Callback que maneja la respuesta.
 */
Especialidad.agregar = (nombre_especialidad, callback) => {
    const sql = 'INSERT INTO Especialidades (nombre_especialidad) VALUES (?)';
    connection.query(sql, [nombre_especialidad], callback);
};

// Función para actualizar una especialidad existente.
/**
 * Actualiza el nombre de una especialidad por su ID.
 * @param {number} id - El ID de la especialidad a actualizar.
 * @param {string} nombre_especialidad - El nuevo nombre para la especialidad.
 * @param {function} callback - Callback que maneja la respuesta.
 */
Especialidad.actualizar = (id, nombre_especialidad, callback) => {
    const sql = 'UPDATE Especialidades SET nombre_especialidad = ? WHERE id = ?';
    connection.query(sql, [nombre_especialidad, id], callback);
};

// Función para eliminar una especialidad.
/**
 * Elimina una especialidad por su ID.
 * @param {number} id - El ID de la especialidad a eliminar.
 * @param {function} callback - Callback que maneja la respuesta.
 */
Especialidad.eliminar = (id, callback) => {
    const sql = 'DELETE FROM Especialidades WHERE id = ?';
    connection.query(sql, [id], callback);
};


module.exports = Especialidad;
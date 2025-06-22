// models/revisiones.js

const connection = require('../config/database');

const Revision = {};

/**
 * Registra el veredicto y las observaciones de un tribunal para una revisión específica.
 * Solo actualiza si el veredicto actual es 'PENDIENTE'.
 * @param {number} idRevision - El ID de la revisión a actualizar.
 * @param {string} veredicto - El nuevo veredicto.
 * @param {string} observaciones - Las observaciones finales del tribunal.
 * @param {function} callback - Función de callback (error, resultado).
 */
Revision.registrarVeredicto = (idRevision, veredicto, observaciones, callback) => {
    const query = 'UPDATE Revisiones SET veredicto = ?, observaciones = ?, fecha_veredicto = CURRENT_TIMESTAMP WHERE id = ? AND veredicto = "PENDIENTE"';
    connection.query(query, [veredicto, observaciones, idRevision], (error, results) => {
        if (error) return callback(error);
        callback(null, results);
    });
};

module.exports = Revision;
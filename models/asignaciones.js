// models/asignaciones.js

const connection = require('../config/database');

const Asignacion = {};

/**
 * Crea las asignaciones para un tema a sus tribunales y actualiza el estado del tema.
 * @param {number} id_tema - El ID del tema.
 * @param {Array<number>} ids_tribunales - Un array con los IDs de los tribunales.
 * @param {function} callback - Función de callback (error, resultado).
 */
Asignacion.crearAsignaciones = (id_tema, ids_tribunales, callback) => {
    connection.beginTransaction(err => {
        if (err) return callback(err);

        // 1. Insertar las asignaciones
        const queryAsignaciones = 'INSERT INTO AsignacionesTemaTribunal (id_tema, id_tribunal) VALUES ?';
        const values = ids_tribunales.map(id_tribunal => [id_tema, id_tribunal]);

        connection.query(queryAsignaciones, [values], (error, results) => {
            if (error) return connection.rollback(() => callback(error));

            // 2. Actualizar el estado del tema a 'EN REVISION'
            const queryUpdateTema = 'UPDATE Temas SET estado_tema = "EN REVISION" WHERE id = ?';
            connection.query(queryUpdateTema, [id_tema], (error) => {
                if (error) return connection.rollback(() => callback(error));

                // 3. Crear registros de revisión iniciales para la primera versión del tema
                const id_version_tema = 1; // Asumimos que es la primera versión
                const asignacionIds = [];
                for (let i = 0; i < results.affectedRows; i++) {
                    asignacionIds.push(results.insertId + i);
                }

                const queryRevisiones = 'INSERT INTO Revisiones (id_asignacion, id_version_tema) VALUES ?';
                const revisionValues = asignacionIds.map(idAsignacion => [idAsignacion, id_version_tema]);
                
                connection.query(queryRevisiones, [revisionValues], (error) => {
                     if (error) return connection.rollback(() => callback(error));
                     
                     connection.commit(err => {
                        if (err) return connection.rollback(() => callback(err));
                        callback(null, results);
                    });
                });
            });
        });
    });
};

/**
 * Registra el veredicto de un tribunal para una revisión específica.
 * @param {number} id_revision - El ID de la revisión a actualizar.
 * @param {string} veredicto - El veredicto ('APROBADO', 'REVISADO', etc.).
 * @param {string} observaciones - Las observaciones finales.
 * @param {function} callback - Función de callback (error, resultado).
 */
Asignacion.registrarVeredicto = (id_revision, veredicto, observaciones, callback) => {
    const query = 'UPDATE Revisiones SET veredicto = ?, observaciones = ?, fecha_veredicto = CURRENT_TIMESTAMP WHERE id = ?';
    connection.query(query, [veredicto, observaciones, id_revision], (error, results) => {
        if (error) return callback(error);
        // La lógica para actualizar el estado general del tema se manejará en un paso posterior
        // o a través de un procedimiento almacenado para mayor robustez.
        callback(null, results);
    });
};

/**
 * Busca una asignación específica por su ID para validaciones.
 * @param {number} idAsignacion - El ID de la asignación.
 * @param {function} callback - Función de callback (error, resultado).
 */
Asignacion.buscarPorId = (idAsignacion, callback) => {
    const query = 'SELECT * FROM AsignacionesTemaTribunal WHERE id = ?';
    connection.query(query, [idAsignacion], (error, results) => {
        if (error) return callback(error, null);
        callback(null, results[0]);
    });
};

/**
 * Lista los tribunales asignados a un tema, incluyendo sus nombres.
 * @param {number} idTema - El ID del tema.
 * @param {function} callback - Función de callback (error, resultados).
 */
Asignacion.listarPorTema = (idTema, callback) => {
    const query = `
        SELECT 
            a.id as idAsignacion, 
            a.id_tribunal, 
            CONCAT(u.nombres, ' ', u.apellido_primero) as nombreTribunal,
            (SELECT r.veredicto FROM Revisiones r WHERE r.id_asignacion = a.id ORDER BY r.id DESC LIMIT 1) as ultimo_veredicto
        FROM AsignacionesTemaTribunal a 
        JOIN Usuarios u ON a.id_tribunal = u.id
        WHERE a.id_tema = ?;
    `;
    connection.query(query, [idTema], (error, results) => {
        if (error) return callback(error, null);
        callback(null, results);
    });
};

/**
 * Lista los temas asignados a un tribunal.
 * @param {number} idTribunal - El ID del tribunal.
 * @param {function} callback - Función de callback (error, resultados).
 */
Asignacion.listarPorTribunal = (idTribunal, callback) => {
    const query = `
        SELECT 
            a.id as idAsignacion,
            t.id as idTema,
            t.nombre as nombreTema, 
            t.estado_tema, 
            a.fecha_asignacion,
            (SELECT r.veredicto FROM Revisiones r WHERE r.id_asignacion = a.id ORDER BY r.id DESC LIMIT 1) as mi_veredicto
        FROM AsignacionesTemaTribunal a 
        JOIN Temas t ON a.id_tema = t.id
        WHERE a.id_tribunal = ?;
    `;
    connection.query(query, [idTribunal], (error, results) => {
        if (error) return callback(error, null);
        callback(null, results);
    });
};

module.exports = Asignacion;
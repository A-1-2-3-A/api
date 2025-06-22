// models/versiones.js

const connection = require('../config/database');

const Version = {};

/**
 * Lista todas las versiones de un tema específico.
 * @param {number} idTema - El ID del tema.
 * @param {function} callback - Función de callback (error, resultados).
 */
Version.listarPorTema = (idTema, callback) => {
    const query = 'SELECT * FROM VersionesTema WHERE id_tema = ? ORDER BY numero_version ASC';
    connection.query(query, [idTema], (error, results) => {
        if (error) {
            return callback(error, null);
        }
        callback(null, results);
    });
};

/**
 * Agrega una nueva versión de un tema y crea las revisiones pendientes para los tribunales.
 * @param {number} idTema - El ID del tema.
 * @param {string} archivoRuta - La ruta del archivo PDF de la nueva versión.
 * @param {string|null} comentariosEstudiante - Comentarios opcionales del estudiante.
 * @param {function} callback - Función de callback (error, resultado).
 */
Version.agregar = (idTema, archivoRuta, comentariosEstudiante, callback) => {
    connection.beginTransaction(err => {
        if (err) return callback(err);

        // 1. Obtener el número de la última versión para incrementarlo
        const lastVersionQuery = 'SELECT COALESCE(MAX(numero_version), 0) as max_version FROM VersionesTema WHERE id_tema = ?';
        connection.query(lastVersionQuery, [idTema], (error, results) => {
            if (error) return connection.rollback(() => callback(error));

            const nuevaVersionNum = results[0].max_version + 1;

            // 2. Insertar la nueva versión en VersionesTema
            const insertVersionQuery = 'INSERT INTO VersionesTema (id_tema, numero_version, archivo_ruta, comentarios_estudiante) VALUES (?, ?, ?, ?)';
            connection.query(insertVersionQuery, [idTema, nuevaVersionNum, archivoRuta, comentariosEstudiante], (error, versionResult) => {
                if (error) return connection.rollback(() => callback(error));

                const nuevaVersionId = versionResult.insertId;

                // 3. Actualizar el estado del tema principal a 'EN REVISION'
                const updateTemaQuery = 'UPDATE Temas SET estado_tema = "EN REVISION" WHERE id = ?';
                connection.query(updateTemaQuery, [idTema], (error) => {
                    if (error) return connection.rollback(() => callback(error));

                    // 4. Obtener todas las asignaciones de este tema para crear las nuevas revisiones
                    const getAsignacionesQuery = 'SELECT id FROM AsignacionesTemaTribunal WHERE id_tema = ?';
                    connection.query(getAsignacionesQuery, [idTema], (error, asignaciones) => {
                        if (error) return connection.rollback(() => callback(error));
                        if (asignaciones.length === 0) { // No hay tribunales asignados, solo confirmar
                            return connection.commit(err => {
                                if (err) return connection.rollback(() => callback(err));
                                callback(null, { id: nuevaVersionId });
                            });
                        }

                        // 5. Crear un nuevo registro de revisión para cada tribunal asignado
                        const queryRevisiones = 'INSERT INTO Revisiones (id_asignacion, id_version_tema, veredicto) VALUES ?';
                        const revisionValues = asignaciones.map(asig => [asig.id, nuevaVersionId, 'PENDIENTE']);
                        
                        connection.query(queryRevisiones, [revisionValues], (error) => {
                            if (error) return connection.rollback(() => callback(error));

                            connection.commit(err => {
                                if (err) return connection.rollback(() => callback(err));
                                callback(null, { id: nuevaVersionId });
                            });
                        });
                    });
                });
            });
        });
    });
};

module.exports = Version;
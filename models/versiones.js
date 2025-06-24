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
 * Agrega una nueva versión de un tema y crea la revisión pendiente para un tribunal.
 * Solo permite crearla si NO existe ya una revisión pendiente para esa asignación.
 * @param {number} idAsignacion - El ID de la asignación tribunal-tema que puso REVISADO.
 * @param {string} archivoRuta - Ruta del archivo PDF corregido.
 * @param {string|null} comentariosEstudiante - Comentarios opcionales del estudiante.
 * @param {function} callback - Función de callback (error, resultado).
 */
Version.agregar = (idAsignacion, archivoRuta, comentariosEstudiante, callback) => {
    // 0. Verificar que NO exista una revisión pendiente para esta asignación
    const queryPendiente = `
        SELECT id FROM Revisiones 
        WHERE id_asignacion = ? AND veredicto = 'PENDIENTE'
        LIMIT 1
    `;
    connection.query(queryPendiente, [idAsignacion], (err, revisiones) => {
        if (err) return callback(err);
        if (revisiones.length > 0) {
            return callback(new Error('Ya existe una revisión pendiente para este tribunal. Espera el veredicto antes de enviar otra versión.'));
        }

        // 1. Obtener el id_tema de la asignación
        const getTemaQuery = 'SELECT id_tema FROM AsignacionesTemaTribunal WHERE id = ?';
        connection.query(getTemaQuery, [idAsignacion], (err, results) => {
            if (err) return callback(err);
            if (!results.length) return callback(new Error('Asignación no encontrada'));

            const idTema = results[0].id_tema;

            // 2. Obtener el número de la última versión de este tema
            const lastVersionQuery = 'SELECT COALESCE(MAX(numero_version), 0) AS max_version FROM VersionesTema WHERE id_tema = ?';
            connection.query(lastVersionQuery, [idTema], (err, results) => {
                if (err) return callback(err);

                const nuevaVersionNum = results[0].max_version + 1;

                // 3. Insertar la nueva versión
                const insertVersionQuery = 'INSERT INTO VersionesTema (id_tema, numero_version, archivo_ruta, comentarios_estudiante) VALUES (?, ?, ?, ?)';
                connection.query(insertVersionQuery, [idTema, nuevaVersionNum, archivoRuta, comentariosEstudiante], (err, versionResult) => {
                    if (err) return callback(err);

                    const nuevaVersionId = versionResult.insertId;

                    // 4. Crear UNA revisión pendiente solo para la asignación indicada
                    const insertRevisionQuery = 'INSERT INTO Revisiones (id_asignacion, id_version_tema, veredicto) VALUES (?, ?, "PENDIENTE")';
                    connection.query(insertRevisionQuery, [idAsignacion, nuevaVersionId], (err, revisionResult) => {
                        if (err) return callback(err);

                        // 5. (Opcional) Actualizar el estado general del tema si lo deseas, o dejarlo como está
                        callback(null, { id_version: nuevaVersionId, id_revision: revisionResult.insertId });
                    });
                });
            });
        });
    });
};

/**
 * Busca una versión de un tema por su ID y verifica si el tribunal
 * tiene permiso para acceder a ella.
 * @param {number} idVersion - El ID de la versión del tema (tabla VersionesTema).
 * @param {number} idTribunal - El ID del tribunal que solicita la descarga.
 * @param {function} callback - Callback (error, resultado con la ruta del archivo).
 */
Version.buscarParaDescargaTribunal = (idVersion, idTribunal, callback) => {
    const query = `
        SELECT vt.archivo_ruta
        FROM VersionesTema vt
        JOIN Temas t ON vt.id_tema = t.id
        JOIN AsignacionesTemaTribunal a ON t.id = a.id_tema
        WHERE vt.id = ? AND a.id_tribunal = ?
        LIMIT 1;
    `;
    connection.query(query, [idVersion, idTribunal], (error, results) => {
        if (error) return callback(error, null);
        callback(null, results[0]);
    });
};

/**
 * Busca la ruta de una versión por su ID.
 * @param {number} idVersion - El ID de la versión del tema.
 * @param {function} callback - Callback (error, resultado).
 */
Version.buscarRutaPorId = (idVersion, callback) => {
    const query = 'SELECT archivo_ruta FROM VersionesTema WHERE id = ? LIMIT 1';
    connection.query(query, [idVersion], (error, results) => {
        if (error) return callback(error, null);
        callback(null, results[0]);
    });
};

Version.buscarParaDescargaEstudiante = (idVersion, idEstudiante, callback) => {
    const query = `
        SELECT vt.archivo_ruta
        FROM VersionesTema vt
        JOIN Temas t ON vt.id_tema = t.id
        WHERE vt.id = ? AND t.id_estudiante = ?
        LIMIT 1;
    `;
    connection.query(query, [idVersion, idEstudiante], (error, results) => {
        if (error) return callback(error, null);
        callback(null, results[0]);
    });
};

module.exports = Version;
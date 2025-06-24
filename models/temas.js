// models/temas.js

const connection = require('../config/database');

const Tema = {};

/**
 * Agrega un nuevo tema y su primera versión de archivo, usando una transacción.
 * @param {object} temaData - Datos del tema (nombre, id_estudiante).
 * @param {string} archivoRuta - Ruta del archivo PDF subido.
 * @param {function} callback - Función de callback (error, resultado).
 */
Tema.agregar = (temaData, archivoRuta, callback) => {
    connection.getConnection((err, conn) => {
        if (err) return callback(err);

        conn.beginTransaction(err => {
            if (err) { conn.release(); return callback(err); }

            // 1. Insertar el tema principal
            const temaQuery = 'INSERT INTO Temas (nombre, id_estudiante, estado_tema) VALUES (?, ?, ?)';
            const temaParams = [temaData.nombre, temaData.id_estudiante, 'PRELIMINAR'];

            conn.query(temaQuery, temaParams, (error, results) => {
                if (error) return conn.rollback(() => { conn.release(); callback(error); });

                const nuevoTemaId = results.insertId;

                // 2. Insertar la primera versión del tema en VersionesTema
                const versionQuery = 'INSERT INTO VersionesTema (id_tema, numero_version, archivo_ruta) VALUES (?, ?, ?)';
                const versionParams = [nuevoTemaId, 1, archivoRuta];

                conn.query(versionQuery, versionParams, (error, versionResults) => {
                    if (error) return conn.rollback(() => { conn.release(); callback(error); });

                    conn.commit(err => {
                        if (err) return conn.rollback(() => { conn.release(); callback(err); });
                        conn.release();
                        callback(null, { id: nuevoTemaId });
                    });
                });
            });
        });
    });
};

/**
 * Lista todos los temas para la vista de administradores (Director/Secretario).
 * Une la información con la tabla de usuarios para obtener el nombre del estudiante.
 * @param {function} callback - Función de callback (error, resultados).
 */
Tema.listarParaAdmin = (callback) => {
    const query = `
        SELECT
            t.id as idTema,
            t.nombre,
            t.estado_tema as estado,
            t.fecha_registro,
            CONCAT(u.nombres, ' ', u.apellido_primero) AS nombreEstudiante
        FROM Temas t
        JOIN Usuarios u ON t.id_estudiante = u.id
        ORDER BY t.fecha_registro DESC;
    `;
    connection.query(query, (error, results) => {
        if (error) return callback(error, null);
        callback(null, results);
    });
};

/**
 * Lista todos los temas registrados por un estudiante específico.
 * @param {number} idEstudiante - El ID del estudiante.
 * @param {function} callback - Función de callback (error, resultados).
 */
Tema.listarPorEstudiante = (idEstudiante, callback) => {
    const query = `
        SELECT
            t.id as idTema,
            t.nombre,
            t.estado_tema as estado,
            t.fecha_registro
        FROM Temas t
        WHERE t.id_estudiante = ?
        ORDER BY t.fecha_registro DESC;
    `;
    connection.query(query, [idEstudiante], (error, results) => {
        if (error) return callback(error, null);
        callback(null, results);
    });
};


/**
 * Busca un tema por su ID para obtener sus detalles completos.
 * @param {number} idTema - El ID del tema.
 * @param {function} callback - Función de callback (error, resultado).
 */
Tema.buscarDetalleCompleto = (idTema, callback) => {
    const query = `
        SELECT 
            t.id as idTema, t.nombre, t.estado_tema,
            u.id as idEstudiante, CONCAT(u.nombres, ' ', u.apellido_primero, ' ', u.apellido_segundo) as nombreEstudiante,
            a.id as idAsignacion, a.id_tribunal,
            CONCAT(ut.nombres, ' ', ut.apellido_primero) as nombreTribunal,
            r.id as idRevision, r.id_version_tema, r.veredicto, r.observaciones as observaciones_finales, r.fecha_veredicto,
            vt.numero_version, vt.archivo_ruta, vt.comentarios_estudiante
        FROM Temas t
        JOIN Usuarios u ON t.id_estudiante = u.id
        LEFT JOIN AsignacionesTemaTribunal a ON t.id = a.id_tema
        LEFT JOIN Usuarios ut ON a.id_tribunal = ut.id
        LEFT JOIN Revisiones r ON a.id = r.id_asignacion
        LEFT JOIN VersionesTema vt ON r.id_version_tema = vt.id
        WHERE t.id = ?
        ORDER BY a.id_tribunal, vt.numero_version DESC;
    `;
    connection.query(query, [idTema], (error, results) => {
        if (error) return callback(error, null);
        callback(null, results);
    });
};

/**
 * Actualiza un tema, verificando que su estado sea 'PRELIMINAR'.
 * @param {number} idTema - El ID del tema.
 * @param {object} temaData - Los datos a actualizar.
 * @param {function} callback - Función de callback (error, resultado).
 */
Tema.actualizar = (idTema, temaData, callback) => {
    const query = 'UPDATE Temas SET nombre = ? WHERE id = ? AND estado_tema = "PRELIMINAR"';
    connection.query(query, [temaData.nombre, idTema], (error, results) => {
        if (error) return callback(error);
        callback(null, results);
    });
};

/**
 * Actualiza el archivo PDF de la **primera versión** de un tema, 
 * identificada siempre con `numero_version = 1` en la tabla VersionesTema.
 * Solo debe usarse para cambios mientras el tema está en estado PRELIMINAR.
 * 
 * @param {number} idTema - El ID del tema cuyo archivo principal se actualizará.
 * @param {string} archivoRuta - Nueva ruta (en el servidor) del archivo PDF subido.
 * @param {function} callback - Función de callback (error, resultado).
 */
Tema.actualizarArchivoPrimeraVersion = (idTema, archivoRuta, callback) => {
    const query = 'UPDATE VersionesTema SET archivo_ruta = ? WHERE id_tema = ? AND numero_version = 1';
    connection.query(query, [archivoRuta, idTema], (error, results) => {
        if (error) return callback(error);
        callback(null, results);
    });
};

/**
 * Elimina un tema, verificando que su estado sea 'PRELIMINAR'.
 * @param {number} idTema - El ID del tema.
 * @param {function} callback - Función de callback (error, resultado).
 */
Tema.eliminar = (idTema, callback) => {
    const query = 'DELETE FROM Temas WHERE id = ? AND estado_tema = "PRELIMINAR"';
    connection.query(query, [idTema], (error, results) => {
        if (error) return callback(error);
        callback(null, results);
    });
};

/**
 * Busca un tema por su ID (versión simple para validaciones).
 * @param {number} id - El ID del tema.
 * @param {function} callback - Función de callback (error, resultado).
 */
Tema.buscarPorIdSimple = (id, callback) => {
    const query = 'SELECT * FROM Temas WHERE id = ?';
    connection.query(query, [id], (error, results) => {
        if (error) return callback(error, null);
        callback(null, results[0]);
    });
};

/**
 * Calcula y actualiza el estado general del tema según los ÚLTIMOS veredictos de los tribunales.
 * Reglas:
 * - EN REVISION: Falta al menos un tribunal por dar su último veredicto.
 * - REPROBADO: Al menos un tribunal puso "REPROBADO" y todos revisaron.
 * - REVISADO: Al menos uno puso "REVISADO", ninguno "REPROBADO" y todos revisaron.
 * - APROBADO: Todos pusieron "APROBADO".
 * 
 * @param {number} idTema - El ID del tema.
 * @param {function} callback - Callback (error, resultado).
 */
Tema.actualizarEstadoGeneral = (idTema, callback) => {
    // Subconsulta: obtiene solo el último veredicto de cada tribunal para este tema (usando el id más alto)
    const query = `
        SELECT
            a.id AS id_asignacion,
            (
                SELECT r.veredicto
                FROM Revisiones r
                WHERE r.id_asignacion = a.id
                ORDER BY r.fecha_veredicto DESC, r.id DESC
                LIMIT 1
            ) AS veredicto
        FROM AsignacionesTemaTribunal a
        WHERE a.id_tema = ?
        ORDER BY a.id ASC
    `;
    connection.query(query, [idTema], (err, filas) => {
        if (err) return callback(err);

        let sinVeredicto = 0;
        let tieneReprobado = false;
        let tieneRevisado = false;
        let todosAprobado = true;

        filas.forEach(row => {
            if (!row.veredicto || row.veredicto === 'PENDIENTE') {
                sinVeredicto++;
                todosAprobado = false;
            } else if (row.veredicto === 'REPROBADO') {
                tieneReprobado = true;
                todosAprobado = false;
            } else if (row.veredicto === 'REVISADO') {
                tieneRevisado = true;
                todosAprobado = false;
            } else if (row.veredicto !== 'APROBADO') {
                todosAprobado = false;
            }
        });

        let estadoNuevo;
        if (sinVeredicto > 0) {
            estadoNuevo = 'EN REVISION';
        } else if (tieneReprobado) {
            estadoNuevo = 'REPROBADO';
        } else if (tieneRevisado) {
            estadoNuevo = 'REVISADO';
        } else if (todosAprobado) {
            estadoNuevo = 'APROBADO';
        } else {
            estadoNuevo = 'EN REVISION';
        }

        // Si el nuevo estado es APROBADO, también actualiza la fecha_aprobacion (una sola vez)
        let updateQuery;
        let updateParams;

        if (estadoNuevo === 'APROBADO') {
            // Solo establece fecha_aprobacion si está en NULL (primera vez que aprueba)
            updateQuery = 'UPDATE Temas SET estado_tema = ?, fecha_aprobacion = IFNULL(fecha_aprobacion, CURDATE()) WHERE id = ?';
            updateParams = [estadoNuevo, idTema];
        } else {
            updateQuery = 'UPDATE Temas SET estado_tema = ? WHERE id = ?';
            updateParams = [estadoNuevo, idTema];
        }

        connection.query(updateQuery, updateParams, (error, results) => {
            if (error) return callback(error);
            callback(null, { estado: estadoNuevo, resultados: results });
        });
    });
};

/**
 * Busca el ID y la ruta del archivo de la primera versión de un tema.
 * @param {number} idTema - El ID del tema.
 * @param {function} callback - Función de callback (error, resultado).
 */
Tema.buscarArchivoPrimeraVersion = (idTema, callback) => {
    const query = 'SELECT id, archivo_ruta FROM VersionesTema WHERE id_tema = ? AND numero_version = 1 LIMIT 1';
    connection.query(query, [idTema], (error, results) => {
        if (error) return callback(error, null);
        callback(null, results[0]);
    });
};

module.exports = Tema;
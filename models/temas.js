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
        ORDER BY a.id_tribunal, vt.numero_version;
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


module.exports = Tema;
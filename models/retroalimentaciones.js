// models/retroalimentaciones.js

const connection = require('../config/database');

const Retroalimentacion = {};

/**
 * Agrega un comentario de un tribunal para una versión específica.
 * @param {number} idAsignacion - ID de la asignación Tema-Tribunal.
 * @param {number} idVersionTema - ID de la versión del tema (revisión).
 * @param {string} textoComentario - Contenido del comentario.
 * @param {function} callback - Callback (error, resultado).
 */
Retroalimentacion.agregarComentario = (idAsignacion, idVersionTema, textoComentario, callback) => {
    const query = 'INSERT INTO ComentariosTema (id_asignacion, id_version_tema, texto_comentario) VALUES (?, ?, ?)';
    connection.query(query, [idAsignacion, idVersionTema, textoComentario], (error, results) => {
        if (error) return callback(error);
        callback(null, results);
    });
};

/**
 * Agrega un archivo de retroalimentación a una versión específica.
 * @param {number} idAsignacion - ID de la asignación Tema-Tribunal.
 * @param {number} idVersionTema - ID de la versión del tema.
 * @param {string} archivoRuta - Ruta del archivo subido.
 * @param {string|null} descripcion - Descripción opcional del archivo.
 * @param {function} callback - Callback (error, resultado).
 */
Retroalimentacion.agregarArchivo = (idAsignacion, idVersionTema, archivoRuta, descripcion, callback) => {
    const query = 'INSERT INTO RetroalimentacionesTema (id_asignacion, id_version_tema, archivo_retroalimentacion_ruta, descripcion) VALUES (?, ?, ?, ?)';
    connection.query(query, [idAsignacion, idVersionTema, archivoRuta, descripcion], (error, results) => {
        if (error) return callback(error);
        callback(null, results);
    });
};

/**
 * Lista comentarios y archivos de retroalimentación para una asignación y versión específica.
 * @param {number} idAsignacion
 * @param {number} idVersionTema
 * @param {function} callback
 */
Retroalimentacion.listarPorAsignacionYVersion = (idAsignacion, idVersionTema, callback) => {
    const response = {
        comentarios: [],
        archivos: []
    };

    const queryComentarios = `
        SELECT id, texto_comentario, fecha_publicacion 
        FROM ComentariosTema 
        WHERE id_asignacion = ? AND id_version_tema = ?
        ORDER BY fecha_publicacion ASC
    `;
    connection.query(queryComentarios, [idAsignacion, idVersionTema], (err, comentarios) => {
        if (err) return callback(err);
        response.comentarios = comentarios;

        const queryArchivos = `
            SELECT id, archivo_retroalimentacion_ruta, descripcion, fecha_carga 
            FROM RetroalimentacionesTema 
            WHERE id_asignacion = ? AND id_version_tema = ?
            ORDER BY fecha_carga ASC
        `;
        connection.query(queryArchivos, [idAsignacion, idVersionTema], (err, archivos) => {
            if (err) return callback(err);
            response.archivos = archivos.map(archivo => ({
                ...archivo,
                nombre: archivo.archivo_retroalimentacion_ruta.split('/').pop()
            }));
            callback(null, response);
        });
    });
};

module.exports = Retroalimentacion;
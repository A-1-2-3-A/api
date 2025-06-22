// models/retroalimentaciones.js

const connection = require('../config/database');

const Retroalimentacion = {};

/**
 * Agrega un comentario de un tribunal a una asignación específica.
 * @param {number} idAsignacion - El ID de la asignación (vínculo tema-tribunal).
 * @param {string} textoComentario - El contenido del comentario.
 * @param {function} callback - Función de callback (error, resultado).
 */
Retroalimentacion.agregarComentario = (idAsignacion, textoComentario, callback) => {
    const query = 'INSERT INTO ComentariosTema (id_asignacion, texto_comentario) VALUES (?, ?)';
    connection.query(query, [idAsignacion, textoComentario], (error, results) => {
        if (error) return callback(error);
        callback(null, results);
    });
};

/**
 * Agrega un archivo de retroalimentación subido por un tribunal.
 * @param {number} idAsignacion - El ID de la asignación.
 * @param {string} archivoRuta - La ruta donde se guardó el archivo en el servidor.
 * @param {string|null} descripcion - Una descripción opcional del archivo.
 * @param {function} callback - Función de callback (error, resultado).
 */
Retroalimentacion.agregarArchivo = (idAsignacion, archivoRuta, descripcion, callback) => {
    const query = 'INSERT INTO RetroalimentacionesTema (id_asignacion, archivo_retroalimentacion_ruta, descripcion) VALUES (?, ?, ?)';
    connection.query(query, [idAsignacion, archivoRuta, descripcion], (error, results) => {
        if (error) return callback(error);
        callback(null, results);
    });
};

/**
 * Lista todos los comentarios y archivos de retroalimentación para una asignación.
 * @param {number} idAsignacion - El ID de la asignación.
 * @param {function} callback - Función de callback (error, resultado).
 */
Retroalimentacion.listarPorAsignacion = (idAsignacion, callback) => {
    const response = {
        comentarios: [],
        archivos: []
    };
    
    const queryComentarios = 'SELECT id, texto_comentario, fecha_publicacion FROM ComentariosTema WHERE id_asignacion = ? ORDER BY fecha_publicacion ASC';
    connection.query(queryComentarios, [idAsignacion], (err, comentarios) => {
        if (err) return callback(err);
        response.comentarios = comentarios;

        const queryArchivos = 'SELECT id, archivo_retroalimentacion_ruta, descripcion, fecha_carga FROM RetroalimentacionesTema WHERE id_asignacion = ? ORDER BY fecha_carga ASC';
        connection.query(queryArchivos, [idAsignacion], (err, archivos) => {
            if (err) return callback(err);
            response.archivos = archivos.map(archivo => ({
                ...archivo,
                nombre: archivo.archivo_retroalimentacion_ruta.split('/').pop() // Extrae el nombre del archivo de la ruta
            }));
            callback(null, response);
        });
    });
};

module.exports = Retroalimentacion;
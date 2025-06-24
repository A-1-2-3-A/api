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

/**
 * Busca un archivo de retroalimentación por su ID y verifica si pertenece
 * a un tema del estudiante especificado.
 * @param {number} idRetroalimentacion - El ID del archivo a descargar.
 * @param {number} idEstudiante - El ID del estudiante que solicita la descarga.
 * @param {function} callback - Callback (error, resultado con la ruta del archivo).
 */
Retroalimentacion.buscarParaDescargaEstudiante = (idRetroalimentacion, idEstudiante, callback) => {
    const query = `
        SELECT rt.archivo_retroalimentacion_ruta
        FROM RetroalimentacionesTema rt
        JOIN AsignacionesTemaTribunal a ON rt.id_asignacion = a.id
        JOIN Temas t ON a.id_tema = t.id
        WHERE rt.id = ? AND t.id_estudiante = ?
        LIMIT 1;
    `;
    connection.query(query, [idRetroalimentacion, idEstudiante], (error, results) => {
        if (error) return callback(error, null);
        // Si la consulta devuelve una fila, el estudiante tiene permiso.
        callback(null, results[0]);
    });
};

/**
 * Busca un archivo de retroalimentación y verifica que pertenezca
 * a la asignación del tribunal que lo solicita.
 * @param {number} idRetroalimentacion - El ID del archivo a descargar.
 * @param {number} idTribunal - El ID del tribunal que solicita.
 * @param {function} callback - Callback (error, resultado).
 */
Retroalimentacion.buscarParaDescargaTribunal = (idRetroalimentacion, idTribunal, callback) => {
    const query = `
        SELECT rt.archivo_retroalimentacion_ruta
        FROM RetroalimentacionesTema rt
        JOIN AsignacionesTemaTribunal a ON rt.id_asignacion = a.id
        WHERE rt.id = ? AND a.id_tribunal = ?
        LIMIT 1;
    `;
    connection.query(query, [idRetroalimentacion, idTribunal], (error, results) => {
        if (error) return callback(error, null);
        callback(null, results[0]);
    });
};

module.exports = Retroalimentacion;
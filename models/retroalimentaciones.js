// Conexion a la base de datos
const connection = require('../config/database');

// Función para agregar un comentario de un tribunal a una asignación
const agregarComentario = (id_asignacion, texto_comentario, callback) => {
    const query = 'INSERT INTO ComentariosTema (id_asignacion, texto_comentario) VALUES (?, ?)';
    connection.query(query, [id_asignacion, texto_comentario], (error, results) => {
        if (error) { return callback(error); }
        callback(null, results);
    });
};

// Función para agregar un archivo de retroalimentación de un tribunal
const agregarArchivo = (id_asignacion, archivo_ruta, descripcion, callback) => {
    const query = 'INSERT INTO RetroalimentacionesTema (id_asignacion, archivo_retroalimentacion_ruta, descripcion) VALUES (?, ?, ?)';
    connection.query(query, [id_asignacion, archivo_ruta, descripcion], (error, results) => {
        if (error) { return callback(error); }
        callback(null, results);
    });
};

// Función para listar toda la retroalimentación de una asignación
const listarPorAsignacion = (id_asignacion, callback) => {
    const response = { comentarios: [], archivos: [] };
    
    // Obtener comentarios
    const queryComentarios = 'SELECT * FROM ComentariosTema WHERE id_asignacion = ? ORDER BY fecha_publicacion DESC';
    connection.query(queryComentarios, [id_asignacion], (err, comentarios) => {
        if (err) { return callback(err); }
        response.comentarios = comentarios;

        // Obtener archivos
        const queryArchivos = 'SELECT * FROM RetroalimentacionesTema WHERE id_asignacion = ? ORDER BY fecha_carga DESC';
        connection.query(queryArchivos, [id_asignacion], (err, archivos) => {
            if (err) { return callback(err); }
            response.archivos = archivos;
            callback(null, response);
        });
    });
};

module.exports = {
    agregarComentario,
    agregarArchivo,
    listarPorAsignacion
};
// models/public.js

// Conexion a la base de datos
const connection = require('../config/database');

// Función para listar temas con estado 'APROBADO'
const listarTemasAprobados = (callback) => {
    const query = `
        SELECT t.id, t.nombre FROM Temas t WHERE t.estado_tema = 'APROBADO' ORDER BY t.nombre;
    `;
    connection.query(query, [], (error, results) => {
        if (error) { return callback(error, null); }
        callback(null, results);
    });
};

// Función para listar todos los tribunales activos con sus especialidades
const listarTribunales = (callback) => {
    const query = `
        SELECT
            u.id,
            u.nombres,
            u.apellido_primero,
            u.apellido_segundo,
            GROUP_CONCAT(e.nombre_especialidad SEPARATOR ', ') AS especialidades
        FROM Usuarios u
        LEFT JOIN UsuarioEspecialidades ue ON u.id = ue.id_usuario
        LEFT JOIN Especialidades e ON ue.id_especialidad = e.id
        WHERE u.rol IN ('Tribunal', 'Director') AND u.estado = TRUE
        GROUP BY u.id
        ORDER BY u.apellido_primero;
    `;
    connection.query(query, [], (error, results) => {
        if (error) { return callback(error, null); }
        callback(null, results);
    });
};

module.exports = {
    listarTemasAprobados,
    listarTribunales
};
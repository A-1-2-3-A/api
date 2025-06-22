// Conexion a la base de datos
const connection = require('../config/database');

// Función para agregar un nuevo tema y su primera versión de archivo
const agregar = (tema, archivo_ruta, callback) => {
    connection.beginTransaction(err => {
        if (err) { return callback(err); }

        const temaQuery = 'INSERT INTO Temas (nombre, id_estudiante, estado_tema) VALUES (?, ?, ?)';
        const temaParams = [tema.nombre, tema.id_estudiante, 'PRELIMINAR'];

        connection.query(temaQuery, temaParams, (error, results) => {
            if (error) {
                return connection.rollback(() => { callback(error); });
            }

            const nuevoTemaId = results.insertId;
            const versionQuery = 'INSERT INTO VersionesTema (id_tema, archivo_ruta, numero_version) VALUES (?, ?, ?)';
            const versionParams = [nuevoTemaId, archivo_ruta, 1];

            connection.query(versionQuery, versionParams, (error, results) => {
                if (error) {
                    return connection.rollback(() => { callback(error); });
                }
                connection.commit(err => {
                    if (err) { return connection.rollback(() => { callback(err); }); }
                    callback(null, { id: nuevoTemaId });
                });
            });
        });
    });
};

// Función para listar todos los temas
const listar = (callback) => {
    const query = `
        SELECT
            t.id,
            t.nombre,
            t.estado_tema,
            t.fecha_registro_tema,
            CONCAT(u.nombres, ' ', u.apellido_primero) AS estudiante_responsable
        FROM Temas t
        JOIN Usuarios u ON t.id_estudiante = u.id
        ORDER BY t.fecha_registro_tema DESC;
    `;
    connection.query(query, [], (error, results) => {
        if (error) { return callback(error, null); }
        callback(null, results);
    });
};

// Función para buscar un tema específico por su ID
const buscarPorId = (id_tema, callback) => {
    const query = 'SELECT * FROM Temas WHERE id = ?';
    connection.query(query, [id_tema], (error, results) => {
        if (error) { return callback(error, null); }
        callback(null, results[0]);
    });
};

// Función para actualizar un tema
const actualizar = (tema, callback) => {
    const query = 'UPDATE Temas SET nombre = ?, estado_tema = ? WHERE id = ?';
    const params = [tema.nombre, tema.estado_tema, tema.id];

    connection.query(query, params, (error, results) => {
        if (error) { return callback(error); }
        return callback(null, results);
    });
};

// Función para eliminar un tema
const eliminar = (id_tema, callback) => {
    const query = 'DELETE FROM Temas WHERE id = ?';
    connection.query(query, [id_tema], (error, results) => {
        if (error) { return callback(error); }
        return callback(null, results);
    });
};

module.exports = {
    agregar,
    listar,
    buscarPorId,
    actualizar,
    eliminar
};
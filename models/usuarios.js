// models/usuarios.js

const connection = require('../config/database');
const crypto = require('crypto');

/**
 * Función de utilidad para encriptar contraseñas.
 * @param {string} password - La contraseña en texto plano.
 * @returns {string} - El hash SHA256 de la contraseña.
 */
const sha256 = (password) => {
    return crypto.createHash('sha256').update(password).digest('hex');
};

const Usuario = {};

/**
 * Lista todos los usuarios activos con su información básica.
 * @param {function} callback - Función de callback (error, resultados).
 */
Usuario.listar = (callback) => {
    const query = `
        SELECT id, usuario, nombres, apellido_primero, apellido_segundo, rol, estado 
        FROM Usuarios 
        ORDER BY apellido_primero, apellido_segundo, nombres;
    `;
    connection.query(query, (error, results) => {
        if (error) {
            return callback(error, null);
        }
        callback(null, results);
    });
};

/**
 * Busca un usuario por su ID y devuelve toda su información, incluyendo especialidades.
 * @param {number} id - El ID del usuario.
 * @param {function} callback - Función de callback (error, resultado).
 */
Usuario.buscarPorId = (id, callback) => {
    const query = `
        SELECT 
            u.id, u.usuario, u.nombres, u.apellido_primero, u.apellido_segundo, 
            u.fecha_nacimiento, u.rol, u.estado, u.tipo_estudiante,
            GROUP_CONCAT(e.id) as especialidades_ids
        FROM Usuarios u
        LEFT JOIN UsuarioEspecialidades ue ON u.id = ue.id_usuario
        LEFT JOIN Especialidades e ON ue.id_especialidad = e.id
        WHERE u.id = ?
        GROUP BY u.id;
    `;
    connection.query(query, [id], (error, results) => {
        if (error) {
            return callback(error, null);
        }
        if (results.length > 0 && results[0].especialidades_ids) {
            results[0].especialidades = results[0].especialidades_ids.split(',').map(Number);
        }
        callback(null, results[0]);
    });
};

/**
 * Agrega un nuevo usuario y, si corresponde, sus especialidades, usando una transacción.
 * @param {object} usuarioData - Los datos del usuario a agregar.
 * @param {function} callback - Función de callback (error, resultado).
 */
Usuario.agregar = (usuarioData, callback) => {
    connection.beginTransaction(err => {
        if (err) return callback(err);

        const claveEncriptada = sha256(usuarioData.clave);
        const queryUsuario = `
            INSERT INTO Usuarios (usuario, clave, nombres, apellido_primero, apellido_segundo, fecha_nacimiento, rol, tipo_estudiante)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        `;
        const paramsUsuario = [
            usuarioData.usuario,
            claveEncriptada,
            usuarioData.nombres,
            usuarioData.apellido_primero,
            usuarioData.apellido_segundo,
            usuarioData.fecha_nacimiento,
            usuarioData.rol,
            usuarioData.rol === 'Estudiante' ? usuarioData.tipo_estudiante : null
        ];

        connection.query(queryUsuario, paramsUsuario, (error, results) => {
            if (error) return connection.rollback(() => callback(error));

            const nuevoUsuarioId = results.insertId;

            if ((usuarioData.rol === 'Tribunal' || usuarioData.rol === 'Director') && Array.isArray(usuarioData.especialidades) && usuarioData.especialidades.length > 0) {
                const queryEspecialidades = 'INSERT INTO UsuarioEspecialidades (id_usuario, id_especialidad) VALUES ?';
                const valuesEspecialidades = usuarioData.especialidades.map(id_esp => [nuevoUsuarioId, id_esp]);

                connection.query(queryEspecialidades, [valuesEspecialidades], (error) => {
                    if (error) return connection.rollback(() => callback(error));
                    
                    connection.commit(err => {
                        if (err) return connection.rollback(() => callback(err));
                        callback(null, { id: nuevoUsuarioId });
                    });
                });
            } else {
                connection.commit(err => {
                    if (err) return connection.rollback(() => callback(err));
                    callback(null, { id: nuevoUsuarioId });
                });
            }
        });
    });
};

/**
 * Actualiza los datos de un usuario y sus especialidades.
 * @param {number} idUsuario - El ID del usuario a actualizar.
 * @param {object} usuarioData - Los nuevos datos del usuario.
 * @param {function} callback - Función de callback (error, resultado).
 */
Usuario.actualizar = (idUsuario, usuarioData, callback) => {
    connection.beginTransaction(err => {
        if (err) return callback(err);

        const queryUsuario = 'UPDATE Usuarios SET nombres = ?, apellido_primero = ?, apellido_segundo = ?, rol = ?, tipo_estudiante = ? WHERE id = ?';
        const paramsUsuario = [
            usuarioData.nombres,
            usuarioData.apellido_primero,
            usuarioData.apellido_segundo,
            usuarioData.rol,
            usuarioData.rol === 'Estudiante' ? usuarioData.tipo_estudiante : null,
            idUsuario
        ];
        
        connection.query(queryUsuario, paramsUsuario, (error, results) => {
            if (error) return connection.rollback(() => callback(error));

            // Si el rol es Tribunal o Director, actualizamos sus especialidades
            if (usuarioData.rol === 'Tribunal' || usuarioData.rol === 'Director') {
                const deleteQuery = 'DELETE FROM UsuarioEspecialidades WHERE id_usuario = ?';
                connection.query(deleteQuery, [idUsuario], (error) => {
                    if (error) return connection.rollback(() => callback(error));

                    if (Array.isArray(usuarioData.especialidades) && usuarioData.especialidades.length > 0) {
                        const insertQuery = 'INSERT INTO UsuarioEspecialidades (id_usuario, id_especialidad) VALUES ?';
                        const values = usuarioData.especialidades.map(id_esp => [idUsuario, id_esp]);
                        
                        connection.query(insertQuery, [values], (error) => {
                            if (error) return connection.rollback(() => callback(error));
                            
                            connection.commit(err => {
                                if (err) return connection.rollback(() => callback(err));
                                callback(null, results);
                            });
                        });
                    } else {
                        // Si no hay especialidades, solo confirmamos
                        connection.commit(err => {
                            if (err) return connection.rollback(() => callback(err));
                            callback(null, results);
                        });
                    }
                });
            } else {
                // Si no es un rol con especialidades, solo confirmamos
                connection.commit(err => {
                    if (err) return connection.rollback(() => callback(err));
                    callback(null, results);
                });
            }
        });
    });
};

/**
 * Cambia el estado de un usuario (activo/inactivo).
 * @param {number} id - El ID del usuario.
 * @param {boolean} estado - El nuevo estado (true para activo, false para inactivo).
 * @param {function} callback - Función de callback (error, resultado).
 */
Usuario.cambiarEstado = (id, estado, callback) => {
    const query = 'UPDATE Usuarios SET estado = ? WHERE id = ?';
    connection.query(query, [estado, id], (error, results) => {
        if (error) return callback(error);
        callback(null, results);
    });
};

/**
 * Verifica las credenciales para el login.
 * @param {string} usuario - El correo del usuario.
 * @param {string} clave - La contraseña en texto plano.
 * @param {function} callback - Función de callback (error, resultado).
 */
Usuario.verificarCredenciales = (usuario, clave, callback) => {
    const claveEncriptada = sha256(clave);
    const query = 'SELECT * FROM Usuarios WHERE usuario = ? AND clave = ? AND estado = TRUE';
    connection.query(query, [usuario, claveEncriptada], (error, results) => {
        if (error) return callback(error);
        callback(null, results[0]); // Devuelve el usuario encontrado o undefined
    });
};

/**
 * Actualiza la contraseña de un usuario.
 * @param {number} id - El ID del usuario.
 * @param {string} claveNueva - La nueva contraseña en texto plano.
 * @param {function} callback - Función de callback (error, resultado).
 */
Usuario.cambiarClave = (id, claveNueva, callback) => {
    const claveEncriptada = sha256(claveNueva);
    const query = 'UPDATE Usuarios SET clave = ? WHERE id = ?';
    connection.query(query, [claveEncriptada, id], (error, results) => {
        if (error) return callback(error);
        callback(null, results);
    });
};

module.exports = Usuario;
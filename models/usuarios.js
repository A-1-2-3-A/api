// models/usuarios.js

const connection = require('../config/database');
const crypto = require('crypto');

const sha256 = (password) => {
    return crypto.createHash('sha256').update(password).digest('hex');
};

const Usuario = {};

// Las funciones que no usan transacción pueden usar el pool directamente
Usuario.listar = (callback) => {
    const query = 'SELECT id, usuario, nombres, apellido_primero, apellido_segundo, rol, estado FROM Usuarios ORDER BY apellido_primero, apellido_segundo, nombres';
    connection.query(query, (error, results) => {
        if (error) return callback(error, null);
        callback(null, results);
    });
};

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
        if (error) return callback(error, null);
        if (results.length > 0 && results[0].especialidades_ids) {
            results[0].especialidades = results[0].especialidades_ids.split(',').map(Number);
        }
        callback(null, results[0]);
    });
};


Usuario.agregar = (usuarioData, callback) => {
    // 1. Obtenemos una conexión individual del pool
    connection.getConnection((err, conn) => {
        if (err) return callback(err);

        // 2. Iniciamos la transacción en la conexión individual
        conn.beginTransaction(err => {
            if (err) { conn.release(); return callback(err); }

            const claveEncriptada = sha256(usuarioData.clave);
            const queryUsuario = `INSERT INTO Usuarios (usuario, clave, nombres, apellido_primero, apellido_segundo, fecha_nacimiento, rol, tipo_estudiante) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            const paramsUsuario = [
                usuarioData.usuario, claveEncriptada, usuarioData.nombres, 
                usuarioData.apellido_primero, usuarioData.apellido_segundo, 
                usuarioData.fecha_nacimiento, usuarioData.rol, 
                usuarioData.rol === 'Estudiante' ? usuarioData.tipo_estudiante : null
            ];

            conn.query(queryUsuario, paramsUsuario, (error, results) => {
                if (error) return conn.rollback(() => { conn.release(); callback(error); });

                const nuevoUsuarioId = results.insertId;

                if ((usuarioData.rol === 'Tribunal' || usuarioData.rol === 'Director') && Array.isArray(usuarioData.especialidades) && usuarioData.especialidades.length > 0) {
                    const queryEspecialidades = 'INSERT INTO UsuarioEspecialidades (id_usuario, id_especialidad) VALUES ?';
                    const valuesEspecialidades = usuarioData.especialidades.map(id_esp => [nuevoUsuarioId, id_esp]);

                    conn.query(queryEspecialidades, [valuesEspecialidades], (error) => {
                        if (error) return conn.rollback(() => { conn.release(); callback(error); });
                        
                        conn.commit(err => {
                            if (err) return conn.rollback(() => { conn.release(); callback(err); });
                            conn.release(); // 3. Liberamos la conexión al finalizar
                            callback(null, { id: nuevoUsuarioId });
                        });
                    });
                } else {
                    conn.commit(err => {
                        if (err) return conn.rollback(() => { conn.release(); callback(err); });
                        conn.release(); // 3. Liberamos la conexión al finalizar
                        callback(null, { id: nuevoUsuarioId });
                    });
                }
            });
        });
    });
};

Usuario.actualizar = (idUsuario, usuarioData, callback) => {
    connection.getConnection((err, conn) => {
        if (err) return callback(err);

        conn.beginTransaction(err => {
            if (err) { conn.release(); return callback(err); }
            
            const queryUsuario = 'UPDATE Usuarios SET nombres = ?, apellido_primero = ?, apellido_segundo = ?, rol = ?, tipo_estudiante = ? WHERE id = ?';
            const paramsUsuario = [
                usuarioData.nombres, usuarioData.apellido_primero, usuarioData.apellido_segundo,
                usuarioData.rol, usuarioData.rol === 'Estudiante' ? usuarioData.tipo_estudiante : null, idUsuario
            ];

            conn.query(queryUsuario, paramsUsuario, (error, results) => {
                if (error) return conn.rollback(() => { conn.release(); callback(error); });

                if (usuarioData.rol === 'Tribunal' || usuarioData.rol === 'Director') {
                    const deleteQuery = 'DELETE FROM UsuarioEspecialidades WHERE id_usuario = ?';
                    conn.query(deleteQuery, [idUsuario], (error) => {
                        if (error) return conn.rollback(() => { conn.release(); callback(error); });

                        if (Array.isArray(usuarioData.especialidades) && usuarioData.especialidades.length > 0) {
                            const insertQuery = 'INSERT INTO UsuarioEspecialidades (id_usuario, id_especialidad) VALUES ?';
                            const values = usuarioData.especialidades.map(id_esp => [idUsuario, id_esp]);
                            
                            conn.query(insertQuery, [values], (error) => {
                                if (error) return conn.rollback(() => { conn.release(); callback(error); });
                                
                                conn.commit(err => {
                                    if (err) return conn.rollback(() => { conn.release(); callback(err); });
                                    conn.release();
                                    callback(null, results);
                                });
                            });
                        } else {
                            conn.commit(err => {
                                if (err) return conn.rollback(() => { conn.release(); callback(err); });
                                conn.release();
                                callback(null, results);
                            });
                        }
                    });
                } else {
                    conn.commit(err => {
                        if (err) return conn.rollback(() => { conn.release(); callback(err); });
                        conn.release();
                        callback(null, results);
                    });
                }
            });
        });
    });
};

Usuario.cambiarEstado = (id, estado, callback) => {
    connection.query('UPDATE Usuarios SET estado = ? WHERE id = ?', [estado, id], (error, results) => {
        if (error) return callback(error);
        callback(null, results);
    });
};

Usuario.verificarCredenciales = (usuario, clave, callback) => {
    const claveEncriptada = sha256(clave);
    connection.query('SELECT * FROM Usuarios WHERE usuario = ? AND clave = ? AND estado = TRUE', [usuario, claveEncriptada], (error, results) => {
        if (error) return callback(error);
        callback(null, results[0]);
    });
};

Usuario.cambiarClave = (id, claveNueva, callback) => {
    const claveEncriptada = sha256(claveNueva);
    connection.query('UPDATE Usuarios SET clave = ? WHERE id = ?', [claveEncriptada, id], (error, results) => {
        if (error) return callback(error);
        callback(null, results);
    });
};


module.exports = Usuario;
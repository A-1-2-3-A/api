// Conexion a la base de datos
const connection = require('../config/database');
const crypto = require('crypto');

// Función para encriptar contraseñas
const sha256 = (password) => {
    return crypto.createHash('sha256').update(password).digest('hex');
};

// Función para listar usuarios activos
const listar = (callback) => {
    const query = 'SELECT id, usuario, nombres, apellido_primero, apellido_segundo, rol FROM Usuarios WHERE estado = TRUE';
    connection.query(query, [], (error, results) => {
        if (error) {
            return callback(error, null);
        }
        callback(null, results);
    });
};

// Función para agregar un usuario
const agregar = (usuario, callback) => {
    connection.beginTransaction(err => {
        if (err) return callback(err);

        const claveEncriptada = sha256(usuario.clave);
        const queryUsuario = `
            INSERT INTO Usuarios (usuario, clave, nombres, apellido_primero, apellido_segundo, rol, tipo_estudiante)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const paramsUsuario = [
            usuario.usuario,
            claveEncriptada,
            usuario.nombres,
            usuario.apellido_primero,
            usuario.apellido_segundo,
            usuario.rol,
            usuario.tipo_estudiante
        ];

        connection.query(queryUsuario, paramsUsuario, (error, results) => {
            if (error) return connection.rollback(() => callback(error));

            const nuevoUsuarioId = results.insertId;

            // Si el usuario es Tribunal o Director y se proporcionan especialidades
            if ((usuario.rol === 'Tribunal' || usuario.rol === 'Director') && Array.isArray(usuario.especialidades) && usuario.especialidades.length > 0) {
                const queryEspecialidades = `
                    INSERT INTO UsuarioEspecialidades (id_usuario, id_especialidad)
                    VALUES ?
                `;
                const valuesEspecialidades = usuario.especialidades.map(id_esp => [nuevoUsuarioId, id_esp]);

                connection.query(queryEspecialidades, [valuesEspecialidades], (error) => {
                    if (error) return connection.rollback(() => callback(error));
                    connection.commit(err => {
                        if (err) return connection.rollback(() => callback(err));
                        return callback(null, { id: nuevoUsuarioId });
                    });
                });
            } else {
                // Usuario sin especialidades o no es tribunal/director
                connection.commit(err => {
                    if (err) return connection.rollback(() => callback(err));
                    return callback(null, { id: nuevoUsuarioId });
                });
            }
        });
    });
};

// Función para actualizar un usuario
const actualizar = (usuario, callback) => {
    let query = 'UPDATE Usuarios SET usuario = ?, nombres = ?, apellido_primero = ?, apellido_segundo = ?, rol = ?, tipo_estudiante = ?';
    let params = [usuario.usuario, usuario.nombres, usuario.apellido_primero, usuario.apellido_segundo, usuario.rol, usuario.tipo_estudiante];

    if (usuario.clave) {
        query += ', clave = ?';
        params.push(sha256(usuario.clave));
    }

    query += ' WHERE id = ?';
    params.push(usuario.id);

    connection.query(query, params, (error, results) => {
        if (error) {
            return callback(error);
        }

        // Si el usuario es tribunal y se envían especialidades
        if ((usuario.rol === 'Tribunal' || usuario.rol === 'Director') && Array.isArray(usuario.especialidades)) {
            const deleteQuery = 'DELETE FROM UsuarioEspecialidades WHERE id_usuario = ?';
            connection.query(deleteQuery, [usuario.id], (error) => {
                if (error) {
                    return callback(error);
                }

                if (usuario.especialidades.length > 0) {
                    const insertQuery = 'INSERT INTO UsuarioEspecialidades (id_usuario, id_especialidad) VALUES ?';
                    const values = usuario.especialidades.map(id_esp => [usuario.id, id_esp]);
                    connection.query(insertQuery, [values], (error) => {
                        if (error) {
                            return callback(error);
                        }
                        return callback(null, { message: 'Usuario y especialidades actualizados correctamente' });
                    });
                } else {
                    return callback(null, { message: 'Usuario actualizado sin especialidades' });
                }
            });
        } else {
            // No es tribunal o no hay especialidades que procesar
            return callback(null, results);
        }
    });
};

// Función para desactivar un usuario (Soft Delete)
const desactivar = (id, callback) => {
    connection.query('UPDATE Usuarios SET estado = FALSE WHERE id = ?', [id], (error, results) => {
        if (error) {
            return callback(error);
        }
        return callback(null, results);
    });
};

// Funcion para verificar las credenciales de un usuario
const verificarCredenciales = (usuario, callback) => {
    // Se añade la condición de que el usuario debe estar activo (estado = TRUE)
    connection.query(
        'SELECT * FROM Usuarios WHERE usuario = ? AND clave = ? AND estado = TRUE',
        [usuario.usuario, sha256(usuario.clave)],
        (error, results) => {
            if (error) {
                return callback(error);
            }
            return callback(null, results[0]);
        }
    );
};

module.exports = {
    listar,
    agregar,
    actualizar,
    desactivar,
    verificarCredenciales
};
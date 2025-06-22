// Conexion a la base de datos
const connection = require('../config/database');

// Función para listar las versiones de un tema
const listarPorTema = (id_tema, callback) => {
    const query = 'SELECT * FROM VersionesTema WHERE id_tema = ? ORDER BY numero_version DESC';
    connection.query(query, [id_tema], (error, results) => {
        if (error) { return callback(error, null); }
        callback(null, results);
    });
};

// Función para agregar una nueva versión de un tema
const agregar = (id_tema, archivo_ruta, comentarios, callback) => {
    connection.beginTransaction(err => {
        if (err) { return callback(err); }

        // 1. Obtenemos el número de la última versión para incrementarlo
        const lastVersionQuery = 'SELECT MAX(numero_version) as max_version FROM VersionesTema WHERE id_tema = ?';
        connection.query(lastVersionQuery, [id_tema], (error, results) => {
            if (error) { return connection.rollback(() => { callback(error); }); }

            const nuevaVersion = results[0].max_version + 1;

            // 2. Insertamos la nueva versión
            const insertVersionQuery = 'INSERT INTO VersionesTema (id_tema, archivo_ruta, numero_version, comentarios_estudiante) VALUES (?, ?, ?, ?)';
            connection.query(insertVersionQuery, [id_tema, archivo_ruta, nuevaVersion, comentarios], (error, results) => {
                if (error) { return connection.rollback(() => { callback(error); }); }

                // 3. Actualizamos el estado del tema a 'EN_REVISION'
                const updateTemaQuery = 'UPDATE Temas SET estado_tema = "EN_REVISION" WHERE id = ?';
                connection.query(updateTemaQuery, [id_tema], (error, results) => {
                    if (error) { return connection.rollback(() => { callback(error); }); }

                    // 4. Reiniciamos el veredicto de los tribunales asignados a 'PENDIENTE'
                    const resetVeredictoQuery = 'UPDATE AsignacionesTemaTribunal SET veredicto = "PENDIENTE", observaciones = NULL, fecha_veredicto = NULL WHERE id_tema = ?';
                    connection.query(resetVeredictoQuery, [id_tema], (error, results) => {
                        if (error) { return connection.rollback(() => { callback(error); }); }
                        
                        // Si todo es exitoso, confirmamos la transacción
                        connection.commit(err => {
                            if (err) { return connection.rollback(() => { callback(err); }); }
                            callback(null, results);
                        });
                    });
                });
            });
        });
    });
};

module.exports = {
    listarPorTema,
    agregar
};
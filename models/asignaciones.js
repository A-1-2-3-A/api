// Conexion a la base de datos
const connection = require('../config/database');

// Función interna para verificar y actualizar el estado final de un tema
const _actualizarEstadoFinalTema = (id_tema, connection, callback) => {
    const queryVeredictos = 'SELECT veredicto FROM AsignacionesTemaTribunal WHERE id_tema = ?';
    connection.query(queryVeredictos, [id_tema], (err, veredictos) => {
        if (err) { return callback(err); }

        // Si aún no han votado los 3 tribunales, no hacemos nada
        if (veredictos.length < 3 || veredictos.some(v => v.veredicto === 'PENDIENTE')) {
            return callback(null, { message: 'Aún faltan veredictos.' });
        }

        const soloVeredictos = veredictos.map(v => v.veredicto);
        let estadoFinal = 'APROBADO'; // Estado por defecto

        if (soloVeredictos.includes('REPROBADO')) {
            estadoFinal = 'REPROBADO';
        } else if (soloVeredictos.includes('APROBADO_CON_OBSERVACIONES')) {
            estadoFinal = 'APROBADO_CON_OBSERVACIONES';
        }

        const queryUpdateTema = 'UPDATE Temas SET estado_tema = ? WHERE id = ?';
        connection.query(queryUpdateTema, [estadoFinal, id_tema], (err, results) => {
            if (err) { return callback(err); }
            callback(null, results);
        });
    });
};

// Función para asignar varios tribunales a un tema
const agregar = (id_tema, ids_tribunales, callback) => {
    connection.beginTransaction(err => {
        if (err) { return callback(err); }
        const query = 'INSERT INTO AsignacionesTemaTribunal (id_tema, id_tribunal) VALUES ?';
        const values = ids_tribunales.map(id_tribunal => [id_tema, id_tribunal]);
        connection.query(query, [values], (error, results) => {
            if (error) { return connection.rollback(() => { callback(error); }); }
            const queryUpdateTema = 'UPDATE Temas SET estado_tema = ? WHERE id = ?';
            connection.query(queryUpdateTema, ['EN_REVISION', id_tema], (error, results) => {
                if (error) { return connection.rollback(() => { callback(error); }); }
                connection.commit(err => {
                    if (err) { return connection.rollback(() => { callback(err); }); }
                    callback(null, results);
                });
            });
        });
    });
};

// Función para que un tribunal emita su veredicto
const registrarVeredicto = (id_asignacion, veredicto, observaciones, callback) => {
    connection.beginTransaction(err => {
        if (err) { return callback(err); }
        const query = 'UPDATE AsignacionesTemaTribunal SET veredicto = ?, observaciones = ?, fecha_veredicto = CURRENT_TIMESTAMP WHERE id = ?';
        connection.query(query, [veredicto, observaciones, id_asignacion], (error, results) => {
            if (error) { return connection.rollback(() => { callback(error); }); }
            if (results.affectedRows === 0) {
                return connection.rollback(() => { callback(new Error('Asignacion no encontrada')); });
            }
            // Obtenemos el id_tema de la asignación actualizada para verificar el estado final
            const queryIdTema = 'SELECT id_tema FROM AsignacionesTemaTribunal WHERE id = ?';
            connection.query(queryIdTema, [id_asignacion], (err, res) => {
                if (err) { return connection.rollback(() => { callback(err); }); }
                const id_tema = res[0].id_tema;
                // Llamamos a la lógica de negocio para actualizar el estado del tema si aplica
                _actualizarEstadoFinalTema(id_tema, connection, (err, finalResults) => {
                    if (err) { return connection.rollback(() => { callback(err); }); }
                    connection.commit(err => {
                        if (err) { return connection.rollback(() => { callback(err); }); }
                        callback(null, finalResults);
                    });
                });
            });
        });
    });
};

// Función para buscar una asignación por su ID (incluye el id del tribunal)
const buscarPorId = (id_asignacion, callback) => {
    const query = 'SELECT * FROM AsignacionesTemaTribunal WHERE id = ?';
    connection.query(query, [id_asignacion], (error, results) => {
        if (error) { return callback(error, null); }
        callback(null, results[0]);
    });
};

// Otras funciones de listado (sin cambios)
const listarPorTema = (id_tema, callback) => {
    const query = `
        SELECT a.id, a.id_tribunal, u.nombres, u.apellido_primero, a.veredicto
        FROM AsignacionesTemaTribunal a JOIN Usuarios u ON a.id_tribunal = u.id
        WHERE a.id_tema = ?;
    `;
    connection.query(query, [id_tema], (error, results) => {
        if (error) { return callback(error, null); }
        callback(null, results);
    });
};

const listarPorTribunal = (id_tribunal, callback) => {
    const query = `
        SELECT a.id, t.nombre, t.estado_tema, a.veredicto, a.fecha_asignacion
        FROM AsignacionesTemaTribunal a JOIN Temas t ON a.id_tema = t.id
        WHERE a.id_tribunal = ?;
    `;
    connection.query(query, [id_tribunal], (error, results) => {
        if (error) { return callback(error, null); }
        callback(null, results);
    });
};

module.exports = {
    agregar,
    listarPorTema,
    listarPorTribunal,
    registrarVeredicto,
    buscarPorId
};
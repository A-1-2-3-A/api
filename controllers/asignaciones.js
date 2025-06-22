// Modelo de Asignaciones
const AsignacionModel = require('../models/asignaciones');

// Función para designar tribunales a un tema
const agregar = (req, res) => {
    const { id_tema, ids_tribunales } = req.body;
    if (!id_tema || !Array.isArray(ids_tribunales) || ids_tribunales.length !== 3) {
        return res.status(400).json({ success: 0, message: 'Se deben proporcionar un id_tema y un array con exactamente 3 ids de tribunales.' });
    }
    AsignacionModel.agregar(id_tema, ids_tribunales, (err, results) => {
        if (err) {
            console.error('Error al designar tribunales:', err);
            return res.status(500).json({ success: 0, message: 'Error en la Base de Datos al designar tribunales.' });
        }
        return res.status(201).json({ success: 1, message: 'Tribunales designados y tema actualizado a "EN REVISION" con éxito.' });
    });
};

// Función para que un tribunal registre su veredicto, con autorización a nivel de recurso
const registrarVeredicto = (req, res) => {
    const id_asignacion = req.params.id_asignacion;
    const id_tribunal_token = req.decoded.id; // ID del tribunal autenticado
    const { veredicto, observaciones } = req.body;

    // Se verifica que el tribunal autenticado es el que corresponde a la asignación
    AsignacionModel.buscarPorId(id_asignacion, (err, asignacion) => {
        if (err) { return res.status(500).json({ success: 0, message: 'Error al buscar asignación.' }); }
        if (!asignacion) { return res.status(404).json({ success: 0, message: 'Asignación no encontrada.' }); }
        if (asignacion.id_tribunal !== id_tribunal_token) {
            return res.status(403).json({ success: 0, message: 'Acceso denegado. No puede registrar un veredicto para una asignación que no le corresponde.' });
        }
        
        AsignacionModel.registrarVeredicto(id_asignacion, veredicto, observaciones, (err, results) => {
            if (err) {
                console.error('Error al registrar veredicto:', err);
                return res.status(500).json({ success: 0, message: 'Error al registrar veredicto.' });
            }
            return res.status(200).json({ success: 1, message: 'Veredicto registrado con éxito. Se ha verificado el estado final del tema.' });
        });
    });
};

// Otras funciones (sin cambios mayores en su lógica)
const listarPorTema = (req, res) => {
    AsignacionModel.listarPorTema(req.params.id_tema, (err, results) => {
        if (err) { return res.status(500).json({ success: 0, message: 'Error al obtener asignaciones.' }); }
        return res.status(200).json({ success: 1, data: results });
    });
};

const listarPorTribunal = (req, res) => {
    // Verificación para que un tribunal solo pueda ver sus propias asignaciones
    if (req.decoded.rol === 'Tribunal' && req.decoded.id != req.params.id_tribunal) {
        return res.status(403).json({ success: 0, message: 'Acceso denegado. Solo puede ver sus temas asignados.' });
    }
    AsignacionModel.listarPorTribunal(req.params.id_tribunal, (err, results) => {
        if (err) { return res.status(500).json({ success: 0, message: 'Error al obtener temas asignados.' }); }
        return res.status(200).json({ success: 1, data: results });
    });
};

module.exports = {
    agregar,
    listarPorTema,
    listarPorTribunal,
    registrarVeredicto
};
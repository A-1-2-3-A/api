// controllers/asignaciones.js

const AsignacionModel = require('../models/asignaciones');

const asignacionController = {};

/**
 * Designa tribunales a un tema. Llama al modelo que crea las asignaciones
 * y los registros de revisión iniciales en una transacción.
 */
asignacionController.agregar = (req, res) => {
    const { id_tema, ids_tribunales } = req.body;
    if (!id_tema || !Array.isArray(ids_tribunales) || ids_tribunales.length !== 3) {
        return res.status(400).json({ success: 0, message: 'Se deben proporcionar un id_tema y un array con exactamente 3 ids de tribunales.' });
    }

    AsignacionModel.crearAsignaciones(id_tema, ids_tribunales, (err, results) => {
        if (err) {
            console.error('Error al designar tribunales:', err);
            return res.status(500).json({ success: 0, message: 'Error en la Base de Datos al designar tribunales.' });
        }
        return res.status(201).json({ success: 1, message: 'Tribunales designados y tema actualizado a "EN REVISION" con éxito.' });
    });
};


/**
 * Lista los tribunales asignados a un tema específico.
 */
asignacionController.listarPorTema = (req, res) => {
    AsignacionModel.listarPorTema(req.params.id_tema, (err, results) => {
        if (err) {
            console.error('Error al listar asignaciones por tema:', err);
            return res.status(500).json({ success: 0, message: 'Error al obtener las asignaciones.' });
        }
        return res.status(200).json({ success: 1, data: results });
    });
};

/**
 * Lista los temas asignados a un tribunal específico.
 * Incluye validación de permisos para que un tribunal solo vea lo suyo.
 */
asignacionController.listarPorTribunal = (req, res) => {
    const id_tribunal_param = parseInt(req.params.id_tribunal, 10);
    const { id: id_tribunal_token, rol } = req.decoded;

    // Un tribunal solo puede ver sus propias asignaciones. El director puede ver cualquiera.
    if (rol === 'Tribunal' && id_tribunal_token !== id_tribunal_param) {
        return res.status(403).json({ success: 0, message: 'Acceso denegado. Solo puede ver sus temas asignados.' });
    }

    AsignacionModel.listarPorTribunal(id_tribunal_param, (err, results) => {
        if (err) {
            console.error('Error al listar temas por tribunal:', err);
            return res.status(500).json({ success: 0, message: 'Error al obtener temas asignados.' });
        }
        return res.status(200).json({ success: 1, data: results });
    });
};


module.exports = asignacionController;
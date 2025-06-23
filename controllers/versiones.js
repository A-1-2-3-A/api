// controllers/versiones.js

const VersionModel = require('../models/versiones');
const TemaModel = require('../models/temas');
const AsignacionModel = require('../models/asignaciones');

const versionController = {};

/**
 * Lista todas las versiones de un tema específico.
 */
versionController.listarPorTema = (req, res) => {
    const id_tema = req.params.id_tema;
    VersionModel.listarPorTema(id_tema, (err, results) => {
        if (err) {
            console.error(`Error al listar versiones para el tema ID ${id_tema}:`, err);
            return res.status(500).json({ success: 0, message: 'Error al listar las versiones del tema.' });
        }
        return res.status(200).json({ success: 1, data: results });
    });
};

/**
 * Permite a un estudiante agregar una nueva versión a su tema.
 */
versionController.agregar = (req, res) => {
    const { id_asignacion, comentarios_estudiante } = req.body;
    const id_estudiante_token = req.decoded.id;

    if (!req.file) {
        return res.status(400).json({ success: 0, message: 'No se ha subido ningún archivo PDF.' });
    }
    if (!id_asignacion) {
        return res.status(400).json({ success: 0, message: 'El ID de la asignación es requerido.' });
    }

    const archivo_ruta = req.file.path.replace(/\\/g, "/");

    // 1. Validar que la asignación existe y pertenece al estudiante autenticado
    // Hay que buscar la asignación, obtener el id_tema y validar que sea del estudiante autenticado
    const getAsignacionTemaQuery = `
        SELECT a.id, a.id_tema, t.id_estudiante, t.estado_tema
        FROM AsignacionesTemaTribunal a
        JOIN Temas t ON a.id_tema = t.id
        WHERE a.id = ?
    `;
    AsignacionModel.buscarPorId(id_asignacion, (err, asignacion) => {
        if (err) {
            return res.status(500).json({ success: 0, message: 'Error al verificar la asignación.' });
        }
        if (!asignacion) {
            return res.status(404).json({ success: 0, message: 'Asignación no encontrada.' });
        }
        // Buscar el tema y validar pertenencia
        TemaModel.buscarPorIdSimple(asignacion.id_tema, (err, tema) => {
            if (err) {
                return res.status(500).json({ success: 0, message: 'Error al verificar el tema.' });
            }
            if (!tema) {
                return res.status(404).json({ success: 0, message: 'Tema no encontrado.' });
            }
            if (tema.id_estudiante !== id_estudiante_token) {
                return res.status(403).json({ success: 0, message: 'Acceso denegado. No puedes modificar un tema que no te pertenece.' });
            }
            // Solo permitir si el último veredicto de esa asignación fue REVISADO (validar en el modelo si quieres más robustez)
            // Se asume que el FE ya lo filtra, pero se puede agregar aquí una consulta de control.

            // 2. Si todo bien, agregar la versión
            VersionModel.agregar(id_asignacion, archivo_ruta, comentarios_estudiante, (err, results) => {
                if (err) {
                    console.error('Error al agregar nueva versión:', err);
                    return res.status(409).json({ success: 0, message: err.message || 'Error en la base de datos al agregar la versión.' });
                }
                return res.status(201).json({
                    success: 1,
                    message: 'Nueva versión del tema subida con éxito. El tribunal revisará tu corrección.',
                    data: results
                });
            });
        });
    });
};

module.exports = versionController;
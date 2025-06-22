// controllers/versiones.js

const VersionModel = require('../models/versiones');
const TemaModel = require('../models/temas'); // Se necesita para verificar la propiedad del tema

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
    // El id del tema viene en el cuerpo del formulario, no en la URL
    const { id_tema, comentarios_estudiante } = req.body;
    const id_estudiante_token = req.decoded.id;

    if (!req.file) {
        return res.status(400).json({ success: 0, message: 'No se ha subido ningún archivo PDF.' });
    }
    if (!id_tema) {
        return res.status(400).json({ success: 0, message: 'El ID del tema es requerido.' });
    }
    
    const archivo_ruta = req.file.path.replace(/\\/g, "/");

    // 1. Verificar que el tema pertenece al estudiante autenticado
    TemaModel.buscarPorIdSimple(id_tema, (err, tema) => {
        if (err) {
            return res.status(500).json({ success: 0, message: 'Error al verificar el tema.' });
        }
        if (!tema) {
            return res.status(404).json({ success: 0, message: 'El tema no fue encontrado.' });
        }
        if (tema.id_estudiante !== id_estudiante_token) {
            return res.status(403).json({ success: 0, message: 'Acceso denegado. No puedes modificar un tema que no te pertenece.' });
        }
        if (tema.estado_tema !== 'REVISADO') {
            return res.status(403).json({ success: 0, message: 'Solo se pueden subir nuevas versiones de temas que requieren revisión.' });
        }

        // 2. Si la validación es correcta, agregar la nueva versión
        VersionModel.agregar(id_tema, archivo_ruta, comentarios_estudiante, (err, results) => {
            if (err) {
                console.error('Error al agregar nueva versión:', err);
                return res.status(500).json({ success: 0, message: 'Error en la base de datos al agregar la versión.' });
            }
            return res.status(201).json({ success: 1, message: 'Nueva versión del tema subida con éxito. El tema está nuevamente en revisión.' });
        });
    });
};

module.exports = versionController;
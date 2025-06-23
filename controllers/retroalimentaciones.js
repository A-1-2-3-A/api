// controllers/retroalimentaciones.js

const RetroalimentacionModel = require('../models/retroalimentaciones');
const AsignacionModel = require('../models/asignaciones');
const VersionModel = require('../models/versiones');

const retroalimentacionController = {};

/**
 * Agrega un comentario a una asignación y versión.
 */
retroalimentacionController.agregarComentario = (req, res) => {
    const id_asignacion = req.params.id_asignacion;
    const { id_version_tema, texto_comentario } = req.body;
    const id_tribunal_token = req.decoded.id;

    if (!id_version_tema) {
        return res.status(400).json({ success: 0, message: 'Debe indicar a qué versión corresponde el comentario.' });
    }
    if (!texto_comentario || texto_comentario.trim() === '') {
        return res.status(400).json({ success: 0, message: 'El texto del comentario no puede estar vacío.' });
    }

    AsignacionModel.buscarPorId(id_asignacion, (err, asignacion) => {
        if (err) return res.status(500).json({ success: 0, message: 'Error al buscar la asignación.' });
        if (!asignacion) return res.status(404).json({ success: 0, message: 'Asignación no encontrada.' });
        if (asignacion.id_tribunal !== id_tribunal_token) {
            return res.status(403).json({ success: 0, message: 'Acceso denegado.' });
        }
        RetroalimentacionModel.agregarComentario(id_asignacion, id_version_tema, texto_comentario, (err, results) => {
            if (err) {
                console.error("Error en BD al agregar comentario:", err);
                return res.status(500).json({ success: 0, message: 'Error al agregar el comentario.' });
            }
            return res.status(201).json({ success: 1, message: 'Comentario agregado con éxito.', data: { id: results.insertId } });
        });
    });
};

/**
 * Agrega un archivo de retroalimentación a una asignación y versión.
 */
retroalimentacionController.agregarArchivo = (req, res) => {
    const id_asignacion = req.params.id_asignacion;
    const { id_version_tema, descripcion } = req.body;
    const id_tribunal_token = req.decoded.id;

    if (!req.file) {
        return res.status(400).json({ success: 0, message: 'No se ha subido ningún archivo.' });
    }
    if (!id_version_tema) {
        return res.status(400).json({ success: 0, message: 'Debe indicar a qué versión corresponde el archivo.' });
    }
    const archivo_ruta = req.file.path.replace(/\\/g, "/");

    AsignacionModel.buscarPorId(id_asignacion, (err, asignacion) => {
        if (err || !asignacion) return res.status(404).json({ success: 0, message: 'Asignación no encontrada.' });
        if (asignacion.id_tribunal !== id_tribunal_token) {
            return res.status(403).json({ success: 0, message: 'Acceso denegado.' });
        }

        RetroalimentacionModel.agregarArchivo(id_asignacion, id_version_tema, archivo_ruta, descripcion, (err, results) => {
            if (err) {
                console.error("Error en BD al agregar archivo:", err);
                return res.status(500).json({ success: 0, message: 'Error al agregar el archivo.' });
            }
            return res.status(201).json({ success: 1, message: 'Archivo de retroalimentación agregado con éxito.', data: { id: results.insertId } });
        });
    });
};

/**
 * Lista comentarios y archivos de retroalimentación para una asignación y versión.
 */
retroalimentacionController.listarPorAsignacionYVersion = (req, res) => {
    const id_asignacion = req.params.id_asignacion;
    const id_version_tema = req.query.id_version_tema;
    const { id: id_usuario_token, rol } = req.decoded;

    if (!id_version_tema) {
        return res.status(400).json({ success: 0, message: 'Debe indicar la versión que desea ver.' });
    }

    AsignacionModel.buscarPorId(id_asignacion, (err, asignacion) => {
        if (err) return res.status(500).json({ success: 0, message: 'Error al buscar la asignación.' });
        if (!asignacion) return res.status(404).json({ success: 0, message: 'Asignación no encontrada.' });

        const esAdmin = rol === 'Director' || rol === 'Secretario';
        const esTribunalAsignado = rol === 'Tribunal' && asignacion.id_tribunal === id_usuario_token;

        if (!esAdmin && !esTribunalAsignado) {
            // Se recomienda agregar validación de estudiante aquí si se requiere.
            // return res.status(403).json({ success: 0, message: 'Acceso denegado.' });
        }

        RetroalimentacionModel.listarPorAsignacionYVersion(id_asignacion, id_version_tema, (err, results) => {
            if (err) {
                console.error("Error al obtener retroalimentación:", err);
                return res.status(500).json({ success: 0, message: 'Error al obtener la retroalimentación.' });
            }
            return res.status(200).json({ success: 1, data: results });
        });
    });
};

module.exports = retroalimentacionController;
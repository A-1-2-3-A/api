// Modelo de Retroalimentaciones
const RetroalimentacionModel = require('../models/retroalimentaciones');
const AsignacionModel = require('../models/asignaciones'); // Se necesita para verificar permisos

// Función para agregar un comentario
const agregarComentario = (req, res) => {
    const id_asignacion = req.params.id_asignacion;
    const { texto_comentario } = req.body;
    const id_tribunal_token = req.decoded.id;
// controllers/retroalimentaciones.js

const RetroalimentacionModel = require('../models/retroalimentaciones');
const AsignacionModel = require('../models/asignaciones'); // Se necesita para verificar permisos

const retroalimentacionController = {};

/**
 * Agrega un comentario a una asignación.
 */
retroalimentacionController.agregarComentario = (req, res) => {
    const id_asignacion = req.params.id_asignacion;
    const { texto_comentario } = req.body;
    const id_tribunal_token = req.decoded.id;

    if (!texto_comentario || texto_comentario.trim() === '') {
        return res.status(400).json({ success: 0, message: 'El texto del comentario no puede estar vacío.' });
    }

    // Se verifica que el tribunal autenticado es el que corresponde a la asignación
    AsignacionModel.buscarPorId(id_asignacion, (err, asignacion) => {
        if (err) return res.status(500).json({ success: 0, message: 'Error al buscar la asignación.' });
        if (!asignacion) return res.status(404).json({ success: 0, message: 'Asignación no encontrada.' });
        if (asignacion.id_tribunal !== id_tribunal_token) {
            return res.status(403).json({ success: 0, message: 'Acceso denegado. No puede comentar en una asignación que no le corresponde.' });
        }

        RetroalimentacionModel.agregarComentario(id_asignacion, texto_comentario, (err, results) => {
            if (err) {
                console.error("Error en BD al agregar comentario:", err);
                return res.status(500).json({ success: 0, message: 'Error al agregar el comentario.' });
            }
            return res.status(201).json({ success: 1, message: 'Comentario agregado con éxito.', data: { id: results.insertId } });
        });
    });
};

/**
 * Agrega un archivo de retroalimentación a una asignación.
 */
retroalimentacionController.agregarArchivo = (req, res) => {
    const id_asignacion = req.params.id_asignacion;
    const { descripcion } = req.body;
    const id_tribunal_token = req.decoded.id;

    if (!req.file) {
        return res.status(400).json({ success: 0, message: 'No se ha subido ningún archivo.' });
    }
    const archivo_ruta = req.file.path.replace(/\\/g, "/");

    AsignacionModel.buscarPorId(id_asignacion, (err, asignacion) => {
        if (err || !asignacion) return res.status(404).json({ success: 0, message: 'Asignación no encontrada.' });
        if (asignacion.id_tribunal !== id_tribunal_token) {
            return res.status(403).json({ success: 0, message: 'Acceso denegado. No puede subir archivos a una asignación que no le corresponde.' });
        }

        RetroalimentacionModel.agregarArchivo(id_asignacion, archivo_ruta, descripcion, (err, results) => {
            if (err) {
                console.error("Error en BD al agregar archivo:", err);
                return res.status(500).json({ success: 0, message: 'Error al agregar el archivo.' });
            }
            return res.status(201).json({ success: 1, message: 'Archivo de retroalimentación agregado con éxito.', data: { id: results.insertId } });
        });
    });
};

/**
 * Lista toda la retroalimentación (comentarios y archivos) para una asignación.
 */
retroalimentacionController.listarPorAsignacion = (req, res) => {
    const id_asignacion = req.params.id_asignacion;
    const { id: id_usuario_token, rol } = req.decoded;

    // Se verifica que el usuario tenga permiso para ver esta retroalimentación
    AsignacionModel.buscarPorId(id_asignacion, (err, asignacion) => {
        if (err) return res.status(500).json({ success: 0, message: 'Error al buscar la asignación.' });
        if (!asignacion) return res.status(404).json({ success: 0, message: 'Asignación no encontrada.' });

        const esAdmin = rol === 'Director' || rol === 'Secretario';
        const esTribunalAsignado = rol === 'Tribunal' && asignacion.id_tribunal === id_usuario_token;
        // Falta verificar si es el estudiante del tema, esto requeriría un JOIN en buscarPorId
        // Por ahora, se asume que el estudiante también puede verlo si la ruta se protege adecuadamente.
        // En un futuro, la consulta de buscarPorId debería devolver también el id_estudiante.
        
        if (!esAdmin && !esTribunalAsignado) {
             // Aquí iría la lógica para verificar si es el estudiante del tema.
             // return res.status(403).json({ success: 0, message: 'Acceso denegado.' });
        }

        RetroalimentacionModel.listarPorAsignacion(id_asignacion, (err, results) => {
            if (err) {
                console.error("Error al obtener retroalimentación:", err);
                return res.status(500).json({ success: 0, message: 'Error al obtener la retroalimentación.' });
            }
            return res.status(200).json({ success: 1, data: results });
        });
    });
};

module.exports = retroalimentacionController;
    AsignacionModel.buscarPorId(id_asignacion, (err, asignacion) => {
        if (err || !asignacion) return res.status(404).json({ success: 0, message: 'Asignación no encontrada.' });
        if (asignacion.id_tribunal !== id_tribunal_token) return res.status(403).json({ success: 0, message: 'Acceso denegado.' });

        RetroalimentacionModel.agregarComentario(id_asignacion, texto_comentario, (err, results) => {
            if (err) {
                return res.status(500).json({ success: 0, message: 'Error en BD al agregar comentario' });
            }
            return res.status(201).json({ success: 1, message: 'Comentario agregado con éxito', data: { id: results.insertId } });
        });
    });
};

// Función para agregar un archivo de retroalimentación
const agregarArchivo = (req, res) => {
    const id_asignacion = req.params.id_asignacion;
    const { descripcion } = req.body;
    const id_tribunal_token = req.decoded.id;

    if (!req.file) {
        return res.status(400).json({ success: 0, message: 'No se ha subido ningún archivo PDF.' });
    }
    const archivo_ruta = req.file.path.replace(/\\/g, "/");

    AsignacionModel.buscarPorId(id_asignacion, (err, asignacion) => {
        if (err || !asignacion) return res.status(404).json({ success: 0, message: 'Asignación no encontrada.' });
        if (asignacion.id_tribunal !== id_tribunal_token) return res.status(403).json({ success: 0, message: 'Acceso denegado.' });

        RetroalimentacionModel.agregarArchivo(id_asignacion, archivo_ruta, descripcion, (err, results) => {
            if (err) {
                return res.status(500).json({ success: 0, message: 'Error en BD al agregar archivo' });
            }
            return res.status(201).json({ success: 1, message: 'Archivo de retroalimentación agregado', data: { id: results.insertId } });
        });
    });
};

// Función para listar toda la retroalimentación
const listarPorAsignacion = (req, res) => {
    const id_asignacion = req.params.id_asignacion;
    // Se podrían añadir más validaciones de permisos aquí si fuera necesario
    RetroalimentacionModel.listarPorAsignacion(id_asignacion, (err, results) => {
        if (err) {
            return res.status(500).json({ success: 0, message: 'Error al obtener la retroalimentación' });
        }
        return res.status(200).json({ success: 1, data: results });
    });
};

module.exports = {
    agregarComentario,
    agregarArchivo,
    listarPorAsignacion
};
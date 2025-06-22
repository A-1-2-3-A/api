// Modelo de Retroalimentaciones
const RetroalimentacionModel = require('../models/retroalimentaciones');
const AsignacionModel = require('../models/asignaciones'); // Se necesita para verificar permisos

// Función para agregar un comentario
const agregarComentario = (req, res) => {
    const id_asignacion = req.params.id_asignacion;
    const { texto_comentario } = req.body;
    const id_tribunal_token = req.decoded.id;

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
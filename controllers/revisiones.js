// controllers/revisiones.js

const RevisionModel = require('../models/revisiones');
const AsignacionModel = require('../models/asignaciones'); // Para verificar permisos
const TemaModel = require('../models/temas'); // Para actualizar estado final

const revisionController = {};

/**
 * Registra el veredicto de un tribunal para una revisión específica.
 */
revisionController.registrarVeredicto = (req, res) => {
    const id_revision = req.params.id_revision;
    const id_tribunal_token = req.decoded.id;
    const { veredicto, observaciones } = req.body;

    if (!veredicto) {
        return res.status(400).json({ success: 0, message: 'El campo "veredicto" es requerido.' });
    }

    // 1. Validar que el tribunal autenticado tiene permiso sobre esta revisión
    AsignacionModel.buscarAsignacionPorIdRevision(id_revision, (err, asignacion) => {
        if (err) return res.status(500).json({ success: 0, message: 'Error al buscar la asignación.' });
        if (!asignacion) return res.status(404).json({ success: 0, message: 'Revisión o asignación no encontrada.' });
        
        if (asignacion.id_tribunal !== id_tribunal_token) {
            return res.status(403).json({ success: 0, message: 'Acceso denegado. No puede registrar un veredicto para una asignación que no le corresponde.' });
        }

        // 2. Si tiene permiso, registrar el veredicto
        RevisionModel.registrarVeredicto(id_revision, veredicto, observaciones, (err, results) => {
            if (err) {
                console.error('Error al registrar veredicto:', err);
                return res.status(500).json({ success: 0, message: 'Error al registrar el veredicto.' });
            }
            if (results.affectedRows === 0) {
                return res.status(409).json({ success: 0, message: 'No se pudo registrar el veredicto. Es posible que ya haya sido emitido.' });
            }

            // 3. (Lógica de negocio) Actualizar el estado general del tema
            TemaModel.actualizarEstadoGeneral(asignacion.id_tema, (err, result) => {
                // Este resultado es secundario, la operación principal ya tuvo éxito
                if(err) console.error("Error al actualizar estado del tema:", err);
            });

            return res.status(200).json({ success: 1, message: 'Veredicto registrado con éxito.' });
        });
    });
};


module.exports = revisionController;
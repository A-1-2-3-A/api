// controllers/revisiones.js

const RevisionModel = require('../models/revisiones');
const AsignacionModel = require('../models/asignaciones'); // Para verificar permisos
const TemaModel = require('../models/temas'); // Para actualizar estado final
const RetroalimentacionModel = require('../models/retroalimentaciones');

const revisionController = {};

/**
 * Registra el veredicto de un tribunal y, si existe, un archivo de retroalimentación.
 */
revisionController.registrarVeredicto = (req, res) => {
    const id_revision = req.params.id_revision;
    const id_tribunal_token = req.decoded.id;
    const { veredicto, observaciones } = req.body;

    if (!veredicto) {
        return res.status(400).json({ success: 0, message: 'El campo "veredicto" es requerido.' });
    }

    AsignacionModel.buscarAsignacionPorIdRevision(id_revision, (err, asignacion) => {
        if (err) return res.status(500).json({ success: 0, message: 'Error al buscar la asignación.' });
        if (!asignacion) return res.status(404).json({ success: 0, message: 'Revisión o asignación no encontrada.' });
        
        if (asignacion.id_tribunal !== id_tribunal_token) {
            return res.status(403).json({ success: 0, message: 'Acceso denegado.' });
        }

        RevisionModel.registrarVeredicto(id_revision, veredicto, observaciones, (err, results) => {
            if (err) {
                console.error('Error al registrar veredicto:', err);
                return res.status(500).json({ success: 0, message: 'Error al registrar el veredicto.' });
            }
            if (results.affectedRows === 0) {
                return res.status(409).json({ success: 0, message: 'No se pudo registrar el veredicto. Es posible que ya haya sido emitido.' });
            }

            // Si se subió un archivo, lo guardamos en la tabla de retroalimentaciones.
            if (req.file) {
                const archivo_ruta = req.file.path.replace(/\\/g, "/");
                // Necesitamos el id_version_tema, que está en la asignación que ya recuperamos.
                const id_version_tema = asignacion.id_version_tema; // Asumimos que esta info está en la asignación.

                // Necesitamos obtener el id_version_tema de la revisión actual.
                 const queryRevision = 'SELECT id_version_tema FROM Revisiones WHERE id = ?';
                 require('../config/database').query(queryRevision, [id_revision], (err, revData) => {
                    if (err || !revData.length) {
                        console.error("No se pudo encontrar id_version_tema para la retroalimentación.");
                        // Continuamos sin guardar el archivo, pero el veredicto ya se guardó.
                    } else {
                        const id_version_tema = revData[0].id_version_tema;
                        RetroalimentacionModel.agregarArchivo(asignacion.id, id_version_tema, archivo_ruta, 'Archivo adjunto con el veredicto.', (err, fileResult) => {
                            if (err) {
                                console.error("El veredicto se guardó, pero hubo un error al guardar el archivo de retroalimentación:", err);
                            }
                        });
                    }
                });
            }

            TemaModel.actualizarEstadoGeneral(asignacion.id_tema, (err, result) => {
                if(err) console.error("Error al actualizar estado del tema:", err);
            });

            return res.status(200).json({ success: 1, message: 'Veredicto registrado con éxito.' });
        });
    });
};

module.exports = revisionController;
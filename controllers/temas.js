const TemaModel = require('../models/temas');

/**
 * Estructura los datos planos de la consulta de detalle en un objeto JSON anidado.
 * @param {Array} rows - Las filas devueltas por la consulta SQL con JOINs.
 * @returns {object|null} - El objeto del tema estructurado o null si no hay datos.
 */
const _estructurarDetalleTema = (rows) => {
    if (!rows || rows.length === 0) {
        return null;
    }

    const temaInfo = {
        idTema: rows[0].idTema,
        nombre: rows[0].nombre,
        estado_tema: rows[0].estado_tema,
        estudiante: {
            id: rows[0].idEstudiante,
            nombreCompleto: rows[0].nombreEstudiante
        },
        revisionesPorTribunal: []
    };

    const tribunalesMap = new Map();

    rows.forEach(row => {
        if (!row.idAsignacion) return;

        let tribunal = tribunalesMap.get(row.id_tribunal);
        if (!tribunal) {
            tribunal = {
                idAsignacion: row.idAsignacion,
                idTribunal: row.id_tribunal,
                nombreCompleto: row.nombreTribunal,
                veredictoActual: row.veredicto,
                fechaUltimoVeredicto: row.fecha_veredicto,
                historialCompleto: []
            };
            tribunalesMap.set(row.id_tribunal, tribunal);
        }

        if (row.id_version_tema) {
            let version = tribunal.historialCompleto.find(v => v.version === row.numero_version);
            if (!version) {
                version = {
                    id: row.id_version_tema,
                    id_revision: row.idRevision,
                    version: row.numero_version,
                    documentoEstudiante: {
                        nombre: row.archivo_ruta.split('/').pop(),
                        ruta: row.archivo_ruta,
                        comentarios: row.comentarios_estudiante
                    },
                    veredicto: row.veredicto,
                    observaciones: row.observaciones_finales,
                    fecha_veredicto: row.fecha_veredicto,
                };
                tribunal.historialCompleto.push(version);
            }
        }
    });

    temaInfo.revisionesPorTribunal = Array.from(tribunalesMap.values());
    return temaInfo;
};


const temasController = {};

// Listar temas dependiendo del rol
temasController.listar = (req, res) => {
    const { id, rol } = req.decoded;

    if (rol === 'Director' || rol === 'Secretario') {
        TemaModel.listarParaAdmin((err, results) => {
            if (err) return res.status(500).json({ success: 0, message: 'Error interno del servidor.' });
            return res.status(200).json({ success: 1, data: results });
        });
    } else if (rol === 'Estudiante') {
        TemaModel.listarPorEstudiante(id, (err, results) => {
            if (err) return res.status(500).json({ success: 0, message: 'Error interno del servidor.' });
            return res.status(200).json({ success: 1, data: results });
        });
    } else {
        // Para el Tribunal, se usa una ruta diferente en asignaciones.js
        return res.status(403).json({ success: 0, message: 'Acceso denegado para este rol.' });
    }
};

// Buscar un tema por ID con todos sus detalles
temasController.buscarDetalle = (req, res) => {
    const idTema = req.params.id;
    TemaModel.buscarDetalleCompleto(idTema, (err, rows) => {
        if (err) {
            console.error('Error al buscar detalle del tema:', err);
            return res.status(500).json({ success: 0, message: 'Error al buscar el detalle del tema.' });
        }
        if (!rows || rows.length === 0) {
            return res.status(404).json({ success: 0, message: 'Tema no encontrado.' });
        }

        const datosEstructurados = _estructurarDetalleTema(rows);
        res.status(200).json({ success: 1, data: datosEstructurados });
    });
};

// Agregar un nuevo tema
temasController.agregar = (req, res) => {
    const temaData = req.body;
    if (!req.file) {
        return res.status(400).json({ success: 0, message: 'El archivo PDF del tema es requerido.' });
    }
    const archivoRuta = `uploads/temas/${req.file.filename}`;

    TemaModel.agregar(temaData, archivoRuta, (err, result) => {
        if (err) {
            console.error('Error al agregar tema:', err);
            return res.status(500).json({ success: 0, message: 'Error al agregar el tema.' });
        }
        res.status(201).json({ success: 1, message: 'Tema registrado con éxito.', data: result });
    });
};

// Actualizar un tema
temasController.actualizar = (req, res) => {
    const idTema = req.params.id;
    const temaData = req.body;
    const nuevaRutaArchivo = req.file ? req.file.path.replace(/\\/g, "/") : null;

    TemaModel.buscarPorIdSimple(idTema, (err, tema) => {
        if (err) return res.status(500).json({ success: 0, message: 'Error interno del servidor.' });
        if (!tema) return res.status(404).json({ success: 0, message: 'Tema no encontrado.' });
        if (tema.estado_tema !== 'PRELIMINAR') {
            return res.status(403).json({ success: 0, message: 'Solo se pueden modificar temas en estado PRELIMINAR.' });
        }

        TemaModel.actualizar(idTema, temaData, (err, result) => {
            if (err) {
                console.error(`Error al actualizar tema con ID ${idTema}:`, err);
                return res.status(500).json({ success: 0, message: 'Error al actualizar el tema.' });
            }

            // Si hay archivo, actualiza la versión 1
            if (nuevaRutaArchivo) {
                TemaModel.actualizarArchivoPrimeraVersion(idTema, nuevaRutaArchivo, (err2, result2) => {
                    if (err2) {
                        console.error(`Error al actualizar archivo para tema ${idTema}:`, err2);
                        return res.status(500).json({ success: 0, message: 'Tema actualizado, pero ocurrió un error al guardar el archivo.' });
                    }
                    return res.status(200).json({ success: 1, message: 'Tema y archivo principal actualizados con éxito.' });
                });
            } else {
                return res.status(200).json({ success: 1, message: 'Tema actualizado con éxito.' });
            }
        });
    });
};

// Eliminar un tema
temasController.eliminar = (req, res) => {
    const idTema = req.params.id;

    TemaModel.buscarPorIdSimple(idTema, (err, tema) => {
        if (err) return res.status(500).json({ success: 0, message: 'Error interno del servidor.' });
        if (!tema) return res.status(404).json({ success: 0, message: 'Tema no encontrado.' });
        if (tema.estado_tema !== 'PRELIMINAR') {
            return res.status(403).json({ success: 0, message: 'Solo se pueden eliminar temas en estado PRELIMINAR.' });
        }

        TemaModel.eliminar(idTema, (err, result) => {
            if (err) {
                console.error(`Error al eliminar tema con ID ${idTema}:`, err);
                return res.status(500).json({ success: 0, message: 'Error al eliminar el tema.' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ success: 0, message: 'Tema no encontrado.' });
            }
            res.status(200).json({ success: 1, message: 'Tema eliminado con éxito.' });
        });
    });
};

module.exports = temasController;
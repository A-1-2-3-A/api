// api/controllers/archivos.js

const path = require('path');
const fs = require('fs');
const RetroalimentacionModel = require('../models/retroalimentaciones');
const VersionModel = require('../models/versiones'); // Nuevo import

const descargar = (ruta, res) => {
    const rutaAbsoluta = path.join(__dirname, '../', ruta);
    if (fs.existsSync(rutaAbsoluta)) {
        res.download(rutaAbsoluta);
    } else {
        console.error(`Archivo no encontrado en el disco: ${rutaAbsoluta}`);
        res.status(404).json({ success: 0, message: 'Archivo no encontrado en el servidor.' });
    }
};

/**
 * Permite a un estudiante descargar un archivo de retroalimentación
 * verificando previamente sus permisos.
 * @param {*} req 
 * @param {*} res 
 */
const descargarRetroalimentacionEstudiante = (req, res) => {
    const idRetroalimentacion = req.params.id;
    const idEstudiante = req.decoded.id; // ID del estudiante autenticado

    RetroalimentacionModel.buscarParaDescargaEstudiante(idRetroalimentacion, idEstudiante, (err, archivo) => {
        if (err) {
            console.error("Error en BD al buscar archivo de retroalimentacion:", err);
            return res.status(500).json({ success: 0, message: 'Error interno del servidor.' });
        }

        // Si no se encuentra el archivo O el estudiante no tiene permiso, 'archivo' será null.
        if (!archivo || !archivo.archivo_retroalimentacion_ruta) {
            return res.status(403).json({ success: 0, message: 'Acceso denegado o archivo no encontrado.' });
        }

        const rutaAbsoluta = path.join(__dirname, '../', archivo.archivo_retroalimentacion_ruta);

        if (fs.existsSync(rutaAbsoluta)) {
            res.download(rutaAbsoluta); // Envía el archivo para su descarga
        } else {
            console.error(`Archivo no encontrado en el disco: ${rutaAbsoluta}`);
            return res.status(404).json({ success: 0, message: 'Archivo no encontrado en el servidor.' });
        }
    });
};

const descargarVersionTemaTribunal = (req, res) => {
    const idVersion = req.params.id;
    const idTribunal = req.decoded.id;

    VersionModel.buscarParaDescargaTribunal(idVersion, idTribunal, (err, archivo) => {
        if (err || !archivo) {
            return res.status(403).json({ success: 0, message: 'Acceso denegado o archivo no encontrado.' });
        }
        descargar(archivo.archivo_ruta, res);
    });
};

const descargarRetroalimentacionTribunal = (req, res) => {
    const idRetroalimentacion = req.params.id;
    const idTribunal = req.decoded.id;

    RetroalimentacionModel.buscarParaDescargaTribunal(idRetroalimentacion, idTribunal, (err, archivo) => {
        if (err || !archivo) {
            return res.status(403).json({ success: 0, message: 'Acceso denegado o archivo no encontrado.' });
        }
        descargar(archivo.archivo_retroalimentacion_ruta, res);
    });
};

const descargarVersionTemaAdmin = (req, res) => {
    const idVersion = req.params.id;

    VersionModel.buscarRutaPorId(idVersion, (err, archivo) => {
        if (err || !archivo || !archivo.archivo_ruta) {
            return res.status(404).json({ success: 0, message: 'Versión del tema no encontrada.' });
        }

        const rutaAbsoluta = path.join(__dirname, '../', archivo.archivo_ruta);

        if (fs.existsSync(rutaAbsoluta)) {
            res.download(rutaAbsoluta);
        } else {
            console.error(`Archivo no encontrado en el disco: ${rutaAbsoluta}`);
            res.status(404).json({ success: 0, message: 'Archivo no encontrado en el servidor.' });
        }
    });
};

module.exports = {
    descargarRetroalimentacionEstudiante,
    descargarVersionTemaTribunal,
    descargarRetroalimentacionTribunal,
    descargarVersionTemaAdmin
};
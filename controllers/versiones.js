// Modelos necesarios
const VersionModel = require('../models/versiones');
const TemaModel = require('../models/temas');

// Función para listar las versiones de un tema
const listarPorTema = (req, res) => {
    const id_tema = req.params.id_tema;
    VersionModel.listarPorTema(id_tema, (err, results) => {
        if (err) {
            console.error('Error al listar versiones:', err);
            return res.status(500).json({ success: 0, message: 'Error al listar versiones del tema.' });
        }
        return res.status(200).json({ success: 1, data: results });
    });
};

// Función para agregar una nueva versión
const agregar = (req, res) => {
    const { id_tema, comentarios_estudiante } = req.body;
    const id_estudiante_token = req.decoded.id;

    if (!req.file) {
        return res.status(400).json({ success: 0, message: 'No se ha subido ningún archivo PDF.' });
    }
    const archivo_ruta = req.file.path.replace(/\\/g, "/");

    TemaModel.buscarPorId(id_tema, (err, tema) => {
        if (err) { return res.status(500).json({ success: 0, message: 'Error al verificar el tema.' }); }
        if (!tema) { return res.status(404).json({ success: 0, message: 'Tema no encontrado.' }); }
        if (tema.id_estudiante !== id_estudiante_token) {
            return res.status(403).json({ success: 0, message: 'Acceso denegado. No puedes modificar un tema que no te pertenece.' });
        }

        VersionModel.agregar(id_tema, archivo_ruta, comentarios_estudiante, (err, results) => {
            if (err) {
                console.error('Error al agregar nueva versión:', err);
                return res.status(500).json({ success: 0, message: 'Error en la BD al agregar la versión.' });
            }
            return res.status(201).json({ success: 1, message: 'Nueva versión del tema subida con éxito. El tema está nuevamente en revisión.' });
        });
    });
};

module.exports = {
    listarPorTema,
    agregar
};
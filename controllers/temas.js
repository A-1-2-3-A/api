// Modelo de Temas
const TemaModel = require('../models/temas');

// Función para listar todos los temas
const listar = (req, res) => {
    TemaModel.listar((err, results) => {
        if (err) {
            console.error('Error al listar temas:', err);
            return res.status(500).json({ success: 0, message: 'Error al listar temas' });
        }
        return res.status(200).json({ success: 1, message: 'Temas obtenidos con éxito', data: results });
    });
};

// Función para agregar un nuevo tema
const agregar = (req, res) => {
    const tema = req.body;
    
    if (!req.file) {
        return res.status(400).json({ success: 0, message: 'No se ha subido ningún archivo PDF.' });
    }
    const archivo_ruta = req.file.path.replace(/\\/g, "/"); // Se obtiene la ruta del archivo y se normaliza a slashes

    if (!tema.nombre || !tema.id_estudiante) {
        return res.status(400).json({ success: 0, message: 'Faltan datos requeridos (nombre, id_estudiante).' });
    }

    TemaModel.agregar(tema, archivo_ruta, (err, results) => {
        if (err) {
            console.error('Error al agregar tema:', err);
            return res.status(500).json({ success: 0, message: 'Error en la Base de Datos al agregar el tema' });
        }
        return res.status(201).json({ success: 1, message: 'Tema agregado con éxito', data: { id: results.id } });
    });
};

// Función para buscar un tema por su ID
const buscarPorId = (req, res) => {
    const id_tema = req.params.id;
    TemaModel.buscarPorId(id_tema, (err, result) => {
        if (err) {
            console.error('Error al buscar tema:', err);
            return res.status(500).json({ success: 0, message: 'Error al buscar tema' });
        }
        if (!result) {
            return res.status(404).json({ success: 0, message: 'Tema no encontrado' });
        }
        return res.status(200).json({ success: 1, message: 'Tema encontrado', data: result });
    });
};


// Función para actualizar un tema
const actualizar = (req, res) => {
    const tema = req.body;
    tema.id = req.params.id;

    TemaModel.actualizar(tema, (err, results) => {
        if (err) {
            console.error('Error al actualizar tema:', err);
            return res.status(500).json({ success: 0, message: 'Error en la Base de Datos al actualizar el tema' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ success: 0, message: 'Tema no encontrado' });
        }
        return res.status(200).json({ success: 1, message: 'Tema actualizado con éxito' });
    });
};

// Función para eliminar un tema
const eliminar = (req, res) => {
    const id_tema = req.params.id;
    TemaModel.eliminar(id_tema, (err, results) => {
        if (err) {
            console.error('Error al eliminar tema:', err);
            return res.status(500).json({ success: 0, message: 'Error en la Base de Datos al eliminar el tema' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ success: 0, message: 'Tema no encontrado' });
        }
        return res.status(200).json({ success: 1, message: 'Tema eliminado con éxito' });
    });
};


module.exports = {
    listar,
    agregar,
    buscarPorId,
    actualizar,
    eliminar
};
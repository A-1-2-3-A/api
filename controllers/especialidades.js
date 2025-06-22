// controllers/especialidades.js

const EspecialidadModel = require('../models/especialidades');

const especialidadController = {};

// Función para listar todas las especialidades
especialidadController.listar = (req, res) => {
    EspecialidadModel.listar((err, results) => {
        if (err) {
            console.error('Error al listar especialidades:', err);
            return res.status(500).json({ success: 0, message: 'Error interno del servidor.' });
        }
        return res.status(200).json({ success: 1, data: results });
    });
};

// Función para agregar una nueva especialidad
especialidadController.agregar = (req, res) => {
    const especialidadData = req.body;
    if (!especialidadData.nombre_especialidad) {
        return res.status(400).json({ success: 0, message: 'El campo "nombre_especialidad" es requerido.' });
    }

    EspecialidadModel.agregar(especialidadData, (err, results) => {
        if (err) {
            // Manejo de error para entradas duplicadas (UNIQUE en la DB)
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ success: 0, message: 'Ya existe una especialidad con ese nombre.' });
            }
            console.error('Error al agregar especialidad:', err);
            return res.status(500).json({ success: 0, message: 'Error al agregar la especialidad.' });
        }
        return res.status(201).json({ success: 1, message: 'Especialidad agregada con éxito', data: { id: results.insertId } });
    });
};

// Función para actualizar una especialidad
especialidadController.actualizar = (req, res) => {
    const id = req.params.id;
    const especialidadData = req.body;
    if (!especialidadData.nombre_especialidad) {
        return res.status(400).json({ success: 0, message: 'El campo "nombre_especialidad" es requerido.' });
    }

    EspecialidadModel.actualizar(id, especialidadData, (err, results) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ success: 0, message: 'Ya existe una especialidad con ese nombre.' });
            }
            console.error(`Error al actualizar especialidad con ID ${id}:`, err);
            return res.status(500).json({ success: 0, message: 'Error al actualizar la especialidad.' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ success: 0, message: 'Especialidad no encontrada.' });
        }
        return res.status(200).json({ success: 1, message: 'Especialidad actualizada con éxito.' });
    });
};

// Función para eliminar una especialidad
especialidadController.eliminar = (req, res) => {
    const id = req.params.id;
    EspecialidadModel.eliminar(id, (err, results) => {
        if (err) {
            console.error(`Error al eliminar especialidad con ID ${id}:`, err);
            return res.status(500).json({ success: 0, message: 'Error al eliminar la especialidad.' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ success: 0, message: 'Especialidad no encontrada.' });
        }
        return res.status(200).json({ success: 1, message: 'Especialidad eliminada con éxito.' });
    });
};

module.exports = especialidadController;
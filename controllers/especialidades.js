// Modelo de Especialidades
const EspecialidadModel = require('../models/especialidades');

// Función para listar todas las especialidades
const listar = (req, res) => {
    EspecialidadModel.listar((err, results) => {
        if (err) {
            console.error('Error al listar especialidades:', err);
            return res.status(500).json({ success: 0, message: 'Error al listar especialidades' });
        }
        return res.status(200).json({ success: 1, message: 'Especialidades obtenidas con éxito', data: results });
    });
};

// Función para agregar una nueva especialidad
const agregar = (req, res) => {
    const especialidad = req.body;
    EspecialidadModel.agregar(especialidad, (err, results) => {
        if (err) {
            console.error('Error al agregar especialidad:', err);
            return res.status(500).json({ success: 0, message: 'Error en la Base de Datos al agregar la especialidad' });
        }
        return res.status(201).json({ success: 1, message: 'Especialidad agregada con éxito', data: { id: results.insertId } });
    });
};

// Función para actualizar una especialidad
const actualizar = (req, res) => {
    const especialidad = req.body;
    especialidad.id = req.params.id;
    EspecialidadModel.actualizar(especialidad, (err, results) => {
        if (err) {
            console.error('Error al actualizar especialidad:', err);
            return res.status(500).json({ success: 0, message: 'Error en la Base de Datos al actualizar la especialidad' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ success: 0, message: 'Especialidad no encontrada' });
        }
        return res.status(200).json({ success: 1, message: 'Especialidad actualizada con éxito' });
    });
};

// Función para eliminar una especialidad
const eliminar = (req, res) => {
    const id_especialidad = req.params.id;
    EspecialidadModel.eliminar(id_especialidad, (err, results) => {
        if (err) {
            console.error('Error al eliminar especialidad:', err);
            return res.status(500).json({ success: 0, message: 'Error en la Base de Datos al eliminar la especialidad' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ success: 0, message: 'Especialidad no encontrada' });
        }
        return res.status(200).json({ success: 1, message: 'Especialidad eliminada con éxito' });
    });
};

module.exports = {
    listar,
    agregar,
    actualizar,
    eliminar
};
// controllers/especialidades.js

const Especialidad = require('../models/especialidades');

const especialidadController = {};

especialidadController.listar = (req, res) => {
    Especialidad.listar((err, especialidades) => {
        if (err) {
            console.error("Error al listar especialidades:", err);
            return res.status(500).json({ success: 0, message: 'Error al obtener las especialidades' });
        }
        return res.status(200).json({ success: 1, data: especialidades });
    });
};

// NUEVO: Controlador para agregar una especialidad.
especialidadController.agregar = (req, res) => {
    const { nombre_especialidad } = req.body;
    if (!nombre_especialidad || !nombre_especialidad.trim()) {
        return res.status(400).json({ success: 0, message: 'El nombre de la especialidad es requerido.' });
    }

    Especialidad.agregar(nombre_especialidad, (err, result) => {
        if (err) {
            // Manejo de error para especialidad duplicada
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ success: 0, message: 'La especialidad ya existe.' });
            }
            console.error("Error al agregar especialidad:", err);
            return res.status(500).json({ success: 0, message: 'Error interno al agregar la especialidad.' });
        }
        return res.status(201).json({ success: 1, message: 'Especialidad agregada con éxito.', insertedId: result.insertId });
    });
};

// NUEVO: Controlador para actualizar una especialidad.
especialidadController.actualizar = (req, res) => {
    const id_especialidad = req.params.id;
    const { nombre_especialidad } = req.body;

    if (!nombre_especialidad || !nombre_especialidad.trim()) {
        return res.status(400).json({ success: 0, message: 'El nombre de la especialidad es requerido.' });
    }

    Especialidad.actualizar(id_especialidad, nombre_especialidad, (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ success: 0, message: 'Ya existe otra especialidad con ese nombre.' });
            }
            console.error("Error al actualizar especialidad:", err);
            return res.status(500).json({ success: 0, message: 'Error interno al actualizar la especialidad.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: 0, message: 'Especialidad no encontrada.' });
        }
        return res.status(200).json({ success: 1, message: 'Especialidad actualizada con éxito.' });
    });
};

// NUEVO: Controlador para eliminar una especialidad.
especialidadController.eliminar = (req, res) => {
    const id_especialidad = req.params.id;

    Especialidad.eliminar(id_especialidad, (err, result) => {
        if (err) {
            console.error("Error al eliminar especialidad:", err);
            return res.status(500).json({ success: 0, message: 'Error interno al eliminar la especialidad.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: 0, message: 'Especialidad no encontrada.' });
        }
        return res.status(200).json({ success: 1, message: 'Especialidad eliminada con éxito.' });
    });
};

module.exports = especialidadController;
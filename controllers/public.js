// Modelo Público
const PublicModel = require('../models/public');

// Función para listar temas aprobados
const listarTemasAprobados = (req, res) => {
    PublicModel.listarTemasAprobados((err, results) => {
        if (err) {
            console.error('Error al listar temas públicos:', err);
            return res.status(500).json({ success: 0, message: 'Error al obtener temas' });
        }
        return res.status(200).json({ success: 1, data: results });
    });
};

// Función para listar tribunales
const listarTribunales = (req, res) => {
    PublicModel.listarTribunales((err, results) => {
        if (err) {
            console.error('Error al listar tribunales públicos:', err);
            return res.status(500).json({ success: 0, message: 'Error al obtener tribunales' });
        }
        return res.status(200).json({ success: 1, data: results });
    });
};

module.exports = {
    listarTemasAprobados,
    listarTribunales
};
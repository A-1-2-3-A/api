// Importar lo necesario
const express = require('express');
const router = express.Router();
const PublicController = require('../controllers/public');

// --- Rutas Públicas ---

// Ruta para listar temas aprobados
router.get('/temas-aprobados', PublicController.listarTemasAprobados);

// Ruta para listar todos los tribunales
router.get('/tribunales', PublicController.listarTribunales);

// Exportacion del router
module.exports = router;
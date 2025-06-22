// routes/public.js

const express = require('express');
const router = express.Router();
const publicController = require('../controllers/public');

// --- Rutas Públicas (no requieren autenticación por token) ---

/**
 * GET /api/public/temas-aprobados
 * Devuelve una lista de todos los temas que han sido aprobados.
 */
router.get('/temas-aprobados', publicController.listarTemasAprobados);

/**
 * GET /api/public/tribunales
 * Devuelve una lista de todos los docentes que pueden ser tribunales (roles Tribunal o Director).
 */
router.get('/tribunales', publicController.listarTribunales);

module.exports = router;
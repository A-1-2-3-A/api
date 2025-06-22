// routes/archivos.js

const express = require('express');
const router = express.Router();
const ArchivoController = require('../controllers/archivos');
const auth = require('../middlewares/auth');

// --- Rutas para el recurso "Archivos" ---

/**
 * GET /api/archivos/descargar?ruta=<ruta_del_archivo>
 * Permite a un usuario autenticado descargar un archivo del servidor.
 * La ruta del archivo se pasa como un parámetro de consulta (query param).
 * El controlador se encarga de la validación de seguridad de la ruta.
 */
router.get('/descargar', 
    [auth.verificarToken], 
    ArchivoController.descargar
);

module.exports = router;
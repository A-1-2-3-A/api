// routes/versiones.js

const express = require('express');
const router = express.Router();
const versionController = require('../controllers/versiones');
const auth = require('../middlewares/auth');
const crearUploadMiddleware = require('../middlewares/upload'); // Importamos la función de fábrica

// --- Definición de Roles ---
const todosLosRoles = ['Director', 'Secretario', 'Tribunal', 'Estudiante'];

// --- Rutas para el recurso "Versiones" ---

/**
 * POST /api/versiones/
 * Ruta para que un estudiante agregue una nueva versión de su tema.
 * Se usa el middleware para subir un único archivo al directorio 'temas'.
 */
router.post('/', 
    [auth.verificarToken, auth.verificarRol(['Estudiante']), crearUploadMiddleware('temas').single('archivo')], 
    versionController.agregar
);

/**
 * GET /api/versiones/tema/:id_tema
 * Ruta para listar las versiones de un tema específico. Accesible para todos los involucrados.
 */
router.get('/tema/:id_tema', 
    [auth.verificarToken, auth.verificarRol(todosLosRoles)], 
    versionController.listarPorTema
);

module.exports = router;
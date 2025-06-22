// routes/revisiones.js

const express = require('express');
const router = express.Router();
const revisionController = require('../controllers/revisiones');
const auth = require('../middlewares/auth');

// --- Rutas para el recurso "Revisiones" ---

/**
 * PUT /api/revisiones/:id_revision/veredicto
 * Registra el veredicto y las observaciones de un tribunal para una revisión específica.
 * Solo un usuario con rol 'Tribunal' puede acceder. La autorización final
 * (verificar que es el tribunal correcto para ESA revisión) se hace en el controlador.
 */
router.put('/:id_revision/veredicto', 
    [auth.verificarToken, auth.verificarRol(['Tribunal'])], 
    revisionController.registrarVeredicto
);

module.exports = router;
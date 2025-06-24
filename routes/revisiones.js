// routes/revisiones.js

const express = require('express');
const router = express.Router();
const revisionController = require('../controllers/revisiones');
const auth = require('../middlewares/auth');
const crearUploadMiddleware = require('../middlewares/upload');

// --- Rutas para el recurso "Revisiones" ---

/**
 * PUT /api/revisiones/:id_revision/veredicto
 * Registra el veredicto, las observaciones y opcionalmente un archivo de
 * retroalimentación para una revisión específica.
 */
router.put('/:id_revision/veredicto', 
    [
        auth.verificarToken, 
        auth.verificarRol(['Tribunal']),
        // NUEVO: Se añade el middleware para manejar un único archivo con el campo 'archivo_retroalimentacion'
        crearUploadMiddleware('retroalimentaciones').single('archivo_retroalimentacion')
    ], 
    revisionController.registrarVeredicto
);

module.exports = router;
// routes/especialidades.js

const express = require('express');
const router = express.Router();
const especialidadController = require('../controllers/especialidades');
const auth = require('../middlewares/auth');

/**
 * GET /api/especialidades
 * Obtiene una lista de todas las especialidades.
 * Accesible para cualquier usuario autenticado.
 */
router.get('/', auth.verificarToken, especialidadController.listar);

// --- NUEVAS RUTAS CRUD PROTEGIDAS ---

/**
 * POST /api/especialidades
 * Crea una nueva especialidad.
 * Solo para Director y Secretario.
 */
router.post('/',
    [auth.verificarToken, auth.verificarRol(['Director', 'Secretario'])],
    especialidadController.agregar
);

/**
 * PUT /api/especialidades/:id
 * Actualiza una especialidad existente.
 * Solo para Director y Secretario.
 */
router.put('/:id',
    [auth.verificarToken, auth.verificarRol(['Director', 'Secretario'])],
    especialidadController.actualizar
);

/**
 * DELETE /api/especialidades/:id
 * Elimina una especialidad existente.
 * Solo para Director y Secretario.
 */
router.delete('/:id',
    [auth.verificarToken, auth.verificarRol(['Director', 'Secretario'])],
    especialidadController.eliminar
);

module.exports = router;
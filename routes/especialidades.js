// routes/especialidades.js

const express = require('express');
const router = express.Router();
const especialidadController = require('../controllers/especialidades');
const auth = require('../middlewares/auth');

// --- Definición de Roles ---
// Solo los administradores pueden gestionar el catálogo de especialidades.
const rolesAdmin = ['Director', 'Secretario'];

// --- Rutas para el recurso "Especialidades" ---

// GET /api/especialidades/
// Lista todas las especialidades. Protegido para que solo usuarios logueados puedan verlas.
router.get('/', 
    [auth.verificarToken], 
    especialidadController.listar
);

// POST /api/especialidades/
// Agrega una nueva especialidad.
router.post('/', 
    [auth.verificarToken, auth.verificarRol(rolesAdmin)], 
    especialidadController.agregar
);

// PUT /api/especialidades/:id
// Actualiza una especialidad existente.
router.put('/:id', 
    [auth.verificarToken, auth.verificarRol(rolesAdmin)], 
    especialidadController.actualizar
);

// DELETE /api/especialidades/:id
// Elimina una especialidad.
router.delete('/:id', 
    [auth.verificarToken, auth.verificarRol(rolesAdmin)], 
    especialidadController.eliminar
);

module.exports = router;
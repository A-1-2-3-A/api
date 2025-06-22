// Importar lo necesario
const express = require('express');
const router = express.Router();
const EspecialidadController = require('../controllers/especialidades');
const auth = require('../middlewares/auth');

// --- Rutas para las Especialidades ---
const rolesPermitidos = ['Director', 'Secretario'];

// Ruta para listar todas las especialidades
router.get('/', [auth.verificarToken, auth.verificarRol(rolesPermitidos)], EspecialidadController.listar);

// Ruta para agregar una nueva especialidad
router.post('/', [auth.verificarToken, auth.verificarRol(rolesPermitidos)], EspecialidadController.agregar);

// Ruta para actualizar una especialidad por su ID
router.put('/:id', [auth.verificarToken, auth.verificarRol(rolesPermitidos)], EspecialidadController.actualizar);

// Ruta para eliminar una especialidad por su ID
router.delete('/:id', [auth.verificarToken, auth.verificarRol(rolesPermitidos)], EspecialidadController.eliminar);

// Exportacion del router
module.exports = router;
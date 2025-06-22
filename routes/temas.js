// Importar lo necesario
const express = require('express');
const router = express.Router();
const TemaController = require('../controllers/temas');
const auth = require('../middlewares/auth');
const upload = require('../middlewares/upload'); // Importar el middleware de subida

// --- Rutas para los Temas ---

// Rutas accesibles para todos los roles autenticados
const todosLosRoles = ['Director', 'Secretario', 'Tribunal', 'Estudiante'];
router.get('/', [auth.verificarToken, auth.verificarRol(todosLosRoles)], TemaController.listar);
router.get('/:id', [auth.verificarToken, auth.verificarRol(todosLosRoles)], TemaController.buscarPorId);

// Rutas con permisos específicos
router.put('/:id', [auth.verificarToken, auth.verificarRol(['Director', 'Secretario'])], TemaController.actualizar);

router.delete('/:id', [auth.verificarToken, auth.verificarRol(['Director'])], TemaController.eliminar);

// Ruta para agregar un nuevo tema, ahora con subida de archivo
router.post('/', [auth.verificarToken, auth.verificarRol(['Secretario']), upload.single('archivo_tema')], TemaController.agregar);

// Exportacion del router
module.exports = router;
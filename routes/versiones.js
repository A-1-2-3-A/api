// Importar lo necesario
const express = require('express');
const router = express.Router();
const VersionController = require('../controllers/versiones');
const auth = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// --- Rutas para las Versiones ---
const todosLosRoles = ['Director', 'Secretario', 'Tribunal', 'Estudiante'];

// Ruta para que un estudiante agregue una nueva versión de su tema
router.post('/', [auth.verificarToken, auth.verificarRol(['Estudiante']), upload.single('archivo_tema')], VersionController.agregar);

// Ruta para listar las versiones de un tema
router.get('/:id_tema', [auth.verificarToken, auth.verificarRol(todosLosRoles)], VersionController.listarPorTema);

module.exports = router;
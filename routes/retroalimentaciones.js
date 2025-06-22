// Importar lo necesario
const express = require('express');
const router = express.Router();
const RetroalimentacionController = require('../controllers/retroalimentaciones');
const auth = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// --- Rutas para las Retroalimentaciones ---
const rolesParaVer = ['Director', 'Secretario', 'Tribunal', 'Estudiante'];

// Ruta para que un tribunal agregue un comentario
router.post('/comentario/:id_asignacion', [auth.verificarToken, auth.verificarRol(['Tribunal'])], RetroalimentacionController.agregarComentario);

// Ruta para que un tribunal agregue un archivo
router.post('/archivo/:id_asignacion', [auth.verificarToken, auth.verificarRol(['Tribunal']), upload.single('archivo_retroalimentacion')], RetroalimentacionController.agregarArchivo);

// Ruta para listar toda la retroalimentación de una asignación
router.get('/:id_asignacion', [auth.verificarToken, auth.verificarRol(rolesParaVer)], RetroalimentacionController.listarPorAsignacion);

module.exports = router;
// routes/retroalimentaciones.js

const express = require('express');
const router = express.Router();
const retroalimentacionController = require('../controllers/retroalimentaciones');
const auth = require('../middlewares/auth');
const crearUploadMiddleware = require('../middlewares/upload'); // Importamos la función de fábrica

// --- Definición de Roles ---
const rolesParaVer = ['Director', 'Secretario', 'Tribunal', 'Estudiante'];

// --- Rutas para el recurso "Retroalimentaciones" ---

// POST /api/retroalimentaciones/comentario/:id_asignacion
// Ruta para que un tribunal agregue un comentario de texto a una asignación.
router.post('/comentario/:id_asignacion', 
    [auth.verificarToken, auth.verificarRol(['Tribunal'])], 
    retroalimentacionController.agregarComentario
);

// POST /api/retroalimentaciones/archivo/:id_asignacion
// Ruta para que un tribunal suba un archivo de retroalimentación.
// Se usa el middleware de subida configurado para la carpeta 'retroalimentaciones'.
router.post('/archivo/:id_asignacion', 
    [auth.verificarToken, auth.verificarRol(['Tribunal']), crearUploadMiddleware('retroalimentaciones').single('archivo_retroalimentacion')], 
    retroalimentacionController.agregarArchivo
);

// GET /api/retroalimentaciones/:id_asignacion?id_version_tema=##
// Ruta para listar todos los comentarios y archivos de una asignación y version.
router.get('/:id_asignacion', 
    [auth.verificarToken, auth.verificarRol(rolesParaVer)], 
    retroalimentacionController.listarPorAsignacionYVersion
);

module.exports = router;
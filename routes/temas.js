// routes/temas.js

const express = require('express');
const router = express.Router();
const temaController = require('../controllers/temas');
const auth = require('../middlewares/auth');
const crearUploadMiddleware = require('../middlewares/upload'); // Importamos la función de fábrica

// --- Definición de Roles ---
const rolesAdmin = ['Director', 'Secretario'];
const rolesTodos = ['Director', 'Secretario', 'Tribunal', 'Estudiante'];

// --- Rutas para el recurso "Temas" ---

// GET /api/temas/
// Lista los temas. La lógica en el controlador decide qué temas mostrar según el rol.
router.get('/', 
    [auth.verificarToken, auth.verificarRol(rolesTodos)], 
    temaController.listar
);

// GET /api/temas/:id
// Obtiene el detalle completo de un tema específico.
router.get('/:id', 
    [auth.verificarToken, auth.verificarRol(rolesTodos)], 
    temaController.buscarDetalle // Llamando a la función de detalle completo
);

// POST /api/temas/
// Agrega un nuevo tema. Solo para Secretarios. Requiere un archivo.
router.post('/', 
    [auth.verificarToken, auth.verificarRol(['Secretario']), crearUploadMiddleware('temas').single('archivo')], 
    temaController.agregar
);

// PUT /api/temas/:id
// Actualiza un tema. Solo para Secretarios. Puede incluir un archivo opcional.
router.put('/:id', 
    [auth.verificarToken, auth.verificarRol(['Secretario']), crearUploadMiddleware('temas').single('archivo')], 
    temaController.actualizar
);

// DELETE /api/temas/:id
// Elimina un tema. Solo para Director y Secretario.
router.delete('/:id', 
    [auth.verificarToken, auth.verificarRol(rolesAdmin)], 
    temaController.eliminar
);

module.exports = router;
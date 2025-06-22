// routes/asignaciones.js

const express = require('express');
const router = express.Router();
const asignacionController = require('../controllers/asignaciones');
const auth = require('../middlewares/auth');

// --- Definición de Roles ---
const rolesAdmin = ['Director', 'Secretario'];
const rolesTodos = ['Director', 'Secretario', 'Tribunal', 'Estudiante'];

// --- Rutas para el recurso "Asignaciones" ---

// POST /api/asignaciones/
// Crea las nuevas asignaciones de tribunales para un tema.
router.post('/', 
    [auth.verificarToken, auth.verificarRol(rolesAdmin)], 
    asignacionController.agregar
);

// GET /api/asignaciones/tema/:id_tema
// Lista las asignaciones (tribunales) para un tema específico.
router.get('/tema/:id_tema', 
    [auth.verificarToken, auth.verificarRol(rolesTodos)], 
    asignacionController.listarPorTema
);

// GET /api/asignaciones/tribunal/:id_tribunal
// Lista los temas asignados a un tribunal específico.
router.get('/tribunal/:id_tribunal', 
    [auth.verificarToken, auth.verificarRol(['Director', 'Tribunal'])], 
    asignacionController.listarPorTribunal
);

module.exports = router;
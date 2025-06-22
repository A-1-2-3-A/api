// routes/usuarios.js

const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarios');
const auth = require('../middlewares/auth');

// --- Definición de Roles ---
const rolesAdmin = ['Director', 'Secretario'];

// --- Rutas para el recurso "Usuarios" ---

// Ruta pública para el login
router.post('/login', usuarioController.login);

// --- Rutas Protegidas ---

// GET /api/usuarios/
// Lista todos los usuarios.
router.get('/', [auth.verificarToken, auth.verificarRol(rolesAdmin)], usuarioController.listar);

// GET /api/usuarios/perfil
// Una nueva ruta para obtener el perfil del usuario autenticado.
router.get('/perfil', [auth.verificarToken], (req, res) => {
    // Reutilizamos la función buscarPorId con el ID del token
    req.params.id = req.decoded.id;
    usuarioController.buscarPorId(req, res);
});


// GET /api/usuarios/:id
// Obtiene un usuario específico por su ID.
router.get('/:id', [auth.verificarToken, auth.verificarRol(rolesAdmin)], usuarioController.buscarPorId);

// POST /api/usuarios/
// Agrega un nuevo usuario.
router.post('/', [auth.verificarToken, auth.verificarRol(rolesAdmin)], usuarioController.agregar);

// PUT /api/usuarios/:id
// Actualiza un usuario existente.
router.put('/:id', [auth.verificarToken, auth.verificarRol(rolesAdmin)], usuarioController.actualizar);

// PATCH /api/usuarios/:id/estado
// Cambia el estado de un usuario (activo/inactivo). Es PATCH porque es una actualización parcial.
router.patch('/:id/estado', [auth.verificarToken, auth.verificarRol(rolesAdmin)], usuarioController.cambiarEstado);

// PUT /api/usuarios/:id/cambiar-clave
// Permite a un usuario cambiar su propia contraseña.
router.put('/:id/cambiar-clave', [auth.verificarToken], usuarioController.cambiarClave);


module.exports = router;
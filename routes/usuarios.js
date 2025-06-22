// Importar lo necesario
const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/usuarios');
const auth = require('../middlewares/auth');

// Ruta pública para el login
router.post('/login', UsuarioController.verificarCredenciales);

// Rutas privadas con autorización por rol
router.get('/listar', [auth.verificarToken, auth.verificarRol(['Director', 'Secretario'])], UsuarioController.listar);

router.post('/agregar', [auth.verificarToken, auth.verificarRol(['Director', 'Secretario'])], UsuarioController.agregar);

router.put('/actualizar/:id', [auth.verificarToken, auth.verificarRol(['Director', 'Secretario'])], UsuarioController.actualizar);

router.delete('/eliminar/:id', [auth.verificarToken, auth.verificarRol(['Director'])], UsuarioController.eliminar);

router.put('/cambiar-clave/:id', [auth.verificarToken], UsuarioController.cambiarClave);

// Exportacion
module.exports = router;
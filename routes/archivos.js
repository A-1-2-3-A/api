// Importar lo necesario
const express = require('express');
const router = express.Router();
const ArchivoController = require('../controllers/archivos');
const auth = require('../middlewares/auth');

// Ruta para descargar archivos. Requiere autenticación.
router.get('/descargar', auth.verificarToken, ArchivoController.descargar);

module.exports = router;
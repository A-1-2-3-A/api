// api/routes/archivos.js

const express = require('express');
const router = express.Router();
const ArchivoController = require('../controllers/archivos');
const auth = require('../middlewares/auth');

// Ruta para que el ESTUDIANTE descargue un archivo de retroalimentación
router.get('/retroalimentacion/estudiante/:id',
    [auth.verificarToken, auth.verificarRol(['Estudiante'])],
    ArchivoController.descargarRetroalimentacionEstudiante
);

// Ruta para que el TRIBUNAL descargue la versión del tema de un estudiante
router.get('/tema-version/:id',
    [auth.verificarToken, auth.verificarRol(['Tribunal'])],
    ArchivoController.descargarVersionTemaTribunal
);

// Ruta para que el TRIBUNAL descargue su propio archivo de retroalimentación
router.get('/retroalimentacion/tribunal/:id',
    [auth.verificarToken, auth.verificarRol(['Tribunal'])],
    ArchivoController.descargarRetroalimentacionTribunal
);

// Ruta para que un Admin (Director/Secretario) descargue una versión de tema.
router.get('/tema-version/admin/:id',
    [auth.verificarToken, auth.verificarRol(['Director', 'Secretario'])],
    ArchivoController.descargarVersionTemaAdmin
);

// Ruta para que un Estudiante descargue su propia versión de tema.
router.get('/tema-version/estudiante/:id',
    [auth.verificarToken, auth.verificarRol(['Estudiante'])],
    ArchivoController.descargarVersionTemaEstudiante
);

module.exports = router;
// Importar lo necesario
const express = require('express');
const router = express.Router();
const AsignacionController = require('../controllers/asignaciones');
const auth = require('../middlewares/auth');

// --- Rutas para las Asignaciones ---
const todosLosRoles = ['Director', 'Secretario', 'Tribunal', 'Estudiante'];

// Ruta para designar tribunales a un tema (Solo Director)
router.post('/', [auth.verificarToken, auth.verificarRol(['Director'])], AsignacionController.agregar);

// Ruta para ver los tribunales de un tema (Todos los roles)
router.get('/tema/:id_tema', [auth.verificarToken, auth.verificarRol(todosLosRoles)], AsignacionController.listarPorTema);

// Ruta para ver los temas de un tribunal (Solo Director y el Tribunal correspondiente)
// NOTA: La autorización específica (solo el propio tribunal) debería manejarse en el controlador.
router.get('/tribunal/:id_tribunal', [auth.verificarToken, auth.verificarRol(['Director', 'Tribunal'])], AsignacionController.listarPorTribunal);

// Ruta para que un tribunal registre su veredicto
// NOTA: La autorización específica (solo el tribunal de esa asignación) debería manejarse en el controlador.
router.put('/veredicto/:id_asignacion', [auth.verificarToken, auth.verificarRol(['Tribunal'])], AsignacionController.registrarVeredicto);


// Exportacion del router
module.exports = router;
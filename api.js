// api.js

// Cargar las variables de entorno desde el archivo .env
require('dotenv').config();

// Importar dependencias
const express = require('express');
const cors = require('cors'); // Middleware para permitir peticiones de otros dominios
const path = require('path');

// Inicializar la aplicación Express
const app = express();

// --- Middlewares Globales ---
app.use(cors()); // Habilitar CORS para todas las rutas
app.use(express.json()); // Para parsear cuerpos de petición en formato JSON
app.use(express.urlencoded({ extended: true })); // Para parsear cuerpos de petición URL-encoded

// --- Servir Archivos Estáticos ---
// Hacemos que la carpeta 'uploads' sea accesible públicamente.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Conexión a la Base de Datos ---
require('./config/database');

// --- Rutas de la API ---
app.get('/api', (req, res) => {
    res.status(200).json({ success: 1, message: 'Bienvenido a la API del Sistema de Gestión de Temas v1.0' });
});

// -- Registro de todas las rutas de la aplicación --
app.use('/api/public', require('./routes/public'));
app.use('/api/usuarios', require('./routes/usuarios')); 
app.use('/api/temas', require('./routes/temas'));
app.use('/api/especialidades', require('./routes/especialidades'));
app.use('/api/asignaciones', require('./routes/asignaciones'));
app.use('/api/versiones', require('./routes/versiones'));
app.use('/api/retroalimentaciones', require('./routes/retroalimentaciones'));
app.use('/api/archivos', require('./routes/archivos'));
app.use('/api/revisiones', require('./routes/revisiones')); // <-- Se añade la nueva ruta para revisiones

// --- Inicio del Servidor ---
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '127.0.0.1';

app.listen(PORT, HOST, () => {
    console.log(`Servidor API funcionando en http://${HOST}:${PORT}`);
});
// Variables de entorno
require('dotenv').config();

// Importar express
const express = require('express');
const app = express();

// --- Middlewares ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Conexión a la Base de Datos ---
require('./config/database');

// --- Rutas de la API ---
app.get('/', (req, res) => {
    res.status(200).send('Bienvenido a la API del Sistema de Gestión de Temas');
});

// Rutas Públicas (no requieren token)
app.use('/public', require('./routes/public'));

// Rutas Privadas (requieren token y autorización)
app.use('/usuarios', require('./routes/usuarios'));
app.use('/temas', require('./routes/temas'));
app.use('/especialidades', require('./routes/especialidades'));
app.use('/asignaciones', require('./routes/asignaciones'));
app.use('/versiones', require('./routes/versiones'));
app.use('/retroalimentaciones', require('./routes/retroalimentaciones'));

// --- Inicio del Servidor ---
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '127.0.0.1';

app.listen(PORT, HOST, () => {
    console.log(`Servidor API funcionando en http://${HOST}:${PORT}`);
});
// Modelo de usuarios.js
const UsuarioModel = require('../models/usuarios');
const jwt = require('jsonwebtoken');

// Función para listar usuarios
const listar = (req, res) => {
    UsuarioModel.listar((err, results) => {
        if (err) {
            console.error('Error al listar usuarios:', err);
            return res.status(500).json({ success: 0, message: 'Error al listar usuarios' });
        }
        return res.status(200).json({ success: 1, message: 'Usuarios obtenidos con exito', data: results });
    });
};

// Función para agregar un usuario
const agregar = (req, res) => {
    const usuario = req.body;
    UsuarioModel.agregar(usuario, (err, results) => {
        if (err) {
            console.error('Error al agregar usuario:', err);
            return res.status(500).json({ success: 0, message: 'Error en la Base de Datos al agregar usuario' });
        }
        return res.status(201).json({ success: 1, message: 'Usuario agregado con exito', data: { id: results.id } });
    });
};

// Función para actualizar un usuario
const actualizar = (req, res) => {
    const usuario = req.body;
    usuario.id = req.params.id; // Se toma el ID de la URL
    UsuarioModel.actualizar(usuario, (err, results) => {
        if (err) {
            console.error('Error al actualizar usuario:', err);
            return res.status(500).json({ success: 0, message: 'Error en la Base de Datos al actualizar usuario' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ success: 0, message: 'Usuario no encontrado' });
        }
        return res.status(200).json({ success: 1, message: 'Usuario actualizado con exito' });
    });
};

// Función para eliminar (desactivar) un usuario
const eliminar = (req, res) => {
    const id = req.params.id; // Se toma el ID de la URL
    UsuarioModel.desactivar(id, (err, results) => {
        if (err) {
            console.error('Error al eliminar usuario:', err);
            return res.status(500).json({ success: 0, message: 'Error en la Base de Datos al eliminar usuario' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ success: 0, message: 'Usuario no encontrado' });
        }
        return res.status(200).json({ success: 1, message: 'Usuario desactivado con exito' });
    });
};

// Funcion para verificar credenciales y generar token
const verificarCredenciales = (req, res) => {
    const body = req.body;
    UsuarioModel.verificarCredenciales(body, (err, results) => {
        if (err) {
            console.error('Error al verificar credenciales:', err);
            return res.status(500).json({ success: 0, message: 'Error en la Base de Datos' });
        }
        if (!results) {
            return res.status(401).json({ success: 0, message: 'Credenciales incorrectas o usuario inactivo' });
        }
        const { id, usuario, rol } = results;
        const token = jwt.sign({ id, usuario, rol }, process.env.SECRET, { expiresIn: '1h' });
        return res.status(200).json({ success: 1, message: 'Credenciales verificadas con exito', data: { id, usuario, rol }, token: token });
    });
};

const cambiarClave = (req, res) => {
    const id = req.params.id;
    const { clave_actual, clave_nueva } = req.body;
    const id_token = req.decoded.id;

    if (parseInt(id) !== id_token) {
        return res.status(403).json({ success: 0, message: 'Acceso denegado. No puedes cambiar la clave de otro usuario.' });
    }

    UsuarioModel.verificarCredenciales({ usuario: req.decoded.usuario, clave: clave_actual }, (err, usuario) => {
        if (err || !usuario) {
            return res.status(401).json({ success: 0, message: 'Clave actual incorrecta.' });
        }

        UsuarioModel.actualizar({ id, clave: clave_nueva }, (err, result) => {
            if (err) return res.status(500).json({ success: 0, message: 'Error al cambiar la contraseña.' });
            return res.status(200).json({ success: 1, message: 'Contraseña actualizada con éxito.' });
        });
    });
};


module.exports = {
    listar,
    agregar,
    actualizar,
    eliminar,
    verificarCredenciales,
    cambiarClave
};
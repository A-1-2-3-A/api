// controllers/usuarios.js

const UsuarioModel = require('../models/usuarios');
const jwt = require('jsonwebtoken');

// Función para listar todos los usuarios
const listar = (req, res) => {
    UsuarioModel.listar((err, results) => {
        if (err) {
            console.error('Error al listar usuarios:', err);
            return res.status(500).json({ success: 0, message: 'Error interno del servidor.' });
        }
        res.status(200).json({ success: 1, data: results });
    });
};

// Función para buscar un usuario por su ID
const buscarPorId = (req, res) => {
    const id = req.params.id;
    UsuarioModel.buscarPorId(id, (err, result) => {
        if (err) {
            console.error(`Error al buscar usuario con ID ${id}:`, err);
            return res.status(500).json({ success: 0, message: 'Error interno del servidor.' });
        }
        if (!result) {
            return res.status(404).json({ success: 0, message: 'Usuario no encontrado.' });
        }
        res.status(200).json({ success: 1, data: result });
    });
};

// Función para agregar un nuevo usuario
const agregar = (req, res) => {
    const usuarioData = req.body;

    // Validación básica de entrada
    if (!usuarioData.usuario || !usuarioData.clave || !usuarioData.nombres || !usuarioData.apellido_primero || !usuarioData.rol) {
        return res.status(400).json({ success: 0, message: 'Faltan campos requeridos.' });
    }

    UsuarioModel.agregar(usuarioData, (err, result) => {
        if (err) {
            console.error('Error al agregar usuario:', err);
            // Manejo de error de usuario duplicado
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ success: 0, message: 'El correo electrónico ya está en uso.' });
            }
            return res.status(500).json({ success: 0, message: 'Error al agregar el usuario.' });
        }
        res.status(201).json({ success: 1, message: 'Usuario agregado con éxito.', data: { id: result.id } });
    });
};

// Función para actualizar un usuario
const actualizar = (req, res) => {
    const idUsuario = req.params.id;
    const usuarioData = req.body;
    UsuarioModel.actualizar(idUsuario, usuarioData, (err, result) => {
        if (err) {
            console.error(`Error al actualizar usuario con ID ${idUsuario}:`, err);
            return res.status(500).json({ success: 0, message: 'Error al actualizar el usuario.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: 0, message: 'Usuario no encontrado.' });
        }
        res.status(200).json({ success: 1, message: 'Usuario actualizado con éxito.' });
    });
};

// Función para cambiar el estado de un usuario (activar/desactivar)
const cambiarEstado = (req, res) => {
    const id = req.params.id;
    const estado = req.body.estado; // Se espera un booleano: true o false

    if (typeof estado !== 'boolean') {
        return res.status(400).json({ success: 0, message: 'El campo "estado" debe ser un valor booleano.' });
    }

    UsuarioModel.cambiarEstado(id, estado, (err, result) => {
        if (err) {
            console.error(`Error al cambiar estado del usuario con ID ${id}:`, err);
            return res.status(500).json({ success: 0, message: 'Error al cambiar el estado del usuario.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: 0, message: 'Usuario no encontrado.' });
        }
        const accion = estado ? 'activado' : 'desactivado';
        res.status(200).json({ success: 1, message: `Usuario ${accion} con éxito.` });
    });
};

// Función para el login de usuarios
const login = (req, res) => {
    const { usuario, clave } = req.body;
    if (!usuario || !clave) {
        return res.status(400).json({ success: 0, message: 'Usuario y clave son requeridos.' });
    }

    UsuarioModel.verificarCredenciales(usuario, clave, (err, result) => {
        if (err) {
            console.error('Error en login:', err);
            return res.status(500).json({ success: 0, message: 'Error interno del servidor.' });
        }
        if (!result) {
            return res.status(401).json({ success: 0, message: 'El correo electrónico o la contraseña son incorrectos.' });
        }
        
        // Se extraen solo los datos necesarios para el payload del token y la respuesta
        const userData = {
            id: result.id,
            usuario: result.usuario,
            rol: result.rol,
            nombres: result.nombres,
            apellido_primero: result.apellido_primero
        };

        const token = jwt.sign(userData, process.env.SECRET, { expiresIn: '8h' });

        // Se devuelve la estructura exacta que espera el FrontEnd
        res.status(200).json({ success: 1, data: userData, token: token });
    });
};

// Función para cambiar la contraseña de un usuario autenticado
const cambiarClave = (req, res) => {
    const idUsuarioRuta = parseInt(req.params.id);
    const idUsuarioToken = req.decoded.id;
    const { clave_actual, clave_nueva } = req.body;

    if (idUsuarioRuta !== idUsuarioToken) {
        return res.status(403).json({ success: 0, message: 'Acceso denegado. No puedes cambiar la contraseña de otro usuario.' });
    }

    if (!clave_actual || !clave_nueva) {
        return res.status(400).json({ success: 0, message: 'La clave actual y la nueva son requeridas.' });
    }

    // Primero, verificamos que la clave actual sea correcta
    UsuarioModel.verificarCredenciales(req.decoded.usuario, clave_actual, (err, usuario) => {
        if (err || !usuario) {
            return res.status(401).json({ success: 0, message: 'La contraseña actual es incorrecta.' });
        }

        // Si es correcta, actualizamos a la nueva
        UsuarioModel.cambiarClave(idUsuarioToken, clave_nueva, (err, result) => {
            if (err) {
                console.error(`Error al cambiar clave del usuario con ID ${idUsuarioToken}:`, err);
                return res.status(500).json({ success: 0, message: 'Error al actualizar la contraseña.' });
            }
            res.status(200).json({ success: 1, message: 'Contraseña actualizada con éxito.' });
        });
    });
};


module.exports = {
    listar,
    buscarPorId,
    agregar,
    actualizar,
    cambiarEstado,
    login,
    cambiarClave
};
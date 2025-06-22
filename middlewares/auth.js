const jwt = require('jsonwebtoken');

// Middleware para verificar si el token es válido y está presente
const verificarToken = (req, res, next) => {
    let token = req.get('authorization');
    if (!token) {
        return res.status(403).json({ success: 0, message: 'Token no proporcionado.' });
    }

    // Se asume el formato "Bearer <token>"
    if (token.startsWith('Bearer ')) {
        token = token.slice(7);
    }

    jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ success: 0, message: 'Token inválido o expirado.' });
        }
        req.decoded = decoded; // Se adjunta el payload del token (id, usuario, rol)
        next();
    });
};

// Middleware para verificar si el rol del usuario tiene permiso
const verificarRol = (rolesPermitidos) => {
    return (req, res, next) => {
        const rolUsuario = req.decoded.rol;

        if (rolesPermitidos.includes(rolUsuario)) {
            // El rol del usuario está en la lista de roles permitidos, puede continuar
            next();
        } else {
            // El rol del usuario no tiene permiso
            return res.status(403).json({ success: 0, message: 'Acceso denegado. No tienes los permisos necesarios.' });
        }
    };
};

module.exports = {
    verificarToken,
    verificarRol
};

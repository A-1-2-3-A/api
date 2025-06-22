const path = require('path');
const fs = require('fs');

// Función para descargar un archivo del servidor
const descargar = (req, res) => {
    const rutaRelativa = req.query.ruta;

    if (!rutaRelativa) {
        return res.status(400).json({ success: 0, message: 'No se ha proporcionado la ruta del archivo.' });
    }

    // Medida de seguridad: Asegurarse de que la ruta solo acceda a la carpeta 'uploads'
    if (!rutaRelativa.startsWith('uploads/')) {
        return res.status(403).json({ success: 0, message: 'Acceso denegado.' });
    }

    const rutaAbsoluta = path.join(__dirname, '../', rutaRelativa);

    if (fs.existsSync(rutaAbsoluta)) {
        res.download(rutaAbsoluta, (err) => {
            if (err) {
                console.error("Error al descargar el archivo:", err);
                res.status(500).json({ success: 0, message: 'No se pudo descargar el archivo.' });
            }
        });
    } else {
        return res.status(404).json({ success: 0, message: 'Archivo no encontrado.' });
    }
};

module.exports = {
    descargar
};
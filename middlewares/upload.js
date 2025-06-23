// middlewares/upload.js

const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Función de fábrica que crea un middleware de subida de archivos de Multer 
 * configurado para una subcarpeta específica dentro de /uploads.
 * @param {('temas'|'retroalimentaciones')} subcarpeta - La subcarpeta de destino.
 * @returns Un middleware de Multer configurado.
 */
const crearUploadMiddleware = (subcarpeta) => {
    const directorioDestino = path.join(__dirname, `../uploads/${subcarpeta}`);

    // Asegurarse de que el directorio de destino existe
    if (!fs.existsSync(directorioDestino)) {
        fs.mkdirSync(directorioDestino, { recursive: true });
    }

    // Configuración de almacenamiento con Multer
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, directorioDestino);
        },
        filename: (req, file, cb) => {
            // Toma el nombre base sin extensión y lo corta a 40 caracteres
            let nombreBase = path.parse(file.originalname).name;
            if (nombreBase.length > 40) {
                nombreBase = nombreBase.substring(0, 40);
            }
            // Genera el nombre personalizado: nombreCortado-timestamp.ext
            const nombreUnico = `${nombreBase}-${Date.now()}${path.extname(file.originalname)}`;
            cb(null, nombreUnico);
        }
    });

    // Filtro para aceptar únicamente archivos PDF
    const fileFilter = (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Tipo de archivo no válido. Solo se aceptan PDFs.'), false);
        }
    };

    return multer({
        storage: storage,
        limits: { fileSize: 10 * 1024 * 1024 }, // Límite de 10 MB
        fileFilter: fileFilter
    });
};

module.exports = crearUploadMiddleware;
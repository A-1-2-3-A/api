const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Se definen las carpetas de destino
const directorios = {
    temas: path.join(__dirname, '../uploads/temas'),
    retroalimentaciones: path.join(__dirname, '../uploads/retroalimentaciones')
};

// Se asegura de que los directorios de subida existan
Object.values(directorios).forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Configuración de almacenamiento con Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = '';
        if (req.originalUrl.includes('/temas') || req.originalUrl.includes('/revisiones/version')) {
            uploadPath = directorios.temas;
        } else if (req.originalUrl.includes('/revisiones/retroalimentacion')) {
            uploadPath = directorios.retroalimentaciones;
        }

        if (uploadPath) {
             cb(null, uploadPath);
        } else {
             cb(new Error('Ruta de subida no válida'), null);
        }
    },
    filename: (req, file, cb) => {
        // Se genera un nombre de archivo único para evitar sobreescritura
        const nombreUnico = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
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

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 10 }, // Límite de 10 MB
    fileFilter: fileFilter
});

module.exports = upload;
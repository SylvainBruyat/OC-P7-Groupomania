const multer = require('multer');

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};


//TODO Ajouter un contrôle pour rejeter les fichiers non-images
/* if (file.originalname.split('.').pop() != ("jpg" || "jpeg" || "png" || "webp"))
    throw "Invalid file type"; */

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images');
    },
    filename: (req, file, callback) => {
        //Enlève l'extension du nom d'origine puis ajoute un horodatage 
        let name = file.originalname.replace(/ /g, '_').split('.');
        name.pop();
        name.join('.');
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name + '_' + Date.now() + '.' + extension);
    }
});

module.exports = multer({storage}).single('image');
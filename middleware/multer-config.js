const multer = require('multer');

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp'
};

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

function fileFilter(req, file, callback) {
    const acceptedFileTypes = /jpg|jpeg|png|gif|webp/;
    const extension = file.originalname.split('.').pop().toLowerCase();
    const validExtension = acceptedFileTypes.test(extension);
    const validMimetype = acceptedFileTypes.test(file.mimetype);
    if (validExtension === true && validMimetype === true)
        callback(null, true);
    else
        callback("Accepted file types are: jpg, jpeg, png, gif and webp", false);
}

module.exports = multer({storage, fileFilter}).single('image');
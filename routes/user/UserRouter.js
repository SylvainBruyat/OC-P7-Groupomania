const express = require('express');
const router = express.Router();

const userController = require('./UserController');
const auth = require('../../middleware/auth');
const multer = require('../../middleware/multer-config');

router.post('/signup', multer, userController.signup);
router.post('/login', userController.login);
router.get('/:id', auth, userController.getProfile);
router.put('/:id', auth, multer, userController.updateProfile);
router.delete('/:id', auth, userController.deleteProfile);

module.exports = router;
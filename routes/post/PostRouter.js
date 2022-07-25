const express = require('express');
const router = express.Router();

const PostController = require('./PostController');
const auth = require('../../middleware/auth');
const multer = require('../../middleware/multer-config');

router.post('/', auth, multer, PostController.createPost);
router.get('/:page', auth, PostController.getFivePosts);
router.get('/user/:id', auth, PostController.getFivePostsFromUser);
router.get('/:id', auth, PostController.getOnePost);
router.put('/:id', auth, multer, PostController.modifyPost);
router.delete('/:id', auth, PostController.deletePost);
router.post('/:id/like', auth, PostController.likePost);

module.exports = router;
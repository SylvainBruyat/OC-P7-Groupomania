const express = require('express');
const router = express.Router();

const CommentController = require('./CommentController');
const auth = require('../../middleware/auth');

router.post('/', auth, CommentController.createComment);
router.get('/:id', auth, CommentController.getTwoComments);
router.get('/:id/all', auth, CommentController.getAllComments);
router.put('/:id', auth, CommentController.modifyComment);
router.delete('/:id', auth, CommentController.deleteComment);
router.post('/:id/like', auth, CommentController.likeComment);

module.exports = router;
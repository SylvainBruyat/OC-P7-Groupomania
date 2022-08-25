const Comment = require('./CommentModel').model;
const Post = require('../post/PostModel').model;
const User = require('../user/UserModel').model;

exports.createComment = async (req, res, next) => {
    try {
        const comment = new Comment({
            ...req.body,
            userId: req.auth.userId,
            numberOfLikes: 0,
            likeUserIds: [],
            creationTimestamp: Date.now(),
            modificationTimestamp: null
        });
        const savedComment = await comment.save();
        await savedComment.populate('userId', 'firstName lastName');
        return res.status(201).json({message: "Comment created successfully", comment: savedComment});
    }
    catch (error) {
        console.error(error);
        res.status(500).json({message: "Internal server error"});
    }
}

exports.getAllComments = async (req, res, next) => {
    try {
        let post = await Post.findOne({_id: req.params.postId}).lean();
        if (!post)
            return res.status(404).json({message: "Post not found"});
        let comments = await Comment
            .find({postId: req.params.postId})
            .sort({creationTimestamp: "ascending"})
            .populate('userId', 'firstName lastName')
            .lean();
        res.status(200).json(comments);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({message: "Internal server error"});
    }
}

exports.modifyComment = async (req, res, next) => {
    try {
        const requestingUser = await User.findOne({_id: req.auth.userId}).select('-password').lean();
        if (!requestingUser)
            return res.status(403).json({message: "Forbidden request"});

        let comment = await Comment.findOne({_id: req.params.id}); //TODO Voir pour remplacer par findOneAndUpdate()
        if (!comment)
            return res.status(404).json({message: "Comment not found"});

        if (comment.userId != req.auth.userId && requestingUser.admin !== true)
            return res.status(403).json({message: "Forbidden Request"});

        const commentObject = {
            ...req.body,
            modificationTimestamp: Date.now()
        };

        //Empêche de modifier les likes sur ce endpoint
        delete commentObject.numberOfLikes;
        delete commentObject.likeUserIds;

        await Comment.updateOne({_id: req.params.id}, {...commentObject, _id: req.params.id});
        res.status(200).json({message: "Comment successfully modified"});
    }
    catch (error) {
        console.error(error);
        res.status(500).json({message: "Internal server error"});
    }
}

exports.deleteComment = async (req, res, next) => {
    try {
        const requestingUser = await User.findOne({_id: req.auth.userId}).select('-password').lean();
        if (!requestingUser)
            return res.status(403).json({message: "Forbidden request"});

        let comment = await Comment.findOne({_id: req.params.id});

        if (!comment)
            return res.status(404).json({message: "Comment not found"});

        if (comment.userId != req.auth.userId && requestingUser.admin !== true)
            return res.status(403).json({message: "Forbidden Request"});

        await Comment.deleteOne({_id: req.params.id});
        res.status(200).json({message: "Comment successfully deleted"});
    }
    catch (error) {
        console.error(error);
        res.status(500).json({message: "Internal server error"});
    }
}

exports.likeComment = async (req, res, next) => {
    try {
        let comment = await Comment.findOne({_id: req.params.id});

        if (!comment)
            return res.status(404).json({message: "Comment not found"});
    
        const userAlreadyLiked = comment.likeUserIds.find(userId => userId == req.auth.userId);
        switch (req.body.like) {
            case 0:
                if (userAlreadyLiked) {
                    await Comment.updateOne({_id: req.params.id}, {$inc: {numberOfLikes: -1}, $pull: {likeUserIds: req.auth.userId}});
                    break;
                }
                else {
                    return res.status(409).json({message: "No like to remove on this comment"});
                }
            
            case 1:
                if (userAlreadyLiked) {
                    return res.status(409).json({message: "Comment already liked"});
                }
                else {
                    await Comment.updateOne({_id: req.params.id}, {$inc: {numberOfLikes: 1}, $push: {likeUserIds: req.auth.userId}});
                    break;
                }
            default :
                return res.status(400).json({message: "Invalid request"});
        }
        comment = await Comment.findOne({_id: req.params.id});
        await comment.populate('userId', 'firstName lastName')
        return res.status(201).json({message: "Like taken into acount", comment});
    }
    catch (error) {
        console.error(error);
        res.status(500).json({message: "Internal server error"});
    }
}
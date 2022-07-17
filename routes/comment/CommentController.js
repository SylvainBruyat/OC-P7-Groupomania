const Comment = require('./CommentModel').model;
const Post = require('../post/PostModel').model;

exports.createComment = async (req, res, next) => {
    try {
        const comment = new Comment({
            ...req.body,
            numberOfLikes: 0,
            likeUserIds: [],
            creationTimestamp: Date.now(),
            modificationTimestamp: null
        });
        await comment.save();
        return res.status(201).json({message: "Comment created successfully"});
    }
    catch (error) {
        console.error(error);
        res.status(500).json({message: "Internal server error"});
    }
}

exports.getTwoComments = async (req, res, next) => {
    try {
        let post = await Post.findOne({_id: req.params.id}).lean();
        if (!post)
            return res.status(404).json({message: "Post not found"});

        let comments = await Comment.find({postId: req.params.id}).sort({creationTimestamp: "descending"}).limit(2);
        if (!comments) //TODO Vérifier si find() peut renvoyer null ou undefined
            return res.status(404).json({message: "Comment not found !"}); 
        res.status(200).json(comments);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({message: "Internal server error"});
    }
}

exports.getAllComments = async (req, res, next) => {
    try {
        let post = await Post.findOne({_id: req.params.id}).lean();
        if (!post)
            return res.status(404).json({message: "Post not found"});
        //TODO Voir si c'est une bonne idée de passer les 2 commentaires normalement déjà récupérés par getTwoComments()
        let comments = await Comment.find({postId: req.params.id}).sort({creationTimestamp: "descending"}).skip(2);
        if (!comments) //TODO Vérifier si find() peut renvoyer null ou undefined
            return res.status(404).json({message: "Comment not found !"});
        res.status(200).json(comments);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({message: "Internal server error"});
    }
}

exports.modifyComment = async (req, res, next) => {
    try {
        let comment = await Comment.findOne({_id: req.params.id}).lean(); //TODO Voir pour remplacer par findOneAndUpdate()
        if (!comment)
            return res.status(404).json({message: "Comment not found !"});

        if (comment.userId !== req.auth.userId) //TODO Ajouter la condition admin.
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
        let comment = await Comment.findOne({_id: req.params.id});

        if (!comment)
            return res.status(404).json({message: "Comment not found"});

        if (comment.userId !== req.auth.userId) //TODO Ajouter la condition admin.
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
                    return res.status(201).json({message: "Like removed"});
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
                    return res.status(201).json({message: "Like taken into acount"});
                }
            default :
                return res.status(400).json({message: "Invalid request"});
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({message: "Internal server error"});
    }
}
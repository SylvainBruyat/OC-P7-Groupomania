const fs = require('fs/promises');

const Post = require('./PostModel').model;
const User = require('../user/UserModel').model;

exports.createPost = async (req, res, next) => {
    try {
        const post = req.file ?
        new Post({
            ...JSON.parse(req.body.post),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
            numberOfLikes: 0,
            likeUserIds: [],
            creationTimestamp: Date.now(),
            modificationTimestamp: null
        })
        : new Post({
            ...req.body,
            imageUrl: "",
            numberOfLikes: 0,
            likeUserIds: [],
            creationTimestamp: Date.now(),
            modificationTimestamp: null
        });
        await post.save();
        return res.status(201).json({message: "Post created successfully"});
    }
    catch (error) {
        console.error(error);
        res.status(500).json({message: "Internal server error"});
    }
}

exports.getFivePosts = async (req, res, next) => {
    try {
        let posts = await Post.find()
            .sort({creationTimestamp: "descending"})
            .skip(req.body.offset).limit(5);
        if (!posts) //TODO Vérifier si find() peut renvoyer null ou undefined
            return res.status(404).json({message: "Post not found !"}); 
        res.status(200).json(posts);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({message: "Internal server error"});
    }
}

exports.getFivePostsFromUser = async (req, res, next) => {
    try {
        let user = await User.findOne({_id: req.params.id}).select('-password').lean();
        if (!user)
            return res.status(404).json({message: "User not found"});

        let posts = await Post.find({userId: req.params.id})
            .sort({creationTimestamp: "descending"})
            .skip(req.body.offset).limit(5);
        if (!posts) //TODO Vérifier si find() peut renvoyer null ou undefined
            return res.status(404).json({message: "Post not found !"});
        res.status(200).json(posts);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({message: "Internal server error"});
    }
}

exports.getOnePost = async (req, res, next) => {
    try {
        let post = await Post.findOne({_id: req.params.id});
        if (!post)
            return res.status(404).json({message: "Post not found !"});
        res.status(200).json(post);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({message: "Internal server error"});
    }
}

exports.modifyPost = async (req, res, next) => {
    try {
        let post = await Post.findOne({_id: req.params.id}).lean(); //TODO Voir pour remplacer par findOneAndUpdate()
        if (!post)
            return res.status(404).json({message: "Post not found !"});

        if (post.userId !== req.auth.userId)
            return res.status(403).json({message: "Forbidden Request"});

        if (req.file) {
            if (post.imageUrl !== "") {
                const filename = post.imageUrl.split('/images/')[1];
                await fs.unlink(`images/${filename}`);
            }
            post.imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
        }

        const postObject = req.file ?
            {
                ...JSON.parse(req.body.post),
                imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
                modificationTimestamp: Date.now()
            }
            : {
                ...req.body,
                modificationTimestamp: Date.now()
            };
        
        //Empêche de modifier les likes sur ce endpoint
        delete postObject.numberOfLikes;
        delete postObject.likeUserIds;

        await Post.updateOne({_id: req.params.id}, {...postObject, _id: req.params.id});
        res.status(200).json({message: "Post successfully modified"});
    }
    catch (error) {
        /* TODO Voir pour supprimer l'image si une erreur a lieu après l'enregistrement de la nouvelle image
        if (req.file)
            await fs.unlink(`images/${req.file.filename}`); */
        console.error(error);
        res.status(500).json({message: "Internal server error"});
    }
}

exports.deletePost = async (req, res, next) => {
    try {
        let post = await Post.findOne({_id: req.params.id});

        if (!post)
            return res.status(404).json({message: "Post not found"});

        if (post.userId !== req.auth.userId) //TODO Ajouter la condition admin.
            return res.status(403).json({message: "Forbidden Request"});

        if (post.imageUrl !== "") {
            const filename = post.imageUrl.split('/images/')[1];
            await fs.unlink(`images/${filename}`);
        }

        await Post.deleteOne({_id: req.params.id});
        res.status(200).json({message: "Post successfully deleted"});
    }
    catch (error) {
        console.error(error);
        res.status(500).json({message: "Internal server error"});
    }
}

exports.likePost = async (req, res, next) => {
    try {
        let post = await Post.findOne({_id: req.params.id});

        if (!post)
            return res.status(404).json({message: "Post not found"});
    
        const userAlreadyLiked = post.likeUserIds.find(userId => userId == req.auth.userId);
        switch (req.body.like) {
            case 0:
                if (userAlreadyLiked) {
                    await Post.updateOne({_id: req.params.id}, {$inc: {numberOfLikes: -1}, $pull: {likeUserIds: req.auth.userId}});
                    return res.status(201).json({message: "Like removed"});
                }
                else {
                    return res.status(409).json({message: "No like to remove on this post"});
                }
            
            case 1:
                if (userAlreadyLiked) {
                    return res.status(409).json({message: "Post already liked"});
                }
                else {
                    await Post.updateOne({_id: req.params.id}, {$inc: {numberOfLikes: 1}, $push: {likeUserIds: req.auth.userId}});
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
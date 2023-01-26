const ftp = require('jsftp');

const Post = require('./PostModel').model;
const User = require('../user/UserModel').model;
const Comment = require('../comment/CommentModel').model;

exports.createPost = async (req, res, next) => {
    try {
        let post = new Post({
            userId: req.auth.userId,
            numberOfLikes: 0,
            likeUserIds: [],
            creationTimestamp: Date.now(),
            modificationTimestamp: null,
        })
        post.text = req.file ? req.body.post : req.body.text;
        post.imageUrl = req.file ? `${process.env.BASE_URL}/images/${req.file.filename}` : '';

        if (req.file) {
            const client = await new ftp({
                host: process.env.FTP_HOST,
                user: process.env.FTP_USER,
                pass: process.env.FTP_PASSWORD
            });
            await client.put(req.file.buffer, `images/${req.file.originalname}`, async (error) => {
                if (error) throw error;
            });
        }
        const savedPost = await post.save();
        await savedPost.populate('userId', 'firstName lastName');
        return res.status(201).json({message: "Post created successfully", post: savedPost});
    }
    catch (error) {
        if (req.file) {
            const client = await new ftp({
                host: process.env.FTP_HOST,
                user: process.env.FTP_USER,
                pass: process.env.FTP_PASSWORD
            });
            await client.raw("DELE", `images/${req.file.originalname}`, (error, data) => {
                console.log({data});
            })
        }
        console.error(error);
        res.status(500).json({message: "Internal server error"});
    }
}

exports.getFivePosts = async (req, res, next) => {
    try {
        let posts = await Post.find()
            .sort({creationTimestamp: "descending"})
            .skip((req.query.page-1)*5)
            .limit(5)
            .populate('userId', 'firstName lastName')
            .lean();
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
            .skip((req.query.page-1)*5)
            .limit(5)
            .populate('userId', 'firstName lastName')
            .lean();
        res.status(200).json(posts);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({message: "Internal server error"});
    }
}

exports.getOnePost = async (req, res, next) => {
    try {
        let post = await Post.findOne({_id: req.params.id})
            .populate('userId', 'firstName lastName')
            .lean();
        if (!post)
            return res.status(404).json({message: "Post not found"});
        res.status(200).json(post);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({message: "Internal server error"});
    }
}

exports.modifyPost = async (req, res, next) => {
    try {
        const requestingUser = await User.findOne({_id: req.auth.userId}).select('-password').lean();
        if (!requestingUser)
            return res.status(403).json({message: "Forbidden request"});

        let post = await Post.findOne({_id: req.params.id});
        if (!post)
            return res.status(404).json({message: "Post not found"});

        if (post.userId != req.auth.userId && requestingUser.admin !== true)
            return res.status(403).json({message: "Forbidden Request"});

        if (req.file) {
            const client = await new ftp({
                host: process.env.FTP_HOST,
                user: process.env.FTP_USER,
                pass: process.env.FTP_PASSWORD
            });
            await client.put(req.file.buffer, `images/${req.file.originalname}`, async (error) => {
                if (error) throw error;
            });

            const previousPostPictureName = post.imageUrl.split('/images/')[1];
            if (previousPostPictureName) {
                await client.auth(process.env.FTP_USER, process.env.FTP_PASSWORD, (error) => {
                    if (error) throw error;
                })
                await client.raw("DELE", `images/${previousPostPictureName}`, (error, data) => {
                    if (error) throw error;
                })
            }
        }

        const postObject = req.file ?
            {
                text: req.body.post,
                imageUrl: `${process.env.BASE_URL}/images/${req.file.filename}`,
                modificationTimestamp: Date.now()
            }
            : {
                ...req.body,
                modificationTimestamp: Date.now()
            };
        
        //Empêche de modifier les likes sur ce endpoint. Plus nécessaire après validation des entrées utilisateur
        delete postObject.numberOfLikes;
        delete postObject.likeUserIds;

        await Post.updateOne({_id: req.params.id}, {...postObject, _id: req.params.id});
        res.status(200).json({message: "Post successfully modified"});
    }
    catch (error) {
        if (req.file) {
            const client = await new ftp({
                host: process.env.FTP_HOST,
                user: process.env.FTP_USER,
                pass: process.env.FTP_PASSWORD
            });
            await client.raw("DELE", `images/${req.file.originalname}`, (error, data) => {
                console.log({data});
            })
        }
        console.error(error);
        res.status(500).json({message: "Internal server error"});
    }
}

exports.deletePost = async (req, res, next) => {
    try {
        const requestingUser = await User.findOne({_id: req.auth.userId}).select('-password').lean();
        if (!requestingUser)
            return res.status(403).json({message: "Forbidden request"});

        const post = await Post.findOne({_id: req.params.id});
        if (!post)
            return res.status(404).json({message: "Post not found"});

        if (post.userId != req.auth.userId && requestingUser.admin !== true)
            return res.status(403).json({message: "Forbidden Request"});

        await Comment.deleteMany({postId: req.params.id});

        await Post.deleteOne({_id: req.params.id});
        res.status(200).json({message: "Post successfully deleted"});

        if (post.imageUrl !== "") {
            const filename = post.imageUrl.split('/images/')[1];
            const client = await new ftp({
                host: process.env.FTP_HOST,
                user: process.env.FTP_USER,
                pass: process.env.FTP_PASSWORD
            });
            await client.raw("DELE", `images/${filename}`, (error, data) => {
                if (error) throw error;
            })
        }
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
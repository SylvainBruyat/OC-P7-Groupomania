const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs/promises');
const passwordValidator = require('password-validator');
const { request } = require('http');

const User = require('./UserModel').model;
const Post = require('../post/PostModel').model;
const Comment = require('../comment/CommentModel').model;

exports.signup = async (req, res, next) => {
    try {
        const schema = new passwordValidator();
        schema
            .is().min(8)
            .has().lowercase()
            .has().uppercase()
            .has().digits()
            .has().symbols()
            .has().not().spaces()
            .is().not().oneOf(req.body.email, req.body.firstName, req.body.lastName);
        const passwordFailureCriteria = schema.validate(req.body.password, {list: true});
        if (passwordFailureCriteria.length !== 0)
            return res.status(400).json({message: "Invalid password", failedCriteria: passwordFailureCriteria});

        let hash = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            email: req.body.email,
            password: hash,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            profilePictureUrl: "",
            admin: false
        });
        await user.save();
        res.status(201).json({message: "Account created successfully"});
    }
    catch (error) {
        if (error.errors.email && error.errors.email.properties.type === "unique"){
            console.error(error);
            res.status(409).json({message: "An account already exists with this email address"});
        }
        else {
            console.error(error);
            res.status(500).json({message: "Internal server error"});
        }
    }
};

exports.login = async (req, res, next) => {
    try {
        const user = await User.findOne({email: req.body.email}).lean();
        if (!user)
            return res.status(404).json({error: "There is no account linked to this email address"});

        const validPassword = await bcrypt.compare(req.body.password, user.password)
        if (!validPassword)
            return res.status(401).json({error: "Invalid password"});

        res.status(200).json({
            token: jwt.sign(
                {userId: user._id, admin: user.admin,},
                process.env.TOKEN_KEY,
                {expiresIn: '24h'}
            )
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({message: "Internal server error"});
    }
};

exports.getProfile = async (req, res, next) => {
    try {
        const requestingUser = await User.findOne({_id: req.auth.userId}).select('-password').lean();
        if (!requestingUser)
            return res.status(403).json({message: "Forbidden request"});

        let user = await User.findOne({_id: req.params.id}).select('-password').lean();
        if (!user)
            return res.status(404).json({message: "User not found"});

        if (user._id == req.auth.userId || requestingUser.admin === true)
            return res.status(200).json(user);

        delete user.email;
        delete user.admin;
        return res.status(200).json(user);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({message: "Internal server error"});
    }
};

exports.updateProfile = async (req, res, next) => {
    try {
        const requestingUser = await User.findOne({_id: req.auth.userId}).select('-password').lean();
        if (!requestingUser)
            return res.status(403).json({message: "Forbidden request"});

        if (req.params.id !== req.auth.userId && requestingUser.admin !== true)
            return res.status(403).json({message: "Forbidden Request"});

        let user = await User.findOne({_id: req.params.id}); //TODO Voir pour remplacer par findOneAndUpdate()
        
        if (!user)
            return res.status(404).json({message: "User not found"});

        const userObject = req.file ?
            {
                profilePictureUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
            }
            : {...req.body};
        await User.updateOne({_id: req.params.id}, {...userObject});
        res.status(200).json({message: "User profile successfully modified", profilePictureUrl: userObject.profilePictureUrl});

        const previousProfilePictureName = user.profilePictureUrl.split('/images/')[1];
        if (previousProfilePictureName) {
            await fs.unlink(`images/${previousProfilePictureName}`);
        }
    }
    catch (error) {
        if (req.file)
            await fs.unlink(`images/${req.file.filename}`);
        console.error(error);
        res.status(500).json({message: "Internal server error"});
    }
};

exports.deleteProfile = async (req, res, next) => {
    try {
        const requestingUser = await User.findOne({_id: req.auth.userId}).select('-password').lean();
        if (!requestingUser)
            return res.status(403).json({message: "Forbidden request"});

        if (req.params.id !== req.auth.userId && requestingUser.admin !== true)
            return res.status(403).json({message: "Forbidden Request"});

        let user = await User.findOne({_id: req.params.id});
        if (!user)
            return res.status(404).json({message: "User not found"});

        await Comment.deleteMany({userId: req.params.id});
        await Post.deleteMany({userId: req.params.id});

        await User.deleteOne({_id: req.params.id});
        res.status(200).json({message: "User successfully deleted"});

        if (user.profilePictureUrl !== "") {
            const filename = user.profilePictureUrl.split('/images/')[1];
            await fs.unlink(`images/${filename}`);
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({message: "Internal server error"});
    }
};
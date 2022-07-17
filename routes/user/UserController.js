const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs/promises');

const User = require('./UserModel').model;

exports.signup = async (req, res, next) => {
    try {        
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
            console.log(error);
            res.status(500).json({message: "Internal server error"});
        }
    }
};

exports.login = async (req, res, next) => {
    try {
        const user = await User.findOne({email: req.body.email})
        if (!user)
            return res.status(404).json({error: "There is no account linked to this email address"});

        const validPassword = await bcrypt.compare(req.body.password, user.password)
        if (!validPassword)
            return res.status(401).json({error: "Invalid password"});

        res.status(200).json({
            userId: user._id,
            token: jwt.sign(
                {userId: user._id},
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
        let user = await User.findOne({_id: req.params.id}).select('-password').lean();

        if (!user)
            return res.status(404).json({message: "User not found"});

        if (user._id == req.auth.userId)
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
        let user = await User.findOne({_id: req.params.id}).lean(); //TODO Voir pour remplacer par findOneAndUpdate()
        if (req.file) {
            if (user.profilePictureUrl !== "") {
                const filename = user.profilePictureUrl.split('/images/')[1];
                await fs.unlink(`images/${filename}`);
            }
            user.profilePictureUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
        }

        const userObject = req.file ?
            {
                ...JSON.parse(req.body.user),
                profilePictureUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
            }
            : {...req.body};

        await User.updateOne({_id: req.params.id}, {...userObject, _id: req.params.id});
        res.status(200).json({message: "User profile successfully modified"});
    }
    catch (error) {
        /* TODO Voir pour supprimer l'image si une erreur a lieu après l'enregistrement de la nouvelle image
        if (req.file)
            await fs.unlink(`images/${req.file.filename}`); */
        console.error(error);
        res.status(500).json({message: "Internal server error"});
    }
};

exports.deleteProfile = async (req, res, next) => {
    try {
        if (req.params.id !== req.auth.userId) //TODO Ajouter la condition admin.
            return res.status(403).json({message: "Forbidden Request"});

        let user = await User.findOne({_id: req.params.id});
        
        if (!user)
            return res.status(404).json({message: "User not found"});

        if (user.profilePictureUrl !== "") {
            const filename = user.profilePictureUrl.split('/images/')[1];
            await fs.unlink(`images/${filename}`);
        }

        await User.deleteOne({_id: req.params.id});
        res.status(200).json({message: "User successfully deleted"});
    }
    catch (error) {
        console.error(error);
        res.status(500).json({message: "Internal server error"});
    }
};
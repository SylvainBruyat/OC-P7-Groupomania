const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.TOKEN_KEY);
        const userId = decodedToken.userId;
        req.auth = {userId};

        //TODO Voir si ce contrôle est utile ici, en fonction de ce qui est fait dans les contrôleurs
        if (req.body.userId && req.body.userId !== userId)
            throw "Invalid User ID";
        else
            next();
    }
    catch (error) {
        res.status(401).json({error: error || "Request not authenticated"});
    }
};
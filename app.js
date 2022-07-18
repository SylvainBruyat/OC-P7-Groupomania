const express = require('express');
const mongoose = require('mongoose');
const app = express();

const path = require ('path');
const dotenv = require('dotenv');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");

const User = require('./routes/user/UserRouter');
const Post = require('./routes/post/PostRouter');
const Comment = require('./routes/comment/CommentRouter');

dotenv.config();

mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}
@groupomania.ffc77.mongodb.net/?retryWrites=true&w=majority`)
    .then(() => console.log("Connection to MongoDB successful"))
    .catch(() => console.log("Connection to MongoDB failed"));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    next();
});

app.use(express.json());
app.use(helmet());
app.use(mongoSanitize({allowDots: true}));

/* TODO Ajouter des couches de sécurité :
    contrôle des entrées utilisateur (package joi ?),
    limitation du nombre de requêtes (package express-rate-limit ?),
    etc.
*/

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/user', User);
app.use('/api/post', Post);
app.use('/api/comment', Comment);

module.exports = app;
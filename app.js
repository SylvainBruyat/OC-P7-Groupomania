const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const app = express();

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

/* TODO Ajouter des couches de sécurité :
    contrôle des entrées utilisateur (package joi ?),
    protection contre les attaques par injection (package mongoSanitize ?),
    package helmet ?,
    etc.
*/

app.use('/api/user', User);
app.use('/api/post', Post);
app.use('/api/comment', Comment);

module.exports = app;
const mongoose = require('mongoose');

let postDefinition = {
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    text: {type: String, required: true},
    imageUrl: {type: String, required: false},
    numberOfLikes: {type: Number, required: true},
    likeUserIds: {type: Array, required: true},
    creationTimestamp: {type: Date, required: true}, //Essayer de raccourcir ces noms. Voir pour utiliser les timestamp par défaut de mongo
    modificationTimestamp: {type: Date, required: false}
};

let postSchema = new mongoose.Schema(postDefinition);

module.exports = {
    definition: postDefinition,
    schema: postSchema,
    model: mongoose.model("Post", postSchema)
};
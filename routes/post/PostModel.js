const mongoose = require('mongoose');

let postDefinition = {
    userId: {type: String, required: true},
    title: {type: String, required: false},
    text: {type: String, required: true},
    imageUrl: {type: String, required: false},
    numberOfLikes: {type: Number, required: true},
    likeUserIds: {type: Array, required: true},
    creationTimestamp: {type: Date, required: true},
    modificationTimestamp: {type: Date, required: false}
};

let postSchema = new mongoose.Schema(postDefinition);

module.exports = {
    definition: postDefinition,
    schema: postSchema,
    model: mongoose.model("Post", postSchema)
};
const mongoose = require('mongoose');

let commentDefinition = {
    userId: {type: String, required: true},
    postId: {type: String, required: true},
    text: {type: String, required: true},
    numberOfLikes: {type: Number, required: true},
    likeUserIds: {type: Array, required: true},
    creationTimestamp: {type: Date, required: true},
    modificationTimestamp: {type: Date, required: false}
};

let commentSchema = new mongoose.Schema(commentDefinition);

module.exports = {
    definition: commentDefinition,
    schema: commentSchema,
    model: mongoose.model("Comment", commentSchema)
};
const mongoose = require('mongoose');

let commentDefinition = {
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
    postId: {type: String, required: true},
    text: {type: String, required: true, maxLength: 5000},
    numberOfLikes: {type: Number, required: true},
    likeUserIds: {type: Array, required: true},
    //Essayer de raccourcir ces noms. Voir pour utiliser les timestamp par défaut de mongo
    creationTimestamp: {type: Date, required: true},
    modificationTimestamp: {type: Date, required: false}
};

let commentSchema = new mongoose.Schema(commentDefinition);

module.exports = {
    definition: commentDefinition,
    schema: commentSchema,
    model: mongoose.model("Comment", commentSchema)
};
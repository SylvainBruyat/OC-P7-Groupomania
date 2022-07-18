const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userDefinition = {
    email: {type: String, required: true, unique: true, uniqueCaseInsensitive: true},
    password: {type: String, required: true},
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    profilePictureUrl: {type: String, required: false},
    admin: {type: Boolean, required: true, default: false}
}

const userSchema = new mongoose.Schema(userDefinition);
userSchema.plugin(uniqueValidator);

module.exports = {
    definition: userDefinition,
    schema: userSchema,
    model: mongoose.model('User', userSchema)
};
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userDefinition = {
    email: {type: String, required: true, unique: true, uniqueCaseInsensitive: true, maxLength: 200},
    password: {type: String, required: true, maxLength: 200},
    firstName: {type: String, required: true, maxLength: 50},
    lastName: {type: String, required: true, maxLength: 50},
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
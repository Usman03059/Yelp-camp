const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passpotlocalmongoose = require('passport-local-mongoose');
const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
})
UserSchema.plugin(passpotlocalmongoose);
module.exports = mongoose.model('User', UserSchema);
let mongoose = require('../libs/mongoose'),
    Schema = mongoose.Schema;

let schema = new Schema({
    login: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    }
},{collection: 'users'});

exports.User = mongoose.model('User', schema);

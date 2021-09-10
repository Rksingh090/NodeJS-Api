const mongoose = require('mongoose')
const { Schema } = mongoose

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    mobileNo: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true,
        minlength: 5
    },
    role: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('User', userSchema)

const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    profileImg: {
        type: String,
        default: "default.png"
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    }],
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "notes",
    }],
}, {timestamps: true} )

const User = mongoose.model("user", userSchema)

module.exports = {
    User,
}
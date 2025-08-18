const mongoose = require("mongoose")

const notesSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    date: {
        type: Date,
        default: Date.now,
    },
    classname: {
        type: String,
        required: true,
    },
    notesInfo: {
        type: String,
        required: true,
    },
    notesImages: [{
        type: String,
        required: true,
    }]

})

const Notes = mongoose.model("notes", notesSchema)

module.exports = {
    Notes,
}
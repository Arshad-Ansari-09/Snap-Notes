const mongoose = require("mongoose");

function connect (URL){
    return mongoose.connect(URL)
}

module.exports = {
    connect,
}
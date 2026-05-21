const jwt = require("jsonwebtoken")
const SECRET_KEY = process.env.JWT_SECRET

function signToken(payload){
    return jwt.sign(payload, SECRET_KEY, {expiresIn: "7d"})
}

function verifyToken(token){
    return jwt.verify(token, SECRET_KEY)
}

module.exports = {
    signToken,
    verifyToken,
}
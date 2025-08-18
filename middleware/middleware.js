const {verifyToken} = require("../service/auth")

function checkAuth(req, res, next){
    const token = req.cookies.token;
    if(!token){
        return res.redirect("/login")
    }
    try{
        const user = verifyToken(token);
        req.user = user;
        next();
    } catch{
        return res.redirect("/");
    }
}

module.exports = {
    checkAuth,
}
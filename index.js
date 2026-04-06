require('dotenv').config();
const {connect} = require("./connection")
const express= require("express")
const app = express()
const http = require("http");
const path = require("path");
const server = http.createServer(app);
const cookieParser= require("cookie-parser")
const {router} = require("./routes/routes")
const PORT = process.env.PORT || 8000;

connect(process.env.atlas_URL)
.then(() => console.log("MONGO DB CONNECTED"))
.catch((err) => console.log(err))

app.set("view engine", "ejs")
app.set("views", path.resolve("./views"))

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended : true }))
app.use(express.json())
app.use(cookieParser())

app.use("/", router)


server.listen(PORT, () => console.log("SERVER CONNECTED AT PORT", PORT))

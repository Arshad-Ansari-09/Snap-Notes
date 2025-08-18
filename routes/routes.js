const express = require("express")
const router = express.Router()
const {upload, profileimgUpload} = require("../multer/multer")
const {checkAuth} = require("../middleware/middleware")
const {homePage, signupPage, signup, loginPage, login, logout, friendsPage, usersAllNotes, profile, profilePage, changeProfileImgPage, changeProfileImg, uploadNotesPage, uploadNotes, updateNotes, addToFriends, deleteFriend, myNotesPage, deleteNotes } = require("../controllers/controllers")

// Home
router.get("/", checkAuth, homePage)

// Signup
router.get("/signup", signupPage)
router.post("/signup", signup)

// Login
router.get("/login", loginPage)
router.post("/login", login)

// Friends
router.get("/friends", checkAuth, friendsPage)
router.get("/friend/:id/notes", checkAuth, friendsPage)

// View user's all notes
router.get("/user/:id/allNotes", checkAuth, usersAllNotes)

// Profile
router.get("/profile", checkAuth, profilePage)
router.post("/profile", checkAuth, profile)

// Change Profile Image
router.get("/change/profileImg", checkAuth, changeProfileImgPage)
router.post("/change/profileImg", checkAuth, profileimgUpload.single("profileImg"), changeProfileImg)


// Upload Notes
router.get("/upload/notes", checkAuth, uploadNotesPage)
router.post("/upload/notes", checkAuth, upload.array("notesImages", 10) , uploadNotes)


// Add To Friend
router.get("/addFriend/:id", checkAuth, addToFriends)

// Delete Friend
router.get("/delete/friend/:id", checkAuth, deleteFriend)

// My all Notes
router.get("/myNotes", checkAuth, myNotesPage)
router.post("/updateNote/:id", checkAuth, updateNotes)

// Delete Notes
router.get("/deleteNotes/:id", checkAuth, deleteNotes)


// Logout
router.get("/logout", checkAuth, logout)

module.exports = {
    router,
}
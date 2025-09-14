const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

const { Notes } = require("../model/notesModel")
const { User } = require("../model/userModel")
const { signToken } = require("../service/auth")
const bcrypt = require("bcrypt")

// Home
async function homePage(req, res) {
    const loggedInUser = await User.findOne({ email: req.user.email }).populate("friends")
    const notes = await Notes.find({}).populate("user").sort({ date: -1 })
    return res.render("home", { notes, loggedInUser })
}

// Signup 
function signupPage(req, res) {
    return res.render("signup")
}

async function signup(req, res) {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.render("signup", { error: "Email already registered!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        username,
        email,
        password: hashedPassword,
        profileImg: "https://res.cloudinary.com/da3xuvuus/image/upload/v1755686150/default_ldpsps.jpg", // 👈 default image
    })
    const token = signToken({ email, _id: user._id })
    res.cookie("token", token, { httpOnly: true })
    res.redirect("/")
}

// Login
function loginPage(req, res) {
    return res.render("login")
}

async function login(req, res) {
    const { email, password } = req.body;
    const user = await User.findOne({ email }) // Here we find user with only email bcz we have hashed pass while creating acc. and if we compare req.body password with this password means with hashed password then it will null ad will throw an err
    if (!user) {
        res.redirect("/login")
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.redirect("/login"); // Wrong password
    }

    const token = signToken({ email, _id: user._id })
    res.cookie("token", token, { httpOnly: true })
    res.redirect("/")
}

// Friends Page
async function friendsPage(req, res) {
    const loggedInUser = await User.findOne({ email: req.user.email }).populate("friends");
    const user = await User.findOne({ _id: req.params.id }).populate("posts")
    res.render("friends", { friends: loggedInUser.friends, user });
}

// User's all notes Page
async function usersAllNotes(req, res) {
    const loggedInUser = await User.findOne({ email: req.user.email })
    const notes = await Notes.find({ user: req.params.id })
    const user = await User.findById(req.params.id)
    return res.render("usersAllNotes", { notes, user, loggedInUser })
}

// Profile
async function profilePage(req, res) {
    const loggedInUser = await User.findOne({ email: req.user.email }).populate("posts")
    const allUsersWithMeInFriends = await User.find({ friends: req.user._id });
    return res.render("profile", { loggedInUser, followers: allUsersWithMeInFriends })
}

async function profile(req, res) {
    const { username } = req.body
    const user = await User.findOneAndUpdate({ email: req.user.email }, { username }, { new: true })
    return res.redirect("/profile");
}

// Change Profile Image
function changeProfileImgPage(req, res) {
    res.render("changeProfileImg")
}

async function changeProfileImg(req, res) {
    const loggedInUser = await User.findOne({ email: req.user.email });

    // Delete old profile image from Cloudinary if it's not the default image
    if (loggedInUser.profileImg && !loggedInUser.profileImg.includes("default_ldpsps.jpg")) {
        const parts = loggedInUser.profileImg.split("/");
        const fileName = parts[parts.length - 1];
        const publicId = `profile_img/${fileName.split(".")[0]}`;
        await cloudinary.uploader.destroy(publicId);
    }

    // Update with new uploaded image
    loggedInUser.profileImg = req.file.path;
    await loggedInUser.save();
    res.redirect("/profile")
}

// Upload Notes
function uploadNotesPage(req, res) {
    return res.render("upload")
}

async function uploadNotes(req, res) {
    const loggedInUser = await User.findOne({ email: req.user.email })
    const { classname, notesInfo } = req.body;
    const imageFiles = req.files.map(file => file.path);
    const notes = await Notes.create({
        user: loggedInUser._id,
        classname,
        notesInfo,
        notesImages: imageFiles,
    })

    loggedInUser.posts.push(notes._id)
    await loggedInUser.save();

    res.redirect("/");
}

// Update Notes
async function updateNotes(req, res) {
    try {
        const { classname, notesInfo } = req.body;
        const currentNote = await Notes.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { classname, notesInfo }, { new: true })

        if (!currentNote) {
            return res.status(403).send("Forbidden: You can only update your own notes");
        }

        res.redirect("/myNotes")
    } catch (error) {
        res.status(500).send("Server error, please try again later");
    }
}

// Add Friends
async function addToFriends(req, res) {
    try {
        const loggedInUser = await User.findOne({ email: req.user.email });
        const friendToAdd = await User.findById(req.params.id);

        // Prevent adding self
        if (!friendToAdd || friendToAdd._id.equals(loggedInUser._id)) {
            return res.redirect("/");
        }

        // Add friend to loggedInUser's list
        if (!loggedInUser.friends.includes(friendToAdd._id)) {
            loggedInUser.friends.push(friendToAdd._id);
            await loggedInUser.save();
        }

        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.redirect("/friends");
    }
}

// Delete Friends
async function deleteFriend(req, res) {
    const loggedInUser = await User.findOne({ email: req.user.email })
    loggedInUser.friends.pull(req.params.id)  // Pull removes matching ID from array(searchedFriends)
    loggedInUser.save()
    res.redirect("/friends")
}

// My all Notes
async function myNotesPage(req, res) {
    const loggedInUser = await User.findOne({ email: req.user.email });
    const notes = await Notes.find({ user: loggedInUser._id }).populate("user").sort({ date: -1 });
    res.render("myAllNotes", { loggedInUser, notes });
}

// Delete my notes
async function deleteNotes(req, res) {
    // const notes = await Notes.findOneAndDelete({id: req.params._id})  // 👉 Delete notes only from app but not from cloudinary which don't free up cloudinary space even if user deletes its notes.

    // 👇 Delete notes from cloudinary also which free up space every time user delete it's notes    
    const note = await Notes.findOne({ _id: req.params.id, user: req.user._id }); // find the note by MongoDB _id
    if (!note) return res.redirect("/myNotes");

    // Delete all images of this note from Cloudinary
    if (note.notesImages && note.notesImages.length > 0) {
        for (const imgUrl of note.notesImages) {
            // Extract public_id from the URL
            const parts = imgUrl.split("/"); // split URL by "/"
            const fileName = parts[parts.length - 1]; // get last part (file name with extension)
            const publicId = `notes_images/${fileName.split(".")[0]}`; // remove extension and add folder name
            await cloudinary.uploader.destroy(publicId);
        }
    }

    // Delete the note from MongoDB
    await Notes.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.redirect("/myNotes")
}

// Logout
function logout(req, res) {
    res.clearCookie("token")
    res.redirect("/login")
}

module.exports = {
    homePage,
    signupPage,
    signup,
    loginPage,
    login,
    friendsPage,
    usersAllNotes,
    profilePage,
    profile,
    changeProfileImgPage,
    changeProfileImg,
    uploadNotes,
    uploadNotesPage,
    updateNotes,
    addToFriends,
    deleteFriend,
    myNotesPage,
    deleteNotes,
    logout,
}
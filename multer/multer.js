const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// For Uploading the notes
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "notes_images",
    resource_type: "auto",
  },
});
const upload = multer({ storage });

// For Changing the profile Image
const ProfileImgStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "profile_img",
    resource_type: "auto",
  },
});

const profileimgUpload = multer({ storage: ProfileImgStorage })

// For default profile Image
const defaultProfileImg = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "profile_pics", // folder in your Cloudinary account
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const defaultImg = multer({ storage: defaultProfileImg })

module.exports = { upload , profileimgUpload, defaultImg};
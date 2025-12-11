const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// For Uploading the notes
// --- File Size and Type Restrictions ---
// Set max file size to 5MB (5 * 1024 * 1024 bytes)
const MAX_FILE_SIZE = 5 * 1024 * 1024; 

// Define allowed MIME types for notes (e.g., JPEG, PNG, PDF)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
        // Accept the file
        cb(null, true);
    } else {
        // Reject the file and provide an error message
        cb(new Error("Invalid file type. Only images (JPG/PNG) and PDF files are allowed."), false);
    }
};


// For Uploading the notes
const storage = new CloudinaryStorage({
 cloudinary,
 params: {
  folder: "notes_images",
  resource_type: "auto",
    // 💡 OPTIMIZATION STEP: Apply transformation to compress files immediately
    transformation: [
        { quality: "auto:low" }, // Adjust quality automatically for smaller file size
        { fetch_format: "auto" } // Deliver in best modern format (e.g., WebP)
    ]
 },
});

// **Updated Multer Setup for Notes Upload**
const upload = multer({ 
    storage, 
    limits: { 
        // Enforce the 5MB maximum size limit
        fileSize: MAX_FILE_SIZE 
    },
    // Enforce file type check
    fileFilter: fileFilter 
});

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
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  createComplaint,
  getComplaints,
} = require("../controllers/complaintController");

// --- Multer Configuration ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save to server/uploads/
  },
  filename: (req, file, cb) => {
    // Unique filename: fieldname-timestamp.ext  e.g. image-1714900000000.jpg
    const uniqueName = `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  if (isValid) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpg, png, webp) are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

// --- Routes ---
router.post("/", upload.single("image"), createComplaint);
router.get("/", getComplaints);

module.exports = router;
// complaintRoutes.js
// POST is now protected — only logged in citizens can submit
// GET is public — anyone can see complaints on map

const express    = require("express");
const router     = express.Router();
const multer     = require("multer");
const path       = require("path");
const { createComplaint, getComplaints, updateStatus } = require("../controllers/complaintController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Multer config — same as before
const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, "uploads/"); },
  filename:    (req, file, cb) => {
    const uniqueName = `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const valid   = allowed.test(path.extname(file.originalname).toLowerCase());
  valid ? cb(null, true) : cb(new Error("Only image files allowed"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// POST — protected (citizen must be logged in)
router.post("/",        protect, upload.single("image"), createComplaint);

// GET — public
router.get("/",         getComplaints);

// PUT — admin only (update complaint status)
router.put("/:id/status", protect, adminOnly, updateStatus);

module.exports = router;
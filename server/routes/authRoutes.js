// authRoutes.js — Auth API endpoints

const express    = require("express");
const router     = express.Router();
const {
  sendOTP,
  verifyOTP,
  adminLogin
} = require("../controllers/authController");

// POST /api/auth/send-otp     → send OTP to citizen
// POST /api/auth/verify-otp   → verify OTP + get token
// POST /api/auth/admin-login  → admin password login
router.post("/send-otp",    sendOTP);
router.post("/verify-otp",  verifyOTP);
router.post("/admin-login", adminLogin);

module.exports = router;
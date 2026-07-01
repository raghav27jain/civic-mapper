// authController.js
// Handles all authentication logic:
// 1. Send OTP to citizen (mock — prints in console)
// 2. Verify OTP → give token
// 3. Admin login → give token

const jwt    = require("jsonwebtoken");
const User   = require("../models/User");

// Helper — generate a random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper — create a JWT token
// Token contains user id, name, phone, role
// Expires in 7 days
const createToken = (user) => {
  return jwt.sign(
    {
      id:    user._id,
      name:  user.name,
      phone: user.phone,
      role:  user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};


// ── POST /api/auth/send-otp ──────────────────────────
// Citizen enters name + phone → OTP generated + saved
// In production: send via SMS. Here: print in console.

const sendOTP = async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: "Name and phone are required" });
    }

    // Phone number validation — must be 10 digits
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: "Enter a valid 10-digit phone number" });
    }

    // Check if user already exists with this phone
    // If yes → update their record (they're logging in again)
    // If no  → create new user
    let user = await User.findOne({ phone });

    const otp       = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    if (user) {
      // Existing user — update name (they might have changed it) + new OTP
      user.name      = name;
      user.otp       = otp;
      user.otpExpiry = otpExpiry;
      await user.save();
    } else {
      // New user — create record
      user = await User.create({ name, phone, otp, otpExpiry });
    }

    // ── MOCK OTP — prints in server console ──
    // In production: replace this with SMS API call
    console.log("\n========================================");
    console.log(`📱 OTP for ${name} (${phone}): ${otp}`);
    console.log("========================================\n");

    res.status(200).json({
      success: true,
      message: "OTP sent successfully. Check server console.",
      // In development: send OTP in response too (remove in production)
      devOtp: process.env.NODE_ENV === "development" ? otp : undefined,
    });

  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// ── POST /api/auth/verify-otp ────────────────────────
// Citizen enters the OTP → verified → get token

const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: "Phone and OTP are required" });
    }

    // Find user with this phone
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({ message: "User not found. Please request OTP first." });
    }

    // Check if OTP matches
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP. Please try again." });
    }

    // Check if OTP is expired
    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    // OTP verified! Clear it from DB so it can't be reused
    user.otp        = null;
    user.otpExpiry  = null;
    user.isVerified = true;
    await user.save();

    // Create and return token
    const token = createToken(user);

    res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id:   user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// ── POST /api/auth/admin-login ───────────────────────
// Admin enters password → get token

const adminLogin = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // Compare with admin password stored in .env
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ message: "Invalid admin password" });
    }

    // Create a fake admin user object for the token
    // We don't store admin in DB — it's a single hardcoded account
    const adminUser = {
      _id:   "admin-001",
      name:  "Admin",
      phone: "0000000000",
      role:  "admin",
    };

    const token = createToken(adminUser);

    res.status(200).json({
      success: true,
      message: "Admin login successful!",
      token,
      user: adminUser,
    });

  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { sendOTP, verifyOTP, adminLogin };
// User.js — Schema for citizens who register/login
// Stores name, phone, OTP, and OTP expiry time

const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,           // One account per phone number
      trim: true,
    },
    otp: {
      type: String,
      default: null,          // Null when no OTP is pending
    },
    otpExpiry: {
      type: Date,
      default: null,          // OTP expires after 5 minutes
    },
    isVerified: {
      type: Boolean,
      default: false,         // Becomes true after first OTP verify
    },
    role: {
      type: String,
      enum: ["citizen", "admin"],
      default: "citizen",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
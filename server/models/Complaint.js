// Complaint.js — Updated with citizenName + citizenPhone fields

const mongoose = require("mongoose");

const ComplaintSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [500, "Max 500 characters"],
    },
    imageUrl: {
      type: String,
      default: null,
    },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    category: {
      type: String,
      enum: ["pothole", "garbage", "waterlogging", "streetlight", "other"],
      default: "other",
    },
    priorityScore: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "resolved"],
      default: "open",
    },
    // New fields — citizen identity (only visible to admin)
    citizenName: {
      type: String,
      default: "Anonymous",
    },
    citizenPhone: {
      type: String,
      default: "N/A",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", ComplaintSchema);
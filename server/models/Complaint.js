const mongoose = require("mongoose");

const ComplaintSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    imageUrl: {
      type: String,
      default: null, // Optional for now; will be set by multer
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
      default: 1, // Will be calculated by simple logic in controller
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "resolved"],
      default: "open",
    },
  },
  {
    timestamps: true, // Adds createdAt + updatedAt automatically
  }
);

module.exports = mongoose.model("Complaint", ComplaintSchema);
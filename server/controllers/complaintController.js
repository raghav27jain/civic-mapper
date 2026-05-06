const Complaint = require("../models/Complaint");

// --- Simple keyword-based category detection ---
const detectCategory = (text) => {
  const lower = text.toLowerCase();
  if (lower.includes("pothole") || lower.includes("road") || lower.includes("crater"))
    return "pothole";
  if (lower.includes("garbage") || lower.includes("trash") || lower.includes("waste") || lower.includes("dustbin"))
    return "garbage";
  if (lower.includes("water") || lower.includes("flood") || lower.includes("drain"))
    return "waterlogging";
  if (lower.includes("light") || lower.includes("lamp") || lower.includes("streetlight") || lower.includes("dark"))
    return "streetlight";
  return "other";
};

// --- Simple priority score based on category ---
// V2: replace this entire function with your ML model output
const calculatePriority = (category) => {
  const scores = {
    waterlogging: 5,
    pothole: 4,
    streetlight: 3,
    garbage: 2,
    other: 1,
  };
  return scores[category] || 1;
};

// POST /api/complaints
const createComplaint = async (req, res) => {
  try {
    const { description, lat, lng } = req.body;

    if (!description || !lat || !lng) {
      return res.status(400).json({ message: "Description and location are required" });
    }

    const category = detectCategory(description);
    const priorityScore = calculatePriority(category);

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const complaint = await Complaint.create({
      description,
      imageUrl,
      location: { lat: parseFloat(lat), lng: parseFloat(lng) },
      category,
      priorityScore,
    });

    res.status(201).json({ success: true, data: complaint });
  } catch (error) {
    console.error("Create complaint error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/complaints
const getComplaints = async (req, res) => {
  try {
    // Most recent first; limit to 100 for now
    const complaints = await Complaint.find()
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({ success: true, count: complaints.length, data: complaints });
  } catch (error) {
    console.error("Get complaints error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { createComplaint, getComplaints };
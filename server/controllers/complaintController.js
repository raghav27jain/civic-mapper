// complaintController.js
// Updated:
// - createComplaint now saves citizenName + citizenPhone from token
// - updateStatus added for admin

const Complaint = require("../models/Complaint");

// Keyword-based category detection — same as before
const detectCategory = (text) => {
  const lower = text.toLowerCase();
  if (lower.includes("pothole") || lower.includes("road"))    return "pothole";
  if (lower.includes("water")   || lower.includes("flood"))   return "waterlogging";
  if (lower.includes("garbage") || lower.includes("trash"))   return "garbage";
  if (lower.includes("light")   || lower.includes("dark"))    return "streetlight";
  return "other";
};

const calculatePriority = (category) => {
  const scores = { waterlogging: 5, pothole: 4, streetlight: 3, garbage: 2, other: 1 };
  return scores[category] || 1;
};


// ── POST /api/complaints ─────────────────────────────
const createComplaint = async (req, res) => {
  try {
    const { description, lat, lng, category: bodyCategory } = req.body;

    if (!description || !lat || !lng) {
      return res.status(400).json({ message: "Description and location are required" });
    }

    const category     = bodyCategory || detectCategory(description);
    const priorityScore = calculatePriority(category);
    const imageUrl     = req.file ? `/uploads/${req.file.filename}` : null;

    const complaint = await Complaint.create({
      description,
      imageUrl,
      location:     { lat: parseFloat(lat), lng: parseFloat(lng) },
      category,
      priorityScore,
      // Get citizen info from the JWT token (added by authMiddleware)
      citizenName:  req.user.name,
      citizenPhone: req.user.phone,
    });

    res.status(201).json({ success: true, data: complaint });

  } catch (error) {
    console.error("Create complaint error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// ── GET /api/complaints ──────────────────────────────
const getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({ success: true, count: complaints.length, data: complaints });

  } catch (error) {
    console.error("Get complaints error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// ── PUT /api/complaints/:id/status ───────────────────
// Admin only — update complaint status
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Validate status value
    const allowed = ["open", "in-progress", "resolved"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }   // Return updated document
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.status(200).json({ success: true, data: complaint });

  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


module.exports = { createComplaint, getComplaints, updateStatus };
import { useState, useMemo } from "react";
import {
  AlertTriangle, CheckCircle, Clock,
  Filter, ArrowUpDown, MapPin, Calendar, Search, ShieldCheck, Sparkles
} from "lucide-react";
import toast from "react-hot-toast";
import { updateComplaintStatus } from "../services/api";

const CATEGORIES = {
  pothole:      { color: "#fbbf24", emoji: "🕳️", label: "Pothole"      },
  garbage:      { color: "#10b981", emoji: "🗑️", label: "Garbage"      },
  waterlogging: { color: "#3b82f6", emoji: "💧", label: "Waterlogging" },
  streetlight:  { color: "#8b5cf6", emoji: "💡", label: "Streetlight"  },
  other:        { color: "#9ca3af", emoji: "📌", label: "Other"        },
};

const getPriority = (score) => {
  if (score >= 5) return { label: "Critical", color: "#ef4444" };
  if (score >= 4) return { label: "High",     color: "#f59e0b" };
  if (score >= 3) return { label: "Medium",   color: "#3b82f6" };
  return              { label: "Low",      color: "#9ca3af" };
};

const Dashboard = ({ complaints, loading, user, onComplaintsUpdated }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  // Compute metrics from the active complaints array
  const stats = useMemo(() => ({
    total:    complaints.length,
    open:     complaints.filter(c => c.status === "open").length,
    critical: complaints.filter(c => c.priorityScore >= 5).length,
    resolved: complaints.filter(c => c.status === "resolved").length,
  }), [complaints]);

  // Filter & sort operations
  const filtered = useMemo(() => {
    let list = [...complaints];

    // Filter by search text
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(c => c.description.toLowerCase().includes(term));
    }

    // Filter by category
    if (categoryFilter !== "all") {
      list = list.filter(c => c.category === categoryFilter);
    }

    // Filter by status
    if (statusFilter !== "all") {
      list = list.filter(c => c.status === statusFilter);
    }

    // Sort order
    if (sortBy === "newest") {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "oldest") {
      list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === "priority") {
      list.sort((a, b) => b.priorityScore - a.priorityScore);
    }

    return list;
  }, [complaints, searchTerm, categoryFilter, statusFilter, sortBy]);

  // Handle status update (Admin only)
  const handleStatusChange = async (complaintId, newStatus) => {
    setUpdatingId(complaintId);
    try {
      await updateComplaintStatus(complaintId, newStatus);
      toast.success(`Status updated to "${newStatus.replace("-", " ")}"!`);
      if (onComplaintsUpdated) {
        onComplaintsUpdated();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="dashboard-page">

      {/* Fullscreen Image Lightbox */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.92)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "zoom-out",
            backdropFilter: "blur(8px)",
            animation: "fadeUp 0.2s ease",
          }}
        >
          {/* Close button */}
          <button
            onClick={() => setSelectedImage(null)}
            style={{
              position: "absolute",
              top: 20, right: 24,
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "50%",
              width: 38, height: 38,
              color: "white",
              fontSize: "1.1rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>

          {/* Full image */}
          <img
            src={selectedImage}
            alt="Full view"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "90vw",
              maxHeight: "88vh",
              borderRadius: "12px",
              boxShadow: "0 24px 80px rgba(0,0,0,0.8)",
              objectFit: "contain",
            }}
          />

          {/* Click anywhere to close hint */}
          <p style={{
            position: "absolute",
            bottom: 20,
            fontSize: "0.72rem",
            color: "rgba(255,255,255,0.35)",
            fontFamily: "DM Sans, sans-serif",
          }}>
            Click anywhere to close
          </p>
        </div>
      )}
      
      
      {/* Page Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Complaints Dashboard</h1>
        <p className="dashboard-subtitle">
          Administrative dashboard displaying all reported neighborhood complaints.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(59, 130, 246, 0.08)", color: "var(--accent)" }}>
            <AlertTriangle size={18} />
          </div>
          <div>
            <p className="stat-number">{stats.total}</p>
            <p className="stat-label">Total Reports</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(245, 158, 11, 0.08)", color: "var(--warning)" }}>
            <Clock size={18} />
          </div>
          <div>
            <p className="stat-number">{stats.open}</p>
            <p className="stat-label">Open Issues</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(239, 68, 68, 0.08)", color: "var(--danger)" }}>
            <AlertTriangle size={18} />
          </div>
          <div>
            <p className="stat-number">{stats.critical}</p>
            <p className="stat-label">Critical Priority</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(16, 185, 129, 0.08)", color: "var(--success)" }}>
            <CheckCircle size={18} />
          </div>
          <div>
            <p className="stat-number">{stats.resolved}</p>
            <p className="stat-label">Resolved</p>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="filters-row">
        
        {/* Search Input */}
        <div className="search-input-wrap">
          <Search size={13} className="search-icon-inside" />
          <input
            type="text"
            className="search-input"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <div className="filter-group">
          <label className="filter-label">
            <Filter size={11} />
            <span>Category</span>
          </label>
          <select
            className="filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="pothole">🕳️ Pothole</option>
            <option value="garbage">🗑️ Garbage</option>
            <option value="waterlogging">💧 Waterlogging</option>
            <option value="streetlight">💡 Streetlight</option>
            <option value="other">📌 Other</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="filter-group">
          <label className="filter-label">
            <span>Status</span>
          </label>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {/* Sort select */}
        <div className="filter-group" style={{ marginLeft: "auto" }}>
          <label className="filter-label">
            <ArrowUpDown size={11} />
            <span>Sort</span>
          </label>
          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="priority">Highest Priority</option>
          </select>
        </div>

      </div>

      {/* Search results count summary */}
      <p className="results-count">
        Showing <strong>{filtered.length}</strong> of {complaints.length} reports
      </p>

      {/* Grid Content */}
      {loading ? (
        <div className="complaints-grid">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="skeleton-card" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <p className="empty-icon">🔍</p>
          <p className="empty-text">No reports match your filters</p>
          <p className="empty-sub">Adjust your query parameters or filters to find results.</p>
        </div>
      ) : (
        <div className="complaints-grid">
          {filtered.map((complaint) => {
            const cat = CATEGORIES[complaint.category] || CATEGORIES.other;
            const pri = getPriority(complaint.priorityScore);

            const statusColors = {
              open: { bg: "rgba(245, 158, 11, 0.08)", text: "var(--warning)" },
              "in-progress": { bg: "rgba(139, 92, 246, 0.08)", text: "var(--accent-2)" },
              resolved: { bg: "rgba(16, 185, 129, 0.08)", text: "var(--success)" }
            };
            const currentStatusColor = statusColors[complaint.status] || { bg: "rgba(255,255,255,0.05)", text: "var(--text-1)" };

            return (
              <div key={complaint._id} className="complaint-card">
                
                {/* Image Section */}
                {complaint.imageUrl ? (
                  <div className="card-image-wrap">
                    <img
                      src={`http://localhost:5000${complaint.imageUrl}`}
                      alt="Report attachment"
                      className="card-image"
                      style={{ cursor: "zoom-in" }}
                      onClick={() => setSelectedImage(`http://localhost:5000${complaint.imageUrl}`)}
                    />
                    <span
                      className="card-cat-badge"
                      style={{ background: "rgba(6, 8, 19, 0.8)", color: cat.color, border: `1px solid ${cat.color}25` }}
                    >
                      {cat.emoji} {cat.label}
                    </span>
                  </div>
                ) : (
                  <div className="card-no-image" style={{ background: `${cat.color}05` }}>
                    <span style={{ fontSize: "1.75rem" }}>{cat.emoji}</span>
                    <span
                      className="card-cat-badge"
                      style={{ background: "rgba(6, 8, 19, 0.8)", color: cat.color, position: "relative", top: 0, left: 0 }}
                    >
                      {cat.label}
                    </span>
                  </div>
                )}

                {/* Card Body */}
                <div className="card-body">
                  
                  {/* Badges row */}
                  <div className="card-badges">
                    <span
                      className="card-badge"
                      style={{ background: `${pri.color}12`, color: pri.color, border: `1px solid ${pri.color}20` }}
                    >
                      {pri.label}
                    </span>
                    <span
                      className="card-badge"
                      style={{
                        background: currentStatusColor.bg,
                        color: currentStatusColor.text,
                        border: `1px solid ${currentStatusColor.text}20`,
                      }}
                    >
                      {complaint.status.replace("-", " ")}
                    </span>
                  </div>

                  {/* Complaint Description */}
                  <p className="card-description">
                    {complaint.description}
                  </p>

                  {/* Citizen Info (Visible only if user is logged in - very secure!) */}
                  {user && (
                    <div style={{ 
                      marginTop: "auto",
                      marginBottom: "0.75rem",
                      padding: "0.5rem", 
                      background: "rgba(255,255,255,0.01)", 
                      border: "1px solid var(--border)", 
                      borderRadius: "var(--radius-sm)" 
                    }}>
                      <p style={{ fontSize: "0.62rem", textTransform: "uppercase", color: "var(--text-3)", fontWeight: 700, letterSpacing: 0.5, marginBottom: "2px" }}>Filer Credentials</p>
                      <p style={{ fontSize: "0.72rem", color: "var(--text-1)", fontWeight: 500 }}>{complaint.citizenName || "Anonymous"}</p>
                      <p style={{ fontSize: "0.65rem", color: "var(--text-2)", fontFamily: "DM Mono, monospace" }}>Ph: {complaint.citizenPhone || "N/A"}</p>
                    </div>
                  )}

                  {/* Footer - Date & Location */}
                  <div className="card-footer" style={{ marginTop: user ? "0" : "auto" }}>
                    <span className="card-meta">
                      <MapPin size={11} />
                      {complaint.location.lat.toFixed(3)}, {complaint.location.lng.toFixed(3)}
                    </span>
                    <span className="card-meta">
                      <Calendar size={11} />
                      {new Date(complaint.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric"
                      })}
                    </span>
                  </div>

                  {/* View on Google Maps Button */}
                  <a href={`https://www.google.com/maps?q=${complaint.location.lat},${complaint.location.lng}`} target="_blank" rel="noopener noreferrer" className="view-on-map-btn">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                      <circle cx="12" cy="9" r="2.5"/>
                    </svg>
                    View on Google Maps
                  </a>

                  {/* Admin privilege panel */}
                  {user && user.role === "admin" && (
                    <div className="admin-action-area">
                      <span className="admin-action-label">
                        <ShieldCheck size={11} style={{ verticalAlign: "middle", marginRight: "3px", color: "var(--success)" }} />
                        Status
                      </span>
                      <select
                        className="admin-status-select"
                        value={complaint.status}
                        onChange={(e) => handleStatusChange(complaint._id, e.target.value)}
                        disabled={updatingId === complaint._id}
                      >
                        <option value="open">🟢 Open</option>
                        <option value="in-progress">🟡 In Progress</option>
                        <option value="resolved">🔵 Resolved</option>
                      </select>
                    </div>
                  )}

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default Dashboard;
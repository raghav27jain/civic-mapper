import { useState, useEffect } from "react";
import { MapPin, Upload, Send, X, CheckCircle, AlertCircle, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { submitComplaint } from "../services/api";

const CATEGORY_META = {
  pothole:      { color: "#fbbf24", emoji: "🕳️", label: "Pothole"      },
  garbage:      { color: "#10b981", emoji: "🗑️", label: "Garbage"      },
  waterlogging: { color: "#3b82f6", emoji: "💧", label: "Waterlogging" },
  streetlight:  { color: "#8b5cf6", emoji: "💡", label: "Streetlight"  },
  other:        { color: "#9ca3af", emoji: "📌", label: "Other"        },
};

// Client-side category auto-detection based on description keywords
const detectCategory = (text) => {
  const lower = text.toLowerCase();
  if (lower.includes("pothole") || lower.includes("road") || lower.includes("pit") || lower.includes("crater") || lower.includes("drain")) {
    return "pothole";
  }
  if (lower.includes("garbage") || lower.includes("trash") || lower.includes("waste") || lower.includes("dump") || lower.includes("smell")) {
    return "garbage";
  }
  if (lower.includes("water") || lower.includes("flood") || lower.includes("clog") || lower.includes("rain") || lower.includes("pipe")) {
    return "waterlogging";
  }
  if (lower.includes("light") || lower.includes("dark") || lower.includes("bulb") || lower.includes("wire") || lower.includes("pole")) {
    return "streetlight";
  }
  return "other";
};

const ComplaintForm = ({ onComplaintSubmitted, user, onLoginClick }) => {
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("other");
  const [isCategoryManual, setIsCategoryManual] = useState(false);
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [location, setLocation] = useState(null);
  
  const [locLoading, setLocLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Auto-detect category as user types, unless they manually select one
  useEffect(() => {
    if (!isCategoryManual) {
      const predicted = detectCategory(description);
      setCategory(predicted);
    }
  }, [description, isCategoryManual]);

  // Handle image attachment
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be smaller than 5MB");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Get current GPS coordinates from the browser
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Your browser does not support Geolocation services.");
      return;
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocLoading(false);
        toast.success("GPS Coordinates Captured!");
      },
      (err) => {
        setLocLoading(false);
        const msgs = {
          1: "Location permission denied. Please enable it in browser settings.",
          2: "GPS signal unavailable. Please try again.",
          3: "Location search timed out. Please try again.",
        };
        toast.error(msgs[err.code] || "Failed to capture location.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Handle submitting the report
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      // Trigger login modal, saving input states in the process
      toast("Please log in to submit your report.", { icon: "🔒" });
      onLoginClick();
      return;
    }

    if (!description.trim()) return toast.error("Please enter a description of the issue.");
    if (!location) return toast.error("Please capture your GPS coordinates.");

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("description", description.trim());
      formData.append("lat", location.lat.toString());
      formData.append("lng", location.lng.toString());
      formData.append("category", category);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      await submitComplaint(formData);
      toast.success("Civic report submitted successfully!");

      // Reset form fields
      setDescription("");
      setImageFile(null);
      setImagePreview(null);
      setLocation(null);
      setIsCategoryManual(false);
      setCategory("other");
      
      if (onComplaintSubmitted) {
        onComplaintSubmitted();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "An error occurred during submission.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCategorySelectChange = (e) => {
    setCategory(e.target.value);
    setIsCategoryManual(true);
  };

  const currentCat = CATEGORY_META[category] || CATEGORY_META.other;

  return (
    <div>
      {/* Header Info */}
      <div className="form-header">
        <h1 className="form-title">Report a Civic Issue</h1>
        <p className="form-subtitle">
          Submit neighborhood complaints with photos and GPS. Reports are instantly mapped for city administration review.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        
        {/* Description Input */}
        <div className="form-group">
          <label className="form-label">
            <span className="form-label-left">
              Issue Description <span className="required-star">*</span>
            </span>
            {description.trim() && (
              <span 
                className="category-tag-preview"
                style={{ 
                  background: `${currentCat.color}15`, 
                  color: currentCat.color,
                  border: `1px solid ${currentCat.color}30`,
                  display: "flex",
                  alignItems: "center",
                  gap: "3px"
                }}
              >
                <Sparkles size={9} />
                {currentCat.emoji} {currentCat.label}
              </span>
            )}
          </label>
          <textarea
            className="form-textarea"
            placeholder="Describe the problem clearly — e.g. Large pothole near the main crossroads, creating immediate road hazards..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            required
          />
          <p className="char-count">{description.length} / 500</p>
        </div>

        {/* Category Manual Selector */}
        <div className="form-group">
          <label className="form-label">
            <span className="form-label-left">Category Selection</span>
            {isCategoryManual && (
              <button 
                type="button" 
                className="location-recapture-btn" 
                style={{ height: "auto", padding: "1px 6px", margin: 0 }}
                onClick={() => setIsCategoryManual(false)}
              >
                Reset Auto-detect
              </button>
            )}
          </label>
          <select
            className="form-select"
            value={category}
            onChange={handleCategorySelectChange}
          >
            <option value="pothole">🕳️ Pothole / Road Damage</option>
            <option value="garbage">🗑️ Garbage Accumulation</option>
            <option value="waterlogging">💧 Waterlogging / Flooding</option>
            <option value="streetlight">💡 Streetlight Outage</option>
            <option value="other">📌 Other Civic Issue</option>
          </select>
        </div>

        {/* Photo Upload Zone */}
        <div className="form-group">
          <label className="form-label">Attach Verification Photo</label>
          {!imagePreview ? (
            <div className="upload-zone">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageChange}
              />
              <div className="upload-icon-box">
                <Upload size={16} />
              </div>
              <p className="upload-main-text">Upload verification picture</p>
              <p className="upload-sub-text">Supports JPG, PNG, WEBP — Max 5MB</p>
            </div>
          ) : (
            <div className="image-preview">
              <img src={imagePreview} alt="Issue preview" />
              <div className="image-preview-gradient" />
              {imageFile && (
                <span className="image-filename">
                  {imageFile.name.length > 25
                    ? imageFile.name.slice(0, 22) + "..."
                    : imageFile.name}
                </span>
              )}
              <button type="button" className="image-remove-btn" onClick={handleRemoveImage}>
                <X size={12} />
              </button>
            </div>
          )}
        </div>

        <div className="divider" />

        {/* GPS Capture */}
        <div className="form-group">
          <label className="form-label">
            <span className="form-label-left">
              GPS Location <span className="required-star">*</span>
            </span>
          </label>

          {!location ? (
            <button
              type="button"
              className="location-btn"
              onClick={handleGetLocation}
              disabled={locLoading}
            >
              {locLoading ? (
                <>
                  <div className="btn-spinner" style={{ borderTopColor: "var(--accent)" }} />
                  Detecting satellites...
                </>
              ) : (
                <>
                  <MapPin size={15} /> Locate Issue on Map
                </>
              )}
            </button>
          ) : (
            <div className="location-card">
              <div className="location-icon">
                <CheckCircle size={15} />
              </div>
              <div>
                <p className="location-label">GPS Synced</p>
                <p className="location-coords">
                  {location.lat.toFixed(5)}° N, {location.lng.toFixed(5)}° E
                </p>
              </div>
              <button type="button" className="location-recapture-btn" onClick={handleGetLocation}>
                Recapture
              </button>
            </div>
          )}
        </div>

        <div className="divider" />

        {/* Dynamic Submit / Login trigger Button */}
        {user ? (
          <button
            type="submit"
            className="submit-btn"
            disabled={submitting || !description.trim() || !location}
          >
            {submitting ? (
              <>
                <div className="btn-spinner" /> Submitting Report...
              </>
            ) : (
              <>
                <Send size={14} /> Submit Civic Complaint
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            className="submit-btn"
            style={{ 
              background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
              color: "var(--text-2)",
              border: "1px solid var(--border-bright)",
              boxShadow: "none"
            }}
            onClick={onLoginClick}
          >
            <AlertCircle size={14} style={{ color: "var(--warning)" }} />
            <span>Login to Submit Complaint</span>
          </button>
        )}

        {!user && (
          <p className="submit-hint" style={{ color: "var(--warning)" }}>
            * Administrative authentication is required to file reports.
          </p>
        )}
      </form>
    </div>
  );
};

export default ComplaintForm;
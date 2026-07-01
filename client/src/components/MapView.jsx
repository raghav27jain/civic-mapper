import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's broken icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const CATEGORIES = {
  pothole:      { color: "#fbbf24", emoji: "🕳️", label: "Pothole"      },
  garbage:      { color: "#10b981", emoji: "🗑️", label: "Garbage"      },
  waterlogging: { color: "#3b82f6", emoji: "💧", label: "Waterlogging" },
  streetlight:  { color: "#8b5cf6", emoji: "💡", label: "Streetlight"  },
  other:        { color: "#9ca3af", emoji: "📌", label: "Other"        },
};

// Custom teardrop marker using HTML+CSS with neon glow
const createMarker = (color) =>
  L.divIcon({
    html: `<div style="
      width:24px; height:24px;
      background:${color};
      border:2px solid rgba(255,255,255,0.9);
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      box-shadow:0 3px 8px rgba(0,0,0,0.5), 0 0 10px ${color}80;
    "></div>`,
    className: "",
    iconSize: [24, 24], iconAnchor: [12, 24], popupAnchor: [0, -28],
  });

// Zooms map to show all markers
const AutoFitBounds = ({ complaints }) => {
  const map = useMap();
  useEffect(() => {
    if (!complaints.length) return;
    map.fitBounds(complaints.map(c => [c.location.lat, c.location.lng]), {
      padding: [50, 50], maxZoom: 14
    });
  }, [complaints, map]);
  return null;
};

const getPriority = (score) => {
  if (score >= 5) return { label: "Critical", color: "#ef4444" };
  if (score >= 4) return { label: "High",     color: "#f59e0b" };
  if (score >= 3) return { label: "Medium",   color: "#3b82f6" };
  return              { label: "Low",      color: "#9ca3af" };
};

const MapView = ({ complaints, loading }) => (
  <div style={{ height:"100%", width:"100%", position:"relative" }}>

    {/* Loading spinner overlay */}
    {loading && (
      <div style={{
        position:"absolute", inset:0, zIndex:1000,
        background:"rgba(6, 8, 19, 0.8)",
        display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        gap:"0.75rem", backdropFilter:"blur(6px)"
      }}>
        <div style={{
          width:28, height:28,
          border:"2.5px solid rgba(59, 130, 246, 0.15)", borderTopColor:"var(--accent)",
          borderRadius:"50%", animation:"spin 0.65s linear infinite"
        }}/>
        <p style={{ fontSize:"0.78rem", color:"var(--text-2)", fontFamily:"'DM Sans',sans-serif" }}>
          Synchronizing satellite data...
        </p>
      </div>
    )}

    {/* Leaflet Map */}
    <MapContainer center={[22.9734,78.6569]} zoom={5} style={{ height:"100%", width:"100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {complaints.length > 0 && <AutoFitBounds complaints={complaints} />}

      {complaints.map((c) => {
        const cat = CATEGORIES[c.category] || CATEGORIES.other;
        const pri = getPriority(c.priorityScore);
        return (
          <Marker key={c._id} position={[c.location.lat, c.location.lng]} icon={createMarker(cat.color)}>
            <Popup maxWidth={280}>
              <div style={{ fontFamily:"'DM Sans',sans-serif", overflow:"hidden", minWidth:240 }}>

                {/* Header */}
                <div style={{ padding:"0.75rem 0.875rem", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", gap:"0.4rem", flexWrap:"wrap" }}>
                  <span style={{ fontSize:"0.9rem" }}>{cat.emoji}</span>
                  <span style={{ background:cat.color+"12", color:cat.color, padding:"2px 8px", borderRadius:999, fontSize:"0.62rem", fontWeight:700, border:`1px solid ${cat.color}25` }}>
                    {cat.label}
                  </span>
                  <span style={{ marginLeft:"auto", background:pri.color+"12", color:pri.color, padding:"2px 8px", borderRadius:999, fontSize:"0.6rem", fontWeight:700, border:`1px solid ${pri.color}25` }}>
                    {pri.label}
                  </span>
                </div>

                {/* Verification Photo */}
                {c.imageUrl && (
                  <img src={`${import.meta.env.VITE_API_URL || "http://localhost:5000"}${c.imageUrl}`} alt="Complaint preview"
                    style={{ width:"100%", height:120, objectFit:"cover", display:"block" }} />
                )}

                {/* Details */}
                <div style={{ padding:"0.75rem 0.875rem" }}>
                  <p style={{ fontSize:"0.78rem", color:"var(--text-2)", lineHeight:1.45, marginBottom:"0.65rem", wordBreak: "break-word" }}>
                    {c.description}
                  </p>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{
                      background: c.status==="open" ? "rgba(245, 158, 11, 0.08)" : c.status==="in-progress" ? "rgba(139, 92, 246, 0.08)" : "rgba(16, 185, 129, 0.08)",
                      color: c.status==="open" ? "var(--warning)" : c.status==="in-progress" ? "var(--accent-2)" : "var(--success)",
                      border: `1px solid ${c.status==="open" ? "var(--warning)" : c.status==="in-progress" ? "var(--accent-2)" : "var(--success)"}20`,
                      padding:"1.5px 7px", borderRadius:999, fontSize:"0.62rem", fontWeight:700, textTransform:"capitalize"
                    }}>{c.status.replace("-", " ")}</span>
                    <span style={{ fontSize:"0.65rem", color:"var(--text-3)", fontFamily:"'DM Mono',monospace" }}>
                      {new Date(c.createdAt).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}
                    </span>
                  </div>
                </div>

              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>

    {/* Bottom-left stats */}
    <div className="map-counter">
      <div className="map-counter-dot" />
      {complaints.length} complaint{complaints.length !== 1 ? "s" : ""} on map
    </div>

    {/* Top-right legend card */}
    <div className="map-legend">
      <p className="map-legend-heading">Categories</p>
      {Object.entries(CATEGORIES).map(([key, val]) => (
        <div key={key} className="map-legend-row">
          <div className="legend-dot" style={{ background: val.color, boxShadow:`0 0 4px ${val.color}` }} />
          <span>{val.emoji} {val.label}</span>
        </div>
      ))}
    </div>

  </div>
);

export default MapView;
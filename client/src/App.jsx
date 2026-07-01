import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import AuthModal from "./components/AuthModal";
import { fetchComplaints } from "./services/api";
import "./App.css";

const App = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Authentication states
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Load saved credentials from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse saved user credentials", e);
      }
    }
  }, []);

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const data = await fetchComplaints();
      setComplaints(data.data || []);
    } catch (err) {
      console.error("Failed to load complaints:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadComplaints(); 
  }, []);

  // Handle successful login from modal
  const handleLoginSuccess = (newToken, newUser) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);
  };

  // Handle logging out
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <BrowserRouter>
      {/* Ambient background animations */}
      <div className="blob-container" aria-hidden="true">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>
      <div className="bg-grid" aria-hidden="true" />

      {/* Modern, high-end Toast notification configuration */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            fontFamily: "DM Sans, sans-serif",
            fontSize: "0.82rem",
            borderRadius: "12px",
            background: "rgba(10, 14, 28, 0.95)",
            color: "#f3f4f6",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 12px 32px rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(12px)",
          },
          success: { iconTheme: { primary: "#10b981", secondary: "#060813" } },
          error:   { iconTheme: { primary: "#ef4444", secondary: "#060813" } },
        }}
      />

      {/* Navbar with login capabilities */}
      <Navbar 
        reportCount={complaints.length} 
        user={user} 
        onLogout={handleLogout} 
        onLoginClick={() => setIsAuthModalOpen(true)} 
      />

      {/* Routing pages */}
      <Routes>
        <Route
          path="/"
          element={
            <Home
              complaints={complaints}
              loading={loading}
              onComplaintSubmitted={loadComplaints}
              user={user}
              onLoginClick={() => setIsAuthModalOpen(true)}
            />
          }
        />
        <Route
          path="/dashboard"
          element={
            <Dashboard
              complaints={complaints}
              loading={loading}
              user={user}
              onComplaintsUpdated={loadComplaints}
            />
          }
        />
      </Routes>

      {/* Global authentication modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onLoginSuccess={handleLoginSuccess}
      />
    </BrowserRouter>
  );
};

export default App;
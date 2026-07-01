import { NavLink } from "react-router-dom";
import { MapPin, LayoutDashboard, Plus, LogIn, LogOut, ShieldAlert, User } from "lucide-react";

const Navbar = ({ reportCount, user, onLogout, onLoginClick }) => {
  return (
    <nav className="navbar">
      
      {/* Brand logo */}
      <div className="navbar-brand">
        <MapPin size={18} />
        <span>CivicMapper</span>
        <span className="navbar-badge">Beta</span>
      </div>

      {/* Navigation center links */}
      <div className="navbar-links">
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? "nav-link nav-link-active" : "nav-link"
          }
        >
          <Plus size={15} />
          Report Issue
        </NavLink>

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? "nav-link nav-link-active" : "nav-link"
          }
        >
          <LayoutDashboard size={15} />
          Dashboard
        </NavLink>
      </div>

      {/* Right control panel */}
      <div className="navbar-right">
        {/* Live system state */}
        <div className="live-pill">
          <div className="live-dot" />
          LIVE
        </div>

        {/* Counter */}
        <div className="report-count">
          <strong>{reportCount}</strong> Reports
        </div>

        {/* Authentication profile panel */}
        {user ? (
          <div className="user-profile-badge">
            <div className={`user-avatar ${user.role === "admin" ? "admin-avatar" : ""}`}>
              {user.role === "admin" ? <ShieldAlert size={12} /> : <User size={12} />}
            </div>
            <span className="user-name">
              {user.role === "admin" ? "Admin" : user.name.split(" ")[0]}
            </span>
            <button className="logout-icon-btn" onClick={onLogout} title="Log Out">
              <LogOut size={13} />
            </button>
          </div>
        ) : (
          <button className="auth-nav-btn" onClick={onLoginClick}>
            <LogIn size={13} />
            <span>Login</span>
          </button>
        )}
      </div>

    </nav>
  );
};

export default Navbar;
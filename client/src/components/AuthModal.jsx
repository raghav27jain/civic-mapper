import { useState, useRef, useEffect } from "react";
import { X, Send, Lock, Phone, User, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { sendOTP, verifyOTP, adminLogin } from "../services/api";

const AuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState("citizen"); // "citizen" | "admin"
  
  // Citizen state
  const [citizenName, setCitizenName] = useState("");
  const [citizenPhone, setCitizenPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState(["", "", "", "", "", ""]);
  const [devOtp, setDevOtp] = useState(null);
  
  // Admin state
  const [adminPassword, setAdminPassword] = useState("");
  
  // Status states
  const [loading, setLoading] = useState(false);
  
  const otpInputsRef = useRef([]);

  // Reset form when modal closes or changes tab
  useEffect(() => {
    if (!isOpen) return;
    setCitizenName("");
    setCitizenPhone("");
    setOtpSent(false);
    setOtpValue(["", "", "", "", "", ""]);
    setDevOtp(null);
    setAdminPassword("");
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  // Handle requesting OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!citizenName.trim()) return toast.error("Please enter your name");
    if (!/^\d{10}$/.test(citizenPhone)) return toast.error("Please enter a valid 10-digit mobile number");

    setLoading(true);
    try {
      const res = await sendOTP(citizenName.trim(), citizenPhone);
      toast.success("OTP sent! Check backend console.");
      setOtpSent(true);
      if (res.devOtp) {
        setDevOtp(res.devOtp);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle digit inputs for OTP
  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otpValue];
    newOtp[index] = value.slice(-1); // only keep last digit
    setOtpValue(newOtp);

    // Focus next input
    if (value && index < 5) {
      otpInputsRef.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpValue[index] && index > 0) {
      otpInputsRef.current[index - 1].focus();
    }
  };

  // Handle verifying OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpString = otpValue.join("");
    if (otpString.length < 6) return toast.error("Please enter the 6-digit OTP");

    setLoading(true);
    try {
      const res = await verifyOTP(citizenPhone, otpString);
      toast.success("Welcome, " + res.user.name + "!");
      onLoginSuccess(res.token, res.user);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Admin password login
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!adminPassword) return toast.error("Please enter the admin password");

    setLoading(true);
    try {
      const res = await adminLogin(adminPassword);
      toast.success("Logged in as Admin!");
      onLoginSuccess(res.token, res.user);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Invalid admin password.");
    } finally {
      setLoading(false);
    }
  };

  // Quick fill development OTP helper
  const handleUseDevOtp = () => {
    if (!devOtp) return;
    const digits = devOtp.split("");
    setOtpValue(digits);
    toast.success("Auto-filled OTP!");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">Authentication</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="modal-tabs">
          <button 
            className={`modal-tab ${activeTab === "citizen" ? "modal-tab-active" : ""}`}
            onClick={() => setActiveTab("citizen")}
          >
            Citizen
          </button>
          <button 
            className={`modal-tab ${activeTab === "admin" ? "modal-tab-active" : ""}`}
            onClick={() => setActiveTab("admin")}
          >
            Administrator
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {activeTab === "citizen" ? (
            /* Citizen OTP Login */
            !otpSent ? (
              <form onSubmit={handleRequestOtp}>
                <p className="modal-instruction">
                  Enter your details to receive a 6-digit OTP. Verified accounts can instantly report neighborhood issues.
                </p>
                <div className="modal-form-group">
                  <label className="modal-label">Your Name</label>
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <User size={14} style={{ position: "absolute", left: 12, color: "var(--text-3)" }} />
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ paddingLeft: "2.25rem" }}
                      placeholder="e.g. Raghav Jain"
                      value={citizenName}
                      onChange={(e) => setCitizenName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="modal-form-group" style={{ marginBottom: "1.25rem" }}>
                  <label className="modal-label">Mobile Number</label>
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <Phone size={14} style={{ position: "absolute", left: 12, color: "var(--text-3)" }} />
                    <input 
                      type="tel" 
                      className="form-input" 
                      style={{ paddingLeft: "2.25rem" }}
                      placeholder="10-digit number"
                      value={citizenPhone}
                      onChange={(e) => setCitizenPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="modal-submit-btn" disabled={loading}>
                  {loading ? (
                    <div className="btn-spinner" />
                  ) : (
                    <>
                      <Send size={14} /> Request OTP
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp}>
                <p className="modal-instruction">
                  Enter the 6-digit code sent to <strong>+91 {citizenPhone}</strong> (Printed in your server console log).
                </p>
                
                <div className="otp-box-container">
                  {otpValue.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => (otpInputsRef.current[i] = el)}
                      type="text"
                      className="otp-digit-input"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    />
                  ))}
                </div>

                {devOtp && (
                  <div className="dev-otp-indicator">
                    <span>
                      Dev OTP detected: <strong className="dev-otp-code">{devOtp}</strong>
                    </span>
                    <button 
                      type="button" 
                      className="location-recapture-btn" 
                      style={{ margin: 0 }}
                      onClick={handleUseDevOtp}
                    >
                      Autofill
                    </button>
                  </div>
                )}

                <button type="submit" className="modal-submit-btn" disabled={loading}>
                  {loading ? (
                    <div className="btn-spinner" />
                  ) : (
                    <>
                      <CheckCircle size={14} /> Verify & Log In
                    </>
                  )}
                </button>
                <div style={{ marginTop: "1rem", textAlign: "center" }}>
                  <button 
                    type="button" 
                    className="location-recapture-btn" 
                    style={{ float: "none", fontSize: "0.72rem" }}
                    onClick={() => setOtpSent(false)}
                  >
                    Go Back & Edit Details
                  </button>
                </div>
              </form>
            )
          ) : (
            /* Admin Password Login */
            <form onSubmit={handleAdminLogin}>
              <p className="modal-instruction">
                Enter the system administrative password to log in and manage neighborhood reports.
              </p>
              <div className="modal-form-group" style={{ marginBottom: "1.25rem" }}>
                <label className="modal-label">Admin Password</label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <Lock size={14} style={{ position: "absolute", left: 12, color: "var(--text-3)" }} />
                  <input 
                    type="password" 
                    className="form-input" 
                    style={{ paddingLeft: "2.25rem" }}
                    placeholder="Enter password..."
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="modal-submit-btn" disabled={loading}>
                {loading ? (
                  <div className="btn-spinner" />
                ) : (
                  <>
                    <Lock size={14} /> Administrative Log In
                  </>
                )}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default AuthModal;

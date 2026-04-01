import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Settings.css";
import { 
  FiLock, 
  FiBell, 
  FiGlobe, 
  FiMoon, 
  FiSun,
  FiSave,
  FiArrowLeft,
  FiCheckCircle,
  FiAlertCircle,
  FiUser,
  FiMail
} from "react-icons/fi";

const Settings = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  // Notification settings
  const [notifications, setNotifications] = useState({
    emailOrderUpdates: true,
    emailPromotions: false,
    smsUpdates: true
  });
  
  // Theme preference
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  // Load saved settings
  useEffect(() => {
    const savedSettings = localStorage.getItem("userSettings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setNotifications(settings.notifications || notifications);
      setTheme(settings.theme || "light");
    }
    
    // Apply theme
    if (theme === "dark") {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords don't match" });
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }
    
    setLoading(true);
    setMessage({ type: "", text: "" });
    
    try {
      const response = await axios.post(
        "http://localhost:4000/api/user/change-password",
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setMessage({ type: "success", text: "Password changed successfully!" });
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setMessage({ type: "error", text: response.data.message || "Failed to change password" });
      }
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = () => {
    const settings = { notifications, theme };
    localStorage.setItem("userSettings", JSON.stringify(settings));
    
    // Apply theme
    if (theme === "dark") {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
    
    setMessage({ type: "success", text: "Settings saved successfully!" });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        {/* Header */}
        <div className="settings-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <FiArrowLeft />
          </button>
          <h1>Settings</h1>
        </div>
        
        {/* User Info */}
        <div className="user-info-card">
          <div className="user-avatar">
            <FiUser size={32} />
          </div>
          <div className="user-details">
            <h3>{user.name || "User"}</h3>
            <p><FiMail size={14} /> {user.email || "user@email.com"}</p>
          </div>
        </div>
        
        {/* Message */}
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.type === "success" ? <FiCheckCircle /> : <FiAlertCircle />}
            <span>{message.text}</span>
          </div>
        )}
        
        <div className="settings-content">
          {/* Password Change Section */}
          <div className="settings-section">
            <div className="section-header">
              <FiLock className="section-icon" />
              <h2>Change Password</h2>
            </div>
            
            <form onSubmit={handlePasswordChange} className="password-form">
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  placeholder="Enter current password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                />
              </div>
              
              <button type="submit" className="save-btn" disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
          
          {/* Notification Settings */}
          <div className="settings-section">
            <div className="section-header">
              <FiBell className="section-icon" />
              <h2>Notifications</h2>
            </div>
            
            <div className="settings-list">
              <label className="setting-item">
                <div className="setting-info">
                  <span>Email Order Updates</span>
                  <p>Receive email confirmation for orders</p>
                </div>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notifications.emailOrderUpdates}
                    onChange={(e) => setNotifications({ ...notifications, emailOrderUpdates: e.target.checked })}
                  />
                  <span className="toggle-slider"></span>
                </div>
              </label>
              
              <label className="setting-item">
                <div className="setting-info">
                  <span>Promotional Emails</span>
                  <p>Get offers and discounts via email</p>
                </div>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notifications.emailPromotions}
                    onChange={(e) => setNotifications({ ...notifications, emailPromotions: e.target.checked })}
                  />
                  <span className="toggle-slider"></span>
                </div>
              </label>
              
              <label className="setting-item">
                <div className="setting-info">
                  <span>SMS Updates</span>
                  <p>Get order status via SMS</p>
                </div>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notifications.smsUpdates}
                    onChange={(e) => setNotifications({ ...notifications, smsUpdates: e.target.checked })}
                  />
                  <span className="toggle-slider"></span>
                </div>
              </label>
            </div>
          </div>
          
          {/* Theme Settings */}
          <div className="settings-section">
            <div className="section-header">
              <FiGlobe className="section-icon" />
              <h2>Appearance</h2>
            </div>
            
            <div className="theme-options">
              <button
                className={`theme-btn ${theme === "light" ? "active" : ""}`}
                onClick={() => setTheme("light")}
              >
                <FiSun />
                Light
              </button>
              <button
                className={`theme-btn ${theme === "dark" ? "active" : ""}`}
                onClick={() => setTheme("dark")}
              >
                <FiMoon />
                Dark
              </button>
            </div>
          </div>
          
          {/* Save Button */}
          <div className="settings-actions">
            <button className="save-all-btn" onClick={saveSettings}>
              <FiSave />
              Save All Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
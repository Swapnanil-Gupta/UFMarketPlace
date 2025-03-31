import { useState, FormEvent, useEffect } from "react";
import { motion } from "framer-motion";
import "./Profile.css";
import Header from "../header/Header";
import { authService } from "../AuthService";

interface User {
  name: string;
  email: string;
}

const Profile = () => {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const [userEmail, setUserEmail] = useState<string>("");
  const [name, setName] = useState<string>("");

  useEffect(() => {
    const email = sessionStorage.getItem("email") || "mani@gmail.com";
    const userName = sessionStorage.getItem("name") || "";
    setUserEmail(email);
    setName(userName);
  }, []);

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      return setError("New passwords do not match");
    }

    if (newPassword.length < 8) {
      return setError("Password must be at least 8 characters");
    }

    try {
      await authService.changePassword({
        name: name,
        email: userEmail,
        password: newPassword,
      });

      setSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Close form after 2 seconds
      setTimeout(() => setShowPasswordForm(false), 1000);
    } catch (err) {
      setError("Failed to change password. Please try again.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="profile-container"
    >
      <h1 className="profile-title">Profile</h1>

      <div className="profile-content">
        <div className="profile-field">
          <label className="profile-label">Name</label>
          <p className="profile-value">{name}</p>
        </div>

        <div className="profile-field">
          <label className="profile-label">Email</label>
          <p className="profile-value">{userEmail}</p>
        </div>

        {!showPasswordForm && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="change-password-btn"
            onClick={() => {
              setShowPasswordForm(true);
              setError("");
              setSuccess("");
            }}
          >
            Change Password
          </motion.button>
        )}

        {showPasswordForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handlePasswordChange}
            className="password-form"
          >
            <div className="form-group">
              <label htmlFor="currentPassword" className="form-label">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword" className="form-label">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input"
                required
              />
            </div>

            {(error || success) && (
              <div className="message-container">
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
              </div>
            )}

            <div className="form-buttons">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="submit-btn"
              >
                Save Changes
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setError("");
                  setSuccess("");
                }}
                className="cancel-btn"
              >
                Cancel
              </motion.button>
            </div>
          </motion.form>
        )}
      </div>
    </motion.div>
  );
};

export default Profile;

import React, { useState } from "react";
import axios from "axios";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const token = new URLSearchParams(window.location.search).get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!passwordRegex.test(password)) {
      setError("Password must be at least 8 characters and include uppercase, lowercase, and numbers.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5001/auth/reset-password", { token, password });
      setSuccess(res.data.message);
    } catch (err) {
      setError(
        err.response?.data?.message || "There was an error. The link may be expired."
      );
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <h1>Reset Password</h1>
      {success ? (
        <p className="success-message">{success}</p>
      ) : (
        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="password">New Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label htmlFor="confirm">Confirm New Password:</label>
          <input
            type="password"
            id="confirm"
            name="confirm"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />

          {error && <span className="error-message">{error}</span>}
          <button type="submit" disabled={loading}>Change Password</button>
        </form>
      )}
      <a href="/login" style={{ marginTop: "16px", display: "inline-block" }}>Go to Login</a>
    </div>
  );
};

export default ResetPassword;

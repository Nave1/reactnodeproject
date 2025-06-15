import React, { useEffect, useState } from "react";
import { verifyEmail } from "../api/auth";

const VerifyEmail = () => {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided.");
      return;
    }
    verifyEmail(token)
      .then((res) => {
        if (res.data.success) {
          setStatus("success");
          setMessage(res.data.message);
        } else {
          setStatus("error");
          setMessage(res.data.message || "Verification failed.");
        }
      })
      .catch((err) => {
        setStatus("error");
        if (err.response && err.response.data && err.response.data.message) {
          setMessage(err.response.data.message);
        } else {
          setMessage("An error occurred during verification.");
        }
      });
  }, []);

  return (
    <div className="login-container">
      <h1>Email Verification</h1>
      {status === "loading" && <p>Verifying your email, please wait...</p>}
      {status === "success" && <p className="success-message">{message}</p>}
      {status === "error" && <p className="error-message">{message}</p>}
      <a href="/login" style={{ marginTop: "16px", display: "inline-block" }}>Go to Login</a>
    </div>
  );
};

export default VerifyEmail;

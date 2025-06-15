import React, { useEffect, useRef, useState } from "react";
import { forgotPassword } from "../api/auth"; // Use your centralized API call

function maskEmail(email) {
  const [user, domain] = email.split('@');
  if (!user || !domain) return email;
  let maskedUser =
    user.length <= 2
      ? user[0] + '*'
      : user[0] + '*'.repeat(user.length - 2) + user[user.length - 1];
  return maskedUser + '@' + domain;
}

const ForgotPassword = () => {
  const params = new URLSearchParams(window.location.search);
  const email = params.get('email') || "";
  const [sent, setSent] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const hasSent = useRef(false);

  useEffect(() => {
    if (email && !hasSent.current) {
      forgotPassword(email); // Centralized API call
      setSent(true);
      hasSent.current = true;
    }
  }, [email]);

  const handleResend = async () => {
    setResendMessage(""); // clear previous message
    try {
      await forgotPassword(email);
      setResendMessage("Another reset link has been sent!");
    } catch (err) {
      setResendMessage("Error resending email. Please try again later.");
    }
  };

  return (
    <div className="login-container">
      <h1>Forgot Password</h1>
      <div>
        {sent && email ? (
          <>
            <p>
              A link to reset password has been sent to your Email{" "}
              <span style={{ fontWeight: 600 }}>{maskEmail(email)}</span>
            </p>
            <button className="resend-email-button" onClick={handleResend}>
              Resend Email
            </button>
            {resendMessage && (
              <div style={{ color: resendMessage.startsWith("Error") ? "red" : "green", marginTop: "8px" }}>
                {resendMessage}
              </div>
            )}
          </>
        ) : (
          <p>Please provide your email address in the login page to use this feature.</p>
        )}
        <a href="/login" style={{ marginTop: "16px", display: "inline-block" }}>Go to Login</a>
      </div>
    </div>
  );
};

export default ForgotPassword;

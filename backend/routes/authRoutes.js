// routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../dbSingleton');
const { sendMail } = require('../mailer');
const crypto = require('crypto');
const { BASE_URL, ADMIN_EMAIL } = require('../config');
const emailTemplates = require('../emails/emailTemplates');

const saltRounds = 10;
const auth = express.Router();

// Middleware to verify token (move to separate file if needed)
function ensureAuth(req, res, next) {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, 'your-secret-key');
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token', error: err });
  }
}

// --- Contact Us Email ---
auth.post('/send-email', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  try {
    const mail = emailTemplates.contactUs(name, email, message);
    await sendMail(mail.to, mail.subject, mail.html);
    return res.json({ success: true, message: "Email sent successfully!" });
  } catch (err) {
    console.error('Contact Us email error:', err);
    return res.status(500).json({ success: false, message: 'There was an error sending the email.' });
  }
});

// --- Register ---
auth.post('/register', async (req, res) => {
  const { firstName, lastName, idNumber, email, password } = req.body;
  if (!firstName || !lastName || !idNumber || !email || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  try {
    const hashed = await bcrypt.hash(password, saltRounds);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const sql = `
      INSERT INTO users 
        (firstName, lastName, idNumber, email, password, role, is_Activated, verification_token) 
      VALUES (?, ?, ?, ?, ?, 'user', 0, ?)
    `;
    const values = [firstName, lastName, idNumber, email, hashed, verificationToken];
    pool.query(sql, values, async (err, result) => {
      if (err) return res.status(500).json({ success: false, error: err });

      try {
        const mail = emailTemplates.verificationEmail(email, firstName, verificationToken);
        await sendMail(mail.to, mail.subject, mail.html);
      } catch (mailError) {
        return res.status(500).json({ success: false, message: 'Registration succeeded, but failed to send verification email', error: mailError });
      }
      return res.json({ success: true, message: 'User registered. Please check your email to verify your account.' });
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error hashing password' });
  }
});

// --- Email Verification ---
auth.get('/verify-email', (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ success: false, message: 'No token provided' });
  }

  const sql = `SELECT * FROM users WHERE verification_token = ?`;
  pool.query(sql, [token], (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err });

    if (results.length) {
      const user = results[0];
      if (user.is_Activated === 1) {
        return res.status(200).json({
          success: true,
          message: 'This account has already been verified. You can log in.'
        });
      }
      const updateSql = `UPDATE users SET is_Activated = 1, verification_token = NULL WHERE idNumber = ?`;
      pool.query(updateSql, [user.idNumber], (updateErr) => {
        if (updateErr) return res.status(500).json({ success: false, error: updateErr });
        return res.json({ success: true, message: 'Email verified successfully! You can now log in.' });
      });
    } else {
      return res.status(200).json({
        success: true,
        message: 'This account has been verified. You can log in.'
      });
    }
  });
});

// --- Login ---
auth.post('/login', (req, res) => {
  const { email, password } = req.body;
  const sql = `SELECT * FROM users WHERE email = ?`;
  pool.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err });
    if (results.length === 0) return res.status(404).json({ success: false, message: 'User not found' });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(403).json({ success: false, message: 'Wrong password' });
    if (user.is_Activated === 0) {
      return res.status(403).json({ success: false, message: 'Please verify your email before logging in.' });
    }

    const token = jwt.sign({ id: user.idNumber, role: user.role }, 'your-secret-key', { expiresIn: '8h' });
    return res
      .cookie('token', token, { httpOnly: true, sameSite: 'lax' })
      .json({ success: true, user: { id: user.idNumber, firstName: user.firstName, email: user.email, role: user.role } });
  });
});

// --- Forgot Password ---
auth.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required." });
  }

  pool.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err });
    if (!results.length) {
      return res.json({ success: true, message: "If an account exists, you will get a reset email soon." });
    }
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000);
    pool.query(
      'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?',
      [resetToken, expires, email],
      async (err2) => {
        if (err2) return res.status(500).json({ success: false, error: err2 });

        try {
          const mail = emailTemplates.passwordReset(email, resetToken);
          await sendMail(mail.to, mail.subject, mail.html);
        } catch (mailErr) {
          console.error("Mail error in forgot-password:", mailErr);
        }

        return res.json({ success: true, message: "If an account exists, you will get a reset email soon." });
      }
    );
  });
});

// --- Reset Password ---
auth.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ success: false, message: "Token and new password are required." });
  }

  pool.query(
    'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
    [token],
    async (err, results) => {
      if (err) return res.status(500).json({ success: false, error: err });
      if (!results.length) {
        return res.status(400).json({ success: false, message: "Invalid or expired token." });
      }
      const match = await bcrypt.compare(password, results[0].password);
      if (match) {
        return res.status(400).json({ success: false, message: "New password cannot be the same as the current password." });
      }
      const hashed = await bcrypt.hash(password, saltRounds);
      pool.query(
        'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE reset_token = ?',
        [hashed, token],
        (err2) => {
          if (err2) return res.status(500).json({ success: false, error: err2 });
          return res.json({ success: true, message: "Password updated! You can now log in." });
        }
      );
    }
  );
});

module.exports = auth;

// routes.js
// Overview: This file defines all API endpoints for the application including user registration, login,
// email simulation, and CRUD operations for cards. Each endpoint is annotated with the expected inputs and outputs,
// along with notes about which client pages typically interact with these endpoints.
// routes.js
// routes.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const pool = require('./dbSingleton');
const { sendMail } = require('./mailer');
const crypto = require('crypto');

const saltRounds = 10;
const upload = multer({ storage: multer.memoryStorage() });

const auth = express.Router();
const cards = express.Router();

// Middleware to verify token
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

// Email route
// Contact Us: Send an email to Gmail using Nodemailer
auth.post('/send-email', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  const subject = `Contact Us form submission from ${name}`;
  const html = `
    <h2>New Contact Us Submission</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Message:</strong><br/>${message.replace(/\n/g, '<br/>')}</p>
  `;

  try {
    // Send to admin Gmail;
    await sendMail('collectorg40@gmail.com', subject, html);
    return res.json({ success: true, message: "Email sent successfully!" });
  } catch (err) {
    console.error('Contact Us email error:', err);
    return res.status(500).json({ success: false, message: 'There was an error sending the email.' });
  }
});


// Register with Email Verification
auth.post('/register', async (req, res) => {
  const { firstName, lastName, idNumber, email, password } = req.body;
  if (!firstName || !lastName || !idNumber || !email || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  try {
    // 1. Hash the user's password
    const hashed = await bcrypt.hash(password, saltRounds);

    // 2. Generate a unique verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // 3. Insert the new user into the DB with the verification token & is_Activated = 0
    const sql = `
      INSERT INTO users 
        (firstName, lastName, idNumber, email, password, role, is_Activated, verification_token) 
      VALUES (?, ?, ?, ?, ?, 'user', 0, ?)
    `;
    const values = [firstName, lastName, idNumber, email, hashed, verificationToken];
    pool.query(sql, values, async (err, result) => {
      if (err) return res.status(500).json({ success: false, error: err });

      // 4. Send verification email
      try {
        const verificationLink = `http://localhost:3000/verify-email?token=${verificationToken}`;
        const subject = "Verify your email";
        const html = `
          <p>Hi ${firstName},</p>
          <p>Please verify your email by clicking <a href="${verificationLink}">here</a>.</p>
          <p>If you did not register, please ignore this email.</p>
        `;
        await sendMail(email, subject, html);
      } catch (mailError) {
        // Optionally, you might want to delete the user if sending the email failed
        // or notify admin, etc.
        return res.status(500).json({ success: false, message: 'Registration succeeded, but failed to send verification email', error: mailError });
      }

      return res.json({ success: true, message: 'User registered. Please check your email to verify your account.' });
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error hashing password' });
  }
});

// Email Verification Endpoint
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
          success: true, // Mark as success for UX!
          message: 'This account has already been verified. You can log in.'
        });
      }

      // Not activated yet, activate now
      const updateSql = `UPDATE users SET is_Activated = 1, verification_token = NULL WHERE idNumber = ?`;
      pool.query(updateSql, [user.idNumber], (updateErr) => {
        if (updateErr) return res.status(500).json({ success: false, error: updateErr });
        return res.json({ success: true, message: 'Email verified successfully! You can now log in.' });
      });
    } else {
      // Token used up or expired or not found
      return res.status(200).json({
        success: true, // Mark as success for UX!
        message: 'This account has been verified. You can log in.'
      });
    }
  });
});



// Login
auth.post('/login', (req, res) => {
  const { email, password } = req.body;
  const sql = `SELECT * FROM users WHERE email = ?`;
  pool.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err });
    if (results.length === 0) return res.status(404).json({ success: false, message: 'User not found' });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(403).json({ success: false, message: 'Wrong password' });

    // Only allow login if email is verified
    if (user.is_Activated === 0) {
      return res.status(403).json({ success: false, message: 'Please verify your email before logging in.' });
    }

    const token = jwt.sign({ id: user.idNumber, role: user.role }, 'your-secret-key', { expiresIn: '8h' });
    return res
      .cookie('token', token, { httpOnly: true, sameSite: 'lax' })
      .json({ success: true, user: { id: user.idNumber, firstName: user.firstName, email: user.email, role: user.role } });
  });
});


// POST /auth/forgot-password
auth.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required." });
  }

  // Check if the email exists
  pool.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err });

    if (!results.length) {
      // For security, don't reveal if user exists. Always respond success.
      return res.json({ success: true, message: "If an account exists, you will get a reset email soon." });
    }

    // Generate token & expiry (1 hour)
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Save token & expiry
    pool.query(
      'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?',
      [resetToken, expires, email],
      async (err2) => {
        if (err2) return res.status(500).json({ success: false, error: err2 });

        // Send reset email
        const { sendMail } = require('./mailer');
        const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
        const subject = "Password Reset Request";
        const html = `
          <p>If you requested a password reset, click <a href="${resetLink}">here</a> to set a new password. This link is valid for 1 hour.</p>
          <p>If you did not request a reset, you can ignore this email.</p>
        `;
        try {
          await sendMail(email, subject, html);
        } catch (mailErr) {
          // Log or handle error; don't reveal to the client for security
          console.error("Mail error in forgot-password:", mailErr);
        }

        return res.json({ success: true, message: "If an account exists, you will get a reset email soon." });
      }
    );
  });
});


// POST /auth/reset-password
auth.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ success: false, message: "Token and new password are required." });
  }

  // Check if token is valid and not expired
  pool.query(
    'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
    [token],
    async (err, results) => {
      if (err) return res.status(500).json({ success: false, error: err });
      if (!results.length) {
        return res.status(400).json({ success: false, message: "Invalid or expired token." });
      }

      // 1. Check that the new password is not the same as the current password
      const match = await bcrypt.compare(password, results[0].password);
      if (match) {
        return res.status(400).json({ success: false, message: "New password cannot be the same as the current password." });
      }

      // 2. Update password
      const saltRounds = 10;
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



// Cards routes
cards.get('/', ensureAuth, (req, res) => {
  const { id, role } = req.user;
  let sql = 'SELECT * FROM cards';
  const params = [];

  if (role !== 'admin') {
    sql += ' WHERE user_id = ?';
    params.push(id);
  }

  pool.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err });
    const cards = results.map(card => {
      if (card.image) card.image = card.image.toString('base64');
      return card;
    });
    return res.json(cards);
  });
});

cards.post('/', ensureAuth, upload.single('image'), (req, res) => {
  const { fullName, phoneNumber, city, street, title, description, email } = req.body;
  const slug = `${title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
  const image = req.file?.buffer || null;
  const sql = `INSERT INTO cards (fullName, phoneNumber, email, city, street, title, description, slug, image, user_id)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const values = [fullName, phoneNumber, email, city, street, title, description, slug, image, req.user.id];

  pool.query(sql, values, (err) => {
    if (err) return res.status(500).json({ success: false, error: err });
    return res.json({ success: true, slug });
  });
});

cards.put('/:slug', ensureAuth, upload.single('image'), (req, res) => {
  const { slug } = req.params;
  const { fullName, phoneNumber, city, street, title, description } = req.body;
  const updateSQL = `UPDATE cards SET fullName=?, phoneNumber=?, city=?, street=?, title=?, description=?${req.file ? ', image=?' : ''} WHERE slug=?`;
  const params = req.file
    ? [fullName, phoneNumber, city, street, title, description, req.file.buffer, slug]
    : [fullName, phoneNumber, city, street, title, description, slug];

  pool.query('SELECT * FROM cards WHERE slug = ?', [slug], (err, rows) => {
    if (err || rows.length === 0) return res.status(404).json({ success: false, message: 'Card not found' });
    if (req.user.role !== 'admin' && rows[0].user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    pool.query(updateSQL, params, (err) => {
      if (err) return res.status(500).json({ success: false, error: err });
      return res.json({ success: true, message: 'Card updated' });
    });
  });
});

cards.delete('/:slug', ensureAuth, (req, res) => {
  const { slug } = req.params;
  pool.query('SELECT * FROM cards WHERE slug = ?', [slug], (err, rows) => {
    if (err || rows.length === 0) return res.status(404).json({ success: false, message: 'Card not found' });
    if (req.user.role !== 'admin' && rows[0].user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    pool.query('DELETE FROM cards WHERE slug = ?', [slug], (err) => {
      if (err) return res.status(500).json({ success: false, error: err });
      return res.json({ success: true, message: 'Card deleted' });
    });
  });
});

cards.put('/:slug/close', ensureAuth, (req, res) => {
  const { slug } = req.params;
  pool.query('SELECT * FROM cards WHERE slug = ?', [slug], (err, rows) => {
    if (err || rows.length === 0) return res.status(404).json({ success: false, message: 'Card not found' });
    if (req.user.role !== 'admin' && rows[0].user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    pool.query('UPDATE cards SET status = ? WHERE slug = ?', ['closed', slug], (err) => {
      if (err) return res.status(500).json({ success: false, error: err });
      return res.json({ success: true, message: 'Card closed' });
    });
  });
});

module.exports = { auth, cards };

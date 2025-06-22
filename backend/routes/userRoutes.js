// routes/userRoutes.js
const express = require('express');
const pool = require('../dbSingleton');

const userRoutes = express.Router();

// Middleware to verify token (copy from your existing codebase if you have it)
function ensureAuth(req, res, next) {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = require('jsonwebtoken').verify(token, 'your-secret-key');
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token', error: err });
  }
}

// Admin-only check
function ensureAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ message: 'Admins only.' });
}

// GET all users (admin only)
userRoutes.get('/users', ensureAuth, ensureAdmin, (req, res) => {
  pool.query(
    'SELECT idNumber AS id, firstName, lastName, email, role FROM users',
    (err, users) => {
      if (err) return res.status(500).json({ success: false, error: err });
      res.json(users);
    }
  );
});

// UPDATE user (admin only)
userRoutes.put('/users/:id', ensureAuth, ensureAdmin, (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, role } = req.body;
  pool.query(
    'UPDATE users SET firstName=?, lastName=?, email=?, role=? WHERE idNumber=?',
    [firstName, lastName, email, role, id],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, error: err });
      res.json({ success: true });
    }
  );
});

// DISABLE user (admin only)
userRoutes.put('/users/:id/status', ensureAuth, ensureAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!['active', 'disabled'].includes(status))
    return res.status(400).json({ success: false, message: 'Invalid status' });

  pool.query(
    'UPDATE users SET status = ? WHERE idNumber = ?',
    [status, id],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, error: err });
      res.json({ success: true });
    }
  );
});

userRoutes.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Email and password required.' });

  pool.query(
    'SELECT idNumber AS id, firstName, lastName, email, password, role, points FROM users WHERE email = ?',
    [email],
    (err, users) => {
      if (err) return res.status(500).json({ success: false, message: 'Database error.' });
      if (!users.length)
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });

      const user = users[0];
      const bcrypt = require('bcrypt');
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Error checking password.' });
        if (!result) return res.status(401).json({ success: false, message: 'Invalid email or password.' });

        // Remove password before sending to frontend
        delete user.password;

        // Create JWT token
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ id: user.id, role: user.role }, 'your-secret-key', { expiresIn: '1d' });

        res.cookie('token', token, { httpOnly: true, sameSite: 'lax' }); // optional, for cookies
        return res.json({
          success: true,
          user,
          token,
        });
      });
    }
  );
});



// Get current user's info (authenticated)
userRoutes.get('/me', ensureAuth, (req, res) => {
  const userId = req.user.id; // set by ensureAuth middleware
  pool.query(
    'SELECT idNumber AS id, firstName, lastName, email, role, points FROM users WHERE idNumber = ?',
    [userId],
    (err, users) => {
      if (err || !users.length) return res.status(404).json({ success: false, error: err || 'User not found' });
      res.json(users[0]);
    }
  );
});




module.exports = userRoutes;

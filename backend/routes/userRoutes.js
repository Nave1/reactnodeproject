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



module.exports = userRoutes;

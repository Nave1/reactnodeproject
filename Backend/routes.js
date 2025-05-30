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

// 📧 Email route
auth.post('/send-email', (req, res) => {
  const { name, email, message } = req.body;
  const emailData = {
    from: email,
    to: 'inbox@simulated.com',
    subject: `Message from ${name}`,
    html: `<strong>${name}</strong><p>${message}</p>`,
    timestamp: new Date().toISOString()
  };

  const filePath = path.join(__dirname, 'emails.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    let emails = [];
    if (!err && data) {
      try { emails = JSON.parse(data); } catch { emails = []; }
    }

    emails.push(emailData);
    fs.writeFile(filePath, JSON.stringify(emails, null, 2), (err) => {
      if (err) return res.status(500).json({ success: false, error: err });
      return res.json({ success: true, message: 'Email saved successfully' });
    });
  });
});

// 👤 Register
auth.post('/register', async (req, res) => {
  const { firstName, lastName, idNumber, email, password } = req.body;
  if (!firstName || !lastName || !idNumber || !email || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  try {
    const hashed = await bcrypt.hash(password, saltRounds);
    const sql = `INSERT INTO users (firstName, lastName, idNumber, email, password, role) VALUES (?, ?, ?, ?, ?, 'user')`;
    const values = [firstName, lastName, idNumber, email, hashed];
    pool.query(sql, values, (err, result) => {
      if (err) return res.status(500).json({ success: false, error: err });
      return res.json({ success: true, message: 'User registered' });
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error hashing password' });
  }
});

// 🔐 Login
auth.post('/login', (req, res) => {
  const { email, password } = req.body;
  const sql = `SELECT * FROM users WHERE email = ?`;
  pool.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err });
    if (results.length === 0) return res.status(404).json({ success: false, message: 'User not found' });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(403).json({ success: false, message: 'Wrong password' });

    const token = jwt.sign({ id: user.idNumber, role: user.role }, 'your-secret-key', { expiresIn: '8h' });
    return res
      .cookie('token', token, { httpOnly: true, sameSite: 'lax' })
      .json({ success: true, user: { id: user.idNumber, firstName: user.firstName, email: user.email, role: user.role } });
  });
});

// 🃏 Cards routes
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

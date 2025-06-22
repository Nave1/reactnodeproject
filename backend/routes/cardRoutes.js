// routes/cardRoutes.js
const express = require('express');
const multer = require('multer');
const pool = require('../dbSingleton');
const { sendMail } = require('../mailer');
const { cardClosed } = require('../emails/emailTemplates');
const upload = multer({ storage: multer.memoryStorage() });

const cards = express.Router();

// Middleware to verify token (duplicate, ideally move to a shared file!)
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

// --- Get Cards ---
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

// --- Create Card ---
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

// --- Update Card ---
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

// --- Delete Card ---
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

// --- Close Card ---
cards.put('/:slug/close', ensureAuth, (req, res) => {
  const { slug } = req.params;
  pool.query('SELECT * FROM cards WHERE slug = ?', [slug], async (err, rows) => {
    if (err || rows.length === 0) return res.status(404).json({ success: false, message: 'Card not found' });
    const card = rows[0];
    if (req.user.role !== 'admin' && card.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // 1. Update card status
    pool.query('UPDATE cards SET status = ? WHERE slug = ?', ['closed', slug], async (err) => {
      if (err) return res.status(500).json({ success: false, error: err });

      // 2. Add points to the user
      pool.query('UPDATE users SET points = points + 150 WHERE idNumber = ?', [card.user_id], async (pointsErr) => {
        if (pointsErr) {
          console.error('Error adding points:', pointsErr);
        }

        // 3. Send email
        if (card.email) {
          try {
            const mail = cardClosed(card.email, card.fullName, card.title);
            await sendMail(mail.to, mail.subject, mail.html);
          } catch (mailErr) {
            console.error('Error sending closure email:', mailErr);
          }
        }

        // 4. Respond to client
        return res.json({ success: true, message: 'Card closed, user rewarded, and notified by email.' });
      });
    });
  });
});


// --- Get All Statuses for a Card ---
cards.get('/:slug/statuses', ensureAuth, (req, res) => {
  const { slug } = req.params;
  pool.query('SELECT id FROM cards WHERE slug = ?', [slug], (err, cardRows) => {
    if (err || cardRows.length === 0) return res.status(404).json({ success: false, message: 'Card not found' });
    const cardId = cardRows[0].id;

    pool.query(
      'SELECT status_text, status_date FROM card_statuses WHERE card_id = ? ORDER BY status_date DESC',
      [cardId],
      (err, rows) => {
        if (err) return res.status(500).json({ success: false, error: err });
        return res.json(rows);
      }
    );
  });
});

// --- Add New Status to a Card (admin only) ---
cards.post('/:slug/statuses', ensureAuth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admins only' });
  }
  const { slug } = req.params;
  const { status_text } = req.body;
  if (!status_text || !status_text.trim()) {
    return res.status(400).json({ success: false, message: 'Status text required' });
  }

  pool.query('SELECT id FROM cards WHERE slug = ?', [slug], (err, cardRows) => {
    if (err || cardRows.length === 0) return res.status(404).json({ success: false, message: 'Card not found' });
    const cardId = cardRows[0].id;

    pool.query(
      'INSERT INTO card_statuses (card_id, status_text) VALUES (?, ?)',
      [cardId, status_text],
      (err) => {
        if (err) return res.status(500).json({ success: false, error: err });
        return res.status(201).json({ success: true, message: 'Status added' });
      }
    );
  });
});

module.exports = cards;

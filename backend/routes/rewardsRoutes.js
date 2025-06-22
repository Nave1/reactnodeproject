// routes/rewardsRoutes.js
const express = require('express');
const pool = require('../dbSingleton');
const rewardsRoutes = express.Router();

// --- Copy-pasted middleware from userRoutes.js (so this file works standalone) ---
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
function ensureAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ message: 'Admins only.' });
}
// ----------------------------------------------------------------------------

// Get all rewards items
rewardsRoutes.get('/', ensureAuth, (req, res) => {
  pool.query('SELECT * FROM rewards', (err, items) => {
    if (err) return res.status(500).json({ success: false, error: err });
    res.json(items);
  });
});

// Add new reward (admin only)
rewardsRoutes.post('/', ensureAuth, ensureAdmin, (req, res) => {
  const { title, description, points } = req.body;
  if (!title || !points) return res.status(400).json({ success: false, message: 'Title and points required' });
  pool.query(
    'INSERT INTO rewards (title, description, points) VALUES (?, ?, ?)',
    [title, description, points],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, error: err });
      res.json({ success: true, id: result.insertId });
    }
  );
});

// Edit reward (admin only)
rewardsRoutes.put('/:id', ensureAuth, ensureAdmin, (req, res) => {
  const { id } = req.params;
  const { title, description, points } = req.body;
  pool.query(
    'UPDATE rewards SET title=?, description=?, points=? WHERE id=?',
    [title, description, points, id],
    (err) => {
      if (err) return res.status(500).json({ success: false, error: err });
      res.json({ success: true });
    }
  );
});

// Delete reward (admin only)
rewardsRoutes.delete('/:id', ensureAuth, ensureAdmin, (req, res) => {
  const { id } = req.params;
  pool.query('DELETE FROM rewards WHERE id=?', [id], (err) => {
    if (err) return res.status(500).json({ success: false, error: err });
    res.json({ success: true });
  });
});

// User selects a reward (spend points & block double-use)
rewardsRoutes.post('/:id/select', ensureAuth, (req, res) => {
  const userId = req.user.id;
  const rewardId = req.params.id;

  pool.query(
    'SELECT * FROM user_rewards WHERE user_id = ? AND reward_id = ?',
    [userId, rewardId],
    (err, rows) => {
      if (err) return res.status(500).json({ success: false, error: err });
      if (rows.length > 0)
        return res.status(400).json({ success: false, message: 'Reward already claimed.' });

      // Get reward cost and user's points
      pool.query('SELECT points FROM rewards WHERE id = ?', [rewardId], (err, rewardRows) => {
        if (err || !rewardRows.length)
          return res.status(400).json({ success: false, message: 'Reward not found.' });

        const rewardPoints = rewardRows[0].points;
        pool.query('SELECT points FROM users WHERE idNumber = ?', [userId], (err, userRows) => {
          if (err || !userRows.length)
            return res.status(400).json({ success: false, message: 'User not found.' });

          const userPoints = userRows[0].points;
          if (userPoints < rewardPoints)
            return res.status(400).json({ success: false, message: 'Not enough points.' });

          // Deduct points and add to user_rewards
          pool.query('UPDATE users SET points = points - ? WHERE idNumber = ?', [rewardPoints, userId], (err) => {
            if (err) return res.status(500).json({ success: false, error: err });
            pool.query('INSERT INTO user_rewards (user_id, reward_id) VALUES (?, ?)', [userId, rewardId], (err) => {
              if (err) return res.status(500).json({ success: false, error: err });
              res.json({ success: true });
            });
          });
        });
      });
    }
  );
});

// Get all rewards claimed by user
rewardsRoutes.get('/used', ensureAuth, (req, res) => {
  const userId = req.user.id;
  pool.query(
    'SELECT r.* FROM user_rewards ur JOIN rewards r ON ur.reward_id = r.id WHERE ur.user_id = ?',
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ success: false, error: err });
      res.json(rows);
    }
  );
});


module.exports = rewardsRoutes;

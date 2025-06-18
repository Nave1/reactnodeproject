// routes/cards.js
const express = require('express');
const router = express.Router();
// Assume you import/connect your db and isAdmin middleware above

// GET all statuses for a card by slug
router.get('/:slug/statuses', async (req, res) => {
  const { slug } = req.params;
  try {
    // Find the card by slug
    const [cards] = await req.db.query('SELECT id FROM cards WHERE slug = ?', [slug]);
    if (!cards.length) return res.status(404).json({ message: 'Card not found' });
    const cardId = cards[0].id;

    const [rows] = await req.db.query(
      'SELECT status_text, status_date FROM card_statuses WHERE card_id = ? ORDER BY status_date DESC',
      [cardId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving statuses.' });
  }
});

// POST a new status for a card by slug (admin only)
router.post('/:slug/statuses', isAdmin, async (req, res) => {
  const { slug } = req.params;
  const { status_text } = req.body;
  if (!status_text || !status_text.trim()) {
    return res.status(400).json({ message: 'Status text required' });
  }
  try {
    // Find the card by slug
    const [cards] = await req.db.query('SELECT id FROM cards WHERE slug = ?', [slug]);
    if (!cards.length) return res.status(404).json({ message: 'Card not found' });
    const cardId = cards[0].id;

    await req.db.query(
      'INSERT INTO card_statuses (card_id, status_text) VALUES (?, ?)',
      [cardId, status_text]
    );
    res.status(201).json({ message: 'Status added' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding status.' });
  }
});

module.exports = router;

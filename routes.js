// routes.js with modifications to handle duplicate titles
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('./dbSingleton');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto'); // Using built-in crypto instead of uuid

const saltRounds = 10;

// Set up Multer to store file data in memory
const upload = multer({ storage: multer.memoryStorage() });

/* ----- USER ENDPOINTS ----- */

// Registration endpoint
router.post('/register', async (req, res) => {
  console.log('Received registration data:', req.body);
  const { firstName, lastName, idNumber, email, password } = req.body;

  if (!firstName || !lastName || !idNumber || !email || !password) {
    console.error('Missing required fields.');
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const role = 'user';
    const sql = `
      INSERT INTO users (firstName, lastName, idNumber, email, password, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [firstName, lastName, idNumber, email, hashedPassword, role];

    pool.query(sql, values, (error, results) => {
      if (error) {
        console.error('Error inserting user:', error);
        return res.status(500).json({ success: false, message: 'Error signing up.', error: error.toString() });
      }
      console.log('User inserted successfully. Results:', results);
      return res.json({ success: true, message: 'Signed Up Successfully' });
    });
  } catch (err) {
    console.error('Error processing registration:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }
  const sql = 'SELECT * FROM users WHERE email = ?';
  pool.query(sql, [email], async (error, results) => {
    if (error) {
      console.error('Error querying user:', error);
      return res.status(500).json({ success: false, message: 'Error logging in.', error: error.toString() });
    }
    if (results.length === 0) {
      return res.status(400).json({ success: false, message: 'User not found.' });
    }
    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ success: false, message: 'Incorrect password.' });
    }
    return res.json({
      success: true,
      message: 'Logged in successfully.',
      user: { firstName: user.firstName, email: user.email, role: user.role }
    });
  });
});

/* ----- EMAIL SENDING ENDPOINT ----- */

// This endpoint simulates sending an email by appending the data to a local email.json file
router.post('/send-email', (req, res) => {
  console.log("Received email data:", req.body);
  const emailData = req.body;
  const filePath = path.join(__dirname, 'email.json');

  // Read the current file content (if any) and append the new email data
  fs.readFile(filePath, 'utf8', (err, data) => {
    let emails = [];
    if (!err) {
      try {
        emails = JSON.parse(data);
      } catch (e) {
        emails = [];
      }
    }
    emails.push(emailData);
    fs.writeFile(filePath, JSON.stringify(emails, null, 2), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Error saving email data" });
      }
      return res.json({ success: true, message: "Email sent successfully" });
    });
  });
});

/* ----- CARD ENDPOINTS ----- */

// Generate a unique slug
function generateUniqueSlug(title) {
  const baseSlug = title.toLowerCase().trim().replace(/\s+/g, '-');
  const uniqueId = crypto.randomBytes(4).toString('hex'); // 8 character random hex
  return `${baseSlug}-${uniqueId}`;
}

// Create a new card (image is required)
router.post('/cards', upload.single('image'), async (req, res) => {
  const { fullName, phoneNumber, city, street, title, description } = req.body;
  if (!fullName || !phoneNumber || !city || !street || !title || !description) {
    return res.status(400).json({ success: false, message: 'Missing required fields for card.' });
  }
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Image is required.' });
  }

  // Generate a unique slug
  const slug = generateUniqueSlug(title);

  const imageData = req.file.buffer;

  const sql = `
    INSERT INTO cards (fullName, phoneNumber, city, street, title, description, slug, image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [fullName, phoneNumber, city, street, title, description, slug, imageData];

  pool.query(sql, values, (error, results) => {
    if (error) {
      console.error('Error inserting card:', error);
      return res.status(500).json({ success: false, message: 'Error creating card.', error: error.toString() });
    }
    console.log('Card inserted successfully. Results:', results);
    return res.json({
      success: true,
      message: 'Card created successfully',
      cardId: results.insertId,
      slug: slug // Return the generated slug
    });
  });
});

// Retrieve all cards (convert image Buffer to Base64)
router.get('/cards', async (req, res) => {
  const sql = 'SELECT * FROM cards';
  pool.query(sql, (error, results) => {
    if (error) {
      console.error('Error retrieving cards:', error);
      return res.status(500).json({ success: false, message: 'Error retrieving cards.', error: error.toString() });
    }
    const cards = results.map(card => {
      if (card.image) {
        card.image = card.image.toString('base64');
      }
      return card;
    });
    return res.json(cards);
  });
});

// Update an existing card by id (supports partial updates)
router.put('/cards/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params;

  // Fetch the current record from the database using the card id
  const selectSql = 'SELECT * FROM cards WHERE id = ?';
  pool.query(selectSql, [id], (selectError, results) => {
    if (selectError) {
      console.error('Error retrieving card:', selectError);
      return res.status(500).json({ success: false, message: 'Error retrieving card.', error: selectError.toString() });
    }
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Card not found.' });
    }
    const currentCard = results[0];

    // For each field, if provided in req.body and non-empty, use it; otherwise, keep the current value.
    const updatedFullName = req.body.fullName ? req.body.fullName.trim() : currentCard.fullName;
    const updatedPhoneNumber = req.body.phoneNumber ? req.body.phoneNumber.trim() : currentCard.phoneNumber;
    const updatedCity = req.body.city ? req.body.city.trim() : currentCard.city;
    const updatedStreet = req.body.street ? req.body.street.trim() : currentCard.street;
    const updatedTitle = req.body.title ? req.body.title.trim() : currentCard.title;
    const updatedDescription = req.body.description ? req.body.description.trim() : currentCard.description;

    // If title changes, generate a new unique slug
    let newSlug;
    if (updatedTitle !== currentCard.title) {
      newSlug = generateUniqueSlug(updatedTitle);
    } else {
      newSlug = currentCard.slug;
    }

    // For image: if a new file is provided, use its buffer; otherwise, keep the existing image.
    const updatedImage = req.file ? req.file.buffer : currentCard.image;

    const updateSql = `
      UPDATE cards
      SET fullName = ?, phoneNumber = ?, city = ?, street = ?, title = ?, description = ?, slug = ?, image = ?
      WHERE id = ?
    `;
    const values = [
      updatedFullName,
      updatedPhoneNumber,
      updatedCity,
      updatedStreet,
      updatedTitle,
      updatedDescription,
      newSlug,
      updatedImage,
      id
    ];

    pool.query(updateSql, values, (updateError, updateResults) => {
      if (updateError) {
        console.error('Error updating card:', updateError);
        return res.status(500).json({ success: false, message: 'Error updating card.', error: updateError.toString() });
      }
      return res.json({
        success: true,
        message: 'Card updated successfully',
        slug: newSlug // Return the possibly new slug
      });
    });
  });
});

// Close a card (set status to 'closed')
// Since you don't have a status column, we'll return an error message.
router.put('/cards/:slug/close', async (req, res) => {
  const { slug } = req.params;
  const sql = 'UPDATE cards SET status = ? WHERE slug = ?';

  pool.query(sql, ['closed', slug], (error, results) => {
    if (error) {
      console.error('Error closing card:', error);
      return res.status(500).json({
        success: false,
        message: 'Error closing card.',
        error: error.toString()
      });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Card not found.'
      });
    }

    return res.json({
      success: true,
      message: 'Card closed successfully'
    });
  });
});

// Delete a card by slug
router.delete('/cards/:slug', async (req, res) => {
  const { slug } = req.params;
  const sql = 'DELETE FROM cards WHERE slug = ?';
  pool.query(sql, [slug], (error, results) => {
    if (error) {
      console.error('Error deleting card:', error);
      return res.status(500).json({ success: false, message: 'Error deleting card.', error: error.toString() });
    }
    return res.json({ success: true, message: 'Card deleted successfully' });
  });
});

module.exports = router;
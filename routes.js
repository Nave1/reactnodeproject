// routes.js
const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('./dbSingleton');

const router = new express.Router();
const saltRounds = 10; // Number of salt rounds for bcrypt

// Registration endpoint
router.post('/register', async (req, res) => {
  console.log('Received registration data:', req.body);

  const { firstName, lastName, idNumber, email, password } = req.body;

  // Basic check: ensure all required fields are provided
  if (!firstName || !lastName || !idNumber || !email || !password) {
    console.error('Missing required fields.');
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  try {
    // Hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Updated SQL query using camelCase column names
    const sql = `
      INSERT INTO users (firstName, lastName, idNumber, email, password)
      VALUES (?, ?, ?, ?, ?)
    `;
    const values = [firstName, lastName, idNumber, email, hashedPassword];

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
    // Compare the provided password with the hashed password from the database
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ success: false, message: 'Incorrect password.' });
    }

    // On success, return user info (e.g., firstName and email)
    return res.json({
      success: true,
      message: 'Logged in successfully.',
      user: { firstName: user.firstName, email: user.email }
    });
  });
});

module.exports = router;

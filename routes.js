// routes.js
const express = require('express');
const fs = require('fs');           // Import file system module
const path = require('path');       // Import path module
const bcrypt = require('bcrypt');   // For password hashing
const saltRounds = 10;              // Number of salt rounds for bcrypt

const pool = require('./dbSingleton'); // Import the MySQL connection pool

const router = new express.Router();

// Endpoint for sending an email
router.post('/send-email', (req, res) => {
  const { name, email, message } = req.body;

  const emailObject = {
    from: email,
    to: 'inbox@simulated.com', // Dummy destination email
    subject: `New message from ${name}`,
    html: `<p><strong>Name:</strong> ${name}</p>
           <p><strong>Email:</strong> ${email}</p>
           <p><strong>Message:</strong><br/> ${message}</p>`,
    timestamp: new Date().toISOString()
  };

  const filePath = path.join(__dirname, 'emails.json');

  fs.readFile(filePath, 'utf8', (readErr, data) => {
    let emailsArray = [];
    if (!readErr && data) {
      try {
        emailsArray = JSON.parse(data);
      } catch (parseErr) {
        console.error('Error parsing JSON file:', parseErr);
        emailsArray = [];
      }
    }

    emailsArray.push(emailObject);

    fs.writeFile(filePath, JSON.stringify(emailsArray, null, 2), (writeErr) => {
      if (writeErr) {
        console.error('Error writing to JSON file:', writeErr);
        return res.status(500).json({ success: false, error: writeErr.toString() });
      } else {
        console.log('Email saved to JSON file.');
        return res.json({ success: true, message: 'Email saved to JSON file successfully' });
      }
    });
  });
});

// Endpoint for user registration that inserts a new user into the SQL table
router.post('/register', async (req, res) => {
  console.log('Received registration data:', req.body);

  const { firstName, lastName, idNumber, email, password } = req.body;

  // Basic check to ensure all required fields are provided
  if (!firstName || !lastName || !idNumber || !email || !password) {
    console.error('Missing required fields.');
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  try {
    // Hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, saltRounds);

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

module.exports = router;

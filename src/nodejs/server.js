// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

// Enable CORS to allow requests from your React client
app.use(cors());

// Parse JSON in requests
app.use(bodyParser.json());

// POST endpoint to simulate sending email
app.post('/send-email', (req, res) => {
  const { name, email, message } = req.body;

  // Create an email object to simulate the email data
  const emailObject = {
    from: email,
    to: 'inbox@simulated.com', // Dummy destination
    subject: `New message from ${name}`,
    html: `<p><strong>Name:</strong> ${name}</p>
           <p><strong>Email:</strong> ${email}</p>
           <p><strong>Message:</strong><br/> ${message}</p>`,
    timestamp: new Date().toISOString()
  };

  // Define the file path for the JSON "inbox"
  const filePath = path.join(__dirname, 'emails.json');

  // Read existing emails from the JSON file (if it exists)
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

    // Add the new email to the array
    emailsArray.push(emailObject);

    // Write the updated array back to the JSON file
    fs.writeFile(filePath, JSON.stringify(emailsArray, null, 2), (writeErr) => {
      if (writeErr) {
        console.error('Error writing to JSON file:', writeErr);
        res.status(500).json({ success: false, error: writeErr.toString() });
      } else {
        console.log('Email saved to JSON file.');
        res.json({ success: true, message: 'Email saved to JSON file successfully' });
      }
    });
  });
});

// Use port 5001 or an available port
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

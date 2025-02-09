// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const pool = require('./dbSingleton'); // Import the MySQL connection pool
const router = require('./routes');

const app = express();

// Enable CORS - In production, restrict this to authorized domains only
app.use(cors());

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Use the router for handling endpoints
app.use(router);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { auth, cards } = require('./routes'); // <-- named imports

const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// API endpoints
app.use('/auth', auth);   // e.g., POST /auth/login
app.use('/cards', cards); // e.g., GET /cards

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


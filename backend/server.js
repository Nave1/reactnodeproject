// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Import new routes directly
const authRoutes = require('./routes/authRoutes');
const cardRoutes = require('./routes/cardRoutes');

const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// Use split routes
app.use('/auth', authRoutes);   // e.g., POST /auth/login
app.use('/cards', cardRoutes);  // e.g., GET /cards

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Import new routes directly
const authRoutes = require('./routes/authRoutes');
const cardRoutes = require('./routes/cardRoutes');
const userRoutes = require('./routes/userRoutes');
const rewardsRoutes = require('./routes/rewardsRoutes');


const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// Use split routes
app.use('/auth', authRoutes);   // e.g., POST /auth/login
app.use('/api/cards', cardRoutes);  // e.g., GET /cards
app.use('/api', userRoutes); // e.g., GET /users (admin only)
app.use('/api/rewards', rewardsRoutes); // e.g., GET /rewards

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// config.js
require('dotenv').config();

module.exports = {
  BASE_URL: process.env.BASE_URL || 'http://localhost:3000',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'collectorg40@gmail.com',
};

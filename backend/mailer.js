// mailer.js
require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const FROM_NAME = process.env.EMAIL_FROM_NAME || 'Garbage Collector';
const FROM_ADDRESS = process.env.GMAIL_USER;

/**
 * Send an email
 * @param {string} to - recipient email address
 * @param {string} subject - email subject
 * @param {string} html - email body (HTML allowed)
 */
async function sendMail(to, subject, html) {
  const mailOptions = {
    from: `"${FROM_NAME}" <${FROM_ADDRESS}>`,
    to,
    subject,
    html,
  };
  return transporter.sendMail(mailOptions);
}

module.exports = { sendMail };

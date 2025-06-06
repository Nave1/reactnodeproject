// mailer.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'collectorg40@gmail.com',  
    pass: 'dsdb orej cfwf ntdh'     // Gmail App Password (not your real Gmail password!)
  }
});

/**
 * Send an email
 * @param {string} to - recipient email address
 * @param {string} subject - email subject
 * @param {string} html - email body (HTML allowed)
 */
async function sendMail(to, subject, html) {
  const mailOptions = {
    from: '"Garbage Collector" <collectorg40@gmail.com>',
    to,
    subject,
    html
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { sendMail };

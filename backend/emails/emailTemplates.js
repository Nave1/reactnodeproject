// /emails/emailTemplates.js
const { BASE_URL } = require('../config');

module.exports = {
  verificationEmail: (to, firstName, token) => ({
    to,
    subject: 'Verify your email',
    html: `
      <p>Hi ${firstName},</p>
      <p>Please verify your email by clicking <a href="${BASE_URL}/verify-email?token=${token}">here</a>.</p>
      <p>If you did not register, please ignore this email.</p>
    `
  }),
  passwordReset: (to, token) => ({
    to,
    subject: 'Password Reset Request',
    html: `
      <p>If you requested a password reset, click <a href="${BASE_URL}/reset-password?token=${token}">here</a> to set a new password. This link is valid for 1 hour.</p>
      <p>If you did not request a reset, you can ignore this email.</p>
    `
  }),
  cardClosed: (to, fullName, title) => ({
    to,
    subject: "Your report has been handled",
    html: `
      <p>Hi ${fullName || 'user'},</p>
      <p>Your report titled "<strong>${title}</strong>" has been taken care of by the admin.</p>
      <p>Thank you for helping keep your community clean!<br>- Garbage Collector Team</p>
    `
  }),
  contactUs: (name, email, message) => ({
    to: process.env.ADMIN_EMAIL,
    subject: `Contact Us form submission from ${name}`,
    html: `
      <h2>New Contact Us Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong><br/>${message.replace(/\n/g, '<br/>')}</p>
    `
  })
};

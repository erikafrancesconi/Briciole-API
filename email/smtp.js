const nodemailer = require('nodemailer');

const sendMail = async function(email) {
  const { to, subject, html } = email;

  if (!to || !subject || !html) {
    return { success: false, error: "Empty parameters"};
  }

  if (!process.env.SMTP_HOST || !process.env.SMTP_PORT) {
    return { success: false, error: "SMTP Host not specified"};
  }

  let auth = {}, tls = {};
  if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
    auth = {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  }
  if (process.env.NODE_ENV !== 'production') {
    tls = {
      rejectUnauthorized: false
    }
  }

  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: auth,
    tls: tls
  });
  
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: to,
    subject: subject,
    html: html
  };

  try {
    await transport.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    return { success: false, error: error};
  }
}

module.exports = {
  sendMail: sendMail
}
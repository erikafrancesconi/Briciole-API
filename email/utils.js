const { sendMail } = require('../email/smtp');

const emailIsValid = email => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const sendConfirmationEmail= (name, to, hash) => {
  const email = {
    to: to,
    subject: `${process.env.APPNAME}: Please confirm you email address`,
    html: `Hello ${name},<br />${hash}`
  }

  return sendMail(email);
}

module.exports = {
  emailIsValid: emailIsValid,
  sendConfirmationEmail: sendConfirmationEmail
}
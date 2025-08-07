require('dotenv').config();
const nodeoutlook = require('nodejs-nodemailer-outlook');

function sendEmailNotif({ subject, html, isError = false }) {
  const options = {
    auth: {
      user: process.env.OUTLOOK_MAIL_USERNAME,
      pass: process.env.OUTLOOK_MAIL_PASSWORD
    },
    from: process.env.OUTLOOK_MAIL_FROM,
    to: "irvan.rizkiansyah@befa.id",
    subject,
    html,
    onError: (e) => console.error('[EMAIL ERROR]', e),
    onSuccess: (i) => console.log('[EMAIL SENT]', i)
  };

  if (process.env.SEND_EMAIL_CC === "1") {
    options.cc = process.env.SEND_EMAIL_ADDRESS_CC;
  }

  nodeoutlook.sendEmail(options);
}

module.exports = { sendEmailNotif };
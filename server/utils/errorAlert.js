// utils/errorAlert.js
const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   service: "gmail", // or your SMTP provider
//   auth: {
//     user: process.env.ALERT_EMAIL_USER,
//     pass: process.env.ALERT_EMAIL_PASS,
//   },
// });


const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true, // true for 465
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function sendErrorAlert({ error, req, payload }) {
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const userAgent = req.headers["user-agent"];
  const url = req.originalUrl;
  const method = req.method;
  const body = payload || req.body;
  const user = req.user ? JSON.stringify(req.user) : "Guest";

  const mailOptions = {
    from: process.env.MAIL_USER,
    to: process.env.ALERT_EMAIL_TO,
    subject: `API Error Alert: ${url}`,
    text: `Error: ${error}\n\nURL: ${url}\nMethod: ${method}\nIP: ${ip}\nUser-Agent: ${userAgent}\nUser: ${user}\nPayload: ${JSON.stringify(body)}\n`,
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (e) {
    console.error("Failed to send error alert email:", e);
  }
}

module.exports = sendErrorAlert;

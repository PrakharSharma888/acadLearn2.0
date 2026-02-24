const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // or your preferred provider
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

exports.sendContactMail = async ({ name, email, message }) => {
  const mailOptions = {
    from: process.env.MAIL_USER,
    to: email,
    subject: "Thank you for contacting JuniorLearn!",
    html: `
      <div style="background:#FFFDF5;padding:32px;font-family:Inter,sans-serif;color:#1f2937;">
        <div style="max-width:500px;margin:auto;border-radius:16px;background:#fff;box-shadow:0 4px 24px #f9fafb;overflow:hidden;">
          <div style="background:#10b981;padding:24px 0;text-align:center;color:#fff;font-size:2rem;font-weight:800;letter-spacing:1px;">
            Junior<span style="color:#f59e42;">Learn</span>
          </div>
          <div style="padding:32px;text-align:center;">
            <h2 style="font-size:1.5rem;font-weight:700;margin-bottom:16px;">Thank you, ${name}!</h2>
            <p style="font-size:1rem;color:#374151;margin-bottom:24px;">We’ve received your message:</p>
            <blockquote style="background:#f9fafb;border-left:4px solid #10b981;padding:16px 24px;margin:0 0 24px 0;color:#1f2937;font-style:italic;">${message}</blockquote>
            <p style="font-size:1rem;color:#374151;">Our team will contact you soon. For urgent queries, reply to this email.</p>
            <div style="margin-top:32px;font-size:0.9rem;color:#6b7280;">&copy; 2026 JuniorLearn. All rights reserved.</div>
          </div>
        </div>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

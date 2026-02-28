const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true, // true for 465
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});
/**
 * Sends a password-reset email with the AcadLearn Jr. branded template.
 * @param {string} toEmail  - recipient email address
 * @param {string} resetUrl - full reset link the user should click
 * @param {string} name     - recipient's display name
 */
const sendPasswordResetEmail = async (toEmail, resetUrl, name = "there") => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Password – AcadLearn</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:'Segoe UI',Arial,sans-serif;">

  <!-- Wrapper -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
         style="background-color:#f9fafb;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
               style="max-width:520px;">

          <!-- ── Header / Logo ── -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <!-- Coloured badge logo -->
                    <div style="
                      display:inline-flex;
                      align-items:center;
                      gap:10px;
                      background:#fff7ed;
                      border:2px solid #fed7aa;
                      border-radius:16px;
                      padding:12px 20px;
                    ">
                      <!-- Book icon SVG -->
                      <span style="
                        display:inline-block;
                        width:36px;height:36px;
                        background:linear-gradient(135deg,#f97316,#f59e0b);
                        border-radius:10px;
                        text-align:center;
                        line-height:36px;
                        font-size:20px;
                      ">📚</span>
                      <span style="
                        font-size:22px;
                        font-weight:800;
                        color:#1e293b;
                        letter-spacing:-0.5px;
                      ">Acad<span style="color:#f97316;">Learn Jr.</span></span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── Card ── -->
          <tr>
            <td style="
              background:#ffffff;
              border-radius:24px;
              overflow:hidden;
              box-shadow:0 4px 24px rgba(0,0,0,0.08);
            ">
              <!-- Orange hero strip -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="
                    background:linear-gradient(135deg,#f97316 0%,#f59e0b 100%);
                    padding:36px 32px 28px;
                    text-align:center;
                  ">
                    <!-- Lock icon circle -->
                    <div style="
                      width:64px;height:64px;
                      background:rgba(255,255,255,0.25);
                      border-radius:50%;
                      margin:0 auto 16px;
                      display:flex;
                      align-items:center;
                      justify-content:center;
                      font-size:30px;
                      line-height:64px;
                      text-align:center;
                    ">🔐</div>
                    <h1 style="
                      margin:0;
                      color:#ffffff;
                      font-size:24px;
                      font-weight:800;
                      letter-spacing:-0.3px;
                    ">Password Reset Request</h1>
                    <p style="
                      margin:8px 0 0;
                      color:rgba(255,255,255,0.85);
                      font-size:14px;
                    ">We received a request to reset your password</p>
                  </td>
                </tr>
              </table>

              <!-- Body content -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding:36px 36px 32px;">

                    <p style="margin:0 0 8px;font-size:16px;color:#1e293b;font-weight:700;">
                      Hi ${name} 👋
                    </p>
                    <p style="margin:0 0 24px;font-size:15px;color:#64748b;line-height:1.6;">
                      Someone requested a password reset for your <strong style="color:#f97316;">AcadLearn</strong> account.
                      Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
                    </p>

                    <!-- CTA Button -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td align="center" style="padding:4px 0 28px;">
                          <a href="${resetUrl}"
                             target="_blank"
                             style="
                               display:inline-block;
                               background:linear-gradient(135deg,#f97316,#f59e0b);
                               color:#ffffff;
                               text-decoration:none;
                               font-size:15px;
                               font-weight:700;
                               padding:14px 40px;
                               border-radius:12px;
                               letter-spacing:0.2px;
                               box-shadow:0 4px 14px rgba(249,115,22,0.4);
                             ">
                            Reset My Password →
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Divider -->
                    <hr style="border:none;border-top:1px solid #f1f5f9;margin:0 0 24px;" />

                    <!-- Fallback link -->
                    <p style="margin:0 0 6px;font-size:13px;color:#94a3b8;">
                      Button not working? Copy and paste this link into your browser:
                    </p>
                    <p style="
                      margin:0 0 24px;
                      font-size:12px;
                      color:#f97316;
                      word-break:break-all;
                      background:#fff7ed;
                      padding:10px 14px;
                      border-radius:8px;
                      border:1px solid #fed7aa;
                    ">${resetUrl}</p>

                    <!-- Info box -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="
                          background:#fff7ed;
                          border:1px solid #fed7aa;
                          border-radius:12px;
                          padding:14px 18px;
                        ">
                          <p style="margin:0;font-size:13px;color:#92400e;line-height:1.5;">
                            🛡️ <strong>Didn't request this?</strong> You can safely ignore this email.
                            Your password will remain unchanged and the link will expire automatically.
                          </p>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── Footer ── -->
          <tr>
            <td style="padding:28px 16px 0;text-align:center;">
              <p style="margin:0 0 6px;font-size:13px;color:#94a3b8;">
                © ${new Date().getFullYear()} AcadLearn · All rights reserved
              </p>
              <p style="margin:0;font-size:12px;color:#cbd5e1;">
                This is an automated email, please do not reply.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `.trim();

  await transporter.sendMail({
    from: `"AcadLearn Jr." <${process.env.MAIL_USER}>`,
    to:   toEmail,
    subject: "Reset your AcadLearn password 🔐",
    html,
  });
};

module.exports = { sendPasswordResetEmail };

const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.MAIL_USER,
//     pass: process.env.MAIL_PASS,
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

exports.sendDemoBookingMail = async ({
  parentName,
  email,
  studentName,
  grade,
  className,
  bookingId,
}) => {
  const classDisplay = className || "a Demo Class";
  const bookingRef = String(bookingId).slice(-8).toUpperCase();

  const mailOptions = {
    from: `"AcadLearn" <${process.env.MAIL_USER}>`,
    to: email,
    subject: `Demo Class Booked! Booking #${bookingRef} — AcadLearn`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Demo Booking Confirmation</title>
</head>
<body style="margin:0;padding:0;background:#f0f0ff;font-family:'Inter',Arial,sans-serif;">

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f0ff;padding:40px 0;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(79,70,229,0.12);background:#ffffff;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:36px 40px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">
                      Acad<span style="color:#10b981;">Learn</span>
                    </span>
                  </td>
                  <td align="right">
                    <span style="background:rgba(255,255,255,0.15);color:#ffffff;font-size:12px;font-weight:700;padding:6px 14px;border-radius:50px;letter-spacing:1px;text-transform:uppercase;">
                      Demo Booking
                    </span>
                  </td>
                </tr>
              </table>
              <h1 style="margin:24px 0 0;font-size:22px;font-weight:700;color:#ffffff;line-height:1.4;">
                Your demo class is confirmed! 🎉
              </h1>
              <p style="margin:8px 0 0;font-size:15px;color:rgba(255,255,255,0.8);">
                We're excited to meet ${studentName}.
              </p>
            </td>
          </tr>

          <!-- Booking Reference Banner -->
          <tr>
            <td style="background:#4f46e5;padding:0 40px 20px;">
              <table cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.12);border-radius:10px;padding:12px 20px;width:100%;">
                <tr>
                  <td style="color:rgba(255,255,255,0.7);font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;">Booking Reference</td>
                  <td align="right" style="color:#ffffff;font-size:16px;font-weight:800;letter-spacing:2px;">#${bookingRef}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">

              <p style="margin:0 0 24px;font-size:16px;color:#374151;line-height:1.6;">
                Hi <strong>${parentName}</strong>,<br/>
                Thank you for booking a demo class with AcadLearn. Here's a summary of your booking:
              </p>

              <!-- Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7ff;border:1.5px solid #e0e7ff;border-radius:14px;overflow:hidden;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;border-bottom:1px solid #e0e7ff;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;width:40%;">Student Name</td>
                        <td style="color:#1f2937;font-size:15px;font-weight:700;">${studentName}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 24px;border-bottom:1px solid #e0e7ff;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;width:40%;">Grade / Class</td>
                        <td style="color:#1f2937;font-size:15px;font-weight:700;">${grade}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;width:40%;">Class Booked</td>
                        <td style="color:#4f46e5;font-size:15px;font-weight:700;">${classDisplay}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- What Happens Next -->
              <h3 style="margin:0 0 16px;font-size:16px;font-weight:700;color:#1f2937;">What happens next?</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="vertical-align:top;padding:0 0 16px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:32px;height:32px;background:#e0e7ff;border-radius:50%;text-align:center;vertical-align:middle;">
                          <span style="font-size:14px;font-weight:800;color:#4f46e5;">1</span>
                        </td>
                        <td style="padding-left:12px;color:#374151;font-size:14px;line-height:1.5;">
                          Our team will call you within <strong>24 hours</strong> to schedule the demo at a convenient time.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="vertical-align:top;padding:0 0 16px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:32px;height:32px;background:#d1fae5;border-radius:50%;text-align:center;vertical-align:middle;">
                          <span style="font-size:14px;font-weight:800;color:#10b981;">2</span>
                        </td>
                        <td style="padding-left:12px;color:#374151;font-size:14px;line-height:1.5;">
                          The 60-minute interactive demo class will be held online via a link we'll share.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="vertical-align:top;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:32px;height:32px;background:#fef3c7;border-radius:50%;text-align:center;vertical-align:middle;">
                          <span style="font-size:14px;font-weight:800;color:#f59e0b;">3</span>
                        </td>
                        <td style="padding-left:12px;color:#374151;font-size:14px;line-height:1.5;">
                          After the demo, ${studentName} can enroll in a full program at a special introductory price.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <a href="https://acadlearn.vercel.app/dashboard"
                      style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#ffffff;font-size:15px;font-weight:700;padding:14px 36px;border-radius:50px;text-decoration:none;letter-spacing:0.3px;">
                      Go to Your Dashboard →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:14px;color:#9ca3af;line-height:1.6;">
                Questions? Reply to this email or contact us at
                <a href="mailto:support@acadlearn.in" style="color:#4f46e5;text-decoration:none;font-weight:600;">support@acadlearn.in</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#1f2937;padding:28px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-size:20px;font-weight:900;color:#ffffff;">
                      Acad<span style="color:#10b981;">Learn</span>
                    </span>
                    <p style="margin:8px 0 0;font-size:12px;color:#9ca3af;line-height:1.6;">
                      Empowering young minds with real-world skills.<br/>
                      &copy; 2026 AcadLearn. All rights reserved.
                    </p>
                  </td>
                  <td align="right" style="vertical-align:top;">
                    <p style="margin:0;font-size:11px;color:#6b7280;line-height:2;">
                      <a href="#" style="color:#6b7280;text-decoration:none;">Privacy Policy</a> &nbsp;|&nbsp;
                      <a href="#" style="color:#6b7280;text-decoration:none;">Terms of Service</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- /Card -->

      </td>
    </tr>
  </table>

</body>
</html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

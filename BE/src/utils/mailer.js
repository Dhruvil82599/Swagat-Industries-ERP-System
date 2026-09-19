const nodemailer = require('nodemailer');

/**
 * Send OTP Password Reset Email
 * @param {string} toEmail - Recipient email address
 * @param {string} username - Account username
 * @param {string} otp - 6-digit OTP code
 */
const sendOtpEmail = async (toEmail, username, otp) => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  let smtpFrom = process.env.SMTP_FROM || '"Swagat Industries ERP" <no-reply@swagatindustries.com>';
  if (!smtpFrom.includes('<')) {
    const cleanName = smtpFrom.replace(/"/g, '').trim() || 'Swagat Industries ERP';
    const senderEmail = (process.env.SMTP_USER && process.env.SMTP_USER.includes('@'))
      ? process.env.SMTP_USER
      : 'no-reply@swagatindustries.com';
    smtpFrom = `"${cleanName}" <${senderEmail}>`;
  }

  const subject = `Swagat ERP - Password Reset Verification Code: ${otp}`;
  const htmlContent = `
    <div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08);">
      <div style="background-color: #123B5D; padding: 24px 32px; text-align: center;">
        <h2 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.02em;">Swagat Industries ERP</h2>
        <p style="color: #cbd5e1; margin: 4px 0 0 0; font-size: 13px;">Security & Account Recovery Service</p>
      </div>
      <div style="padding: 32px; color: #1e293b;">
        <h3 style="margin-top: 0; color: #123B5D; font-size: 18px;">Password Reset Request</h3>
        <p style="font-size: 14.5px; line-height: 1.6; color: #475569;">
          Hello <strong>${username}</strong>,
        </p>
        <p style="font-size: 14.5px; line-height: 1.6; color: #475569;">
          We received a request to reset your password for your Swagat ERP account. Use the 6-digit verification code below to authorize your password update:
        </p>

        <div style="margin: 28px 0; text-align: center;">
          <div style="display: inline-block; background-color: #F8FAFC; border: 2px dashed #123B5D; border-radius: 10px; padding: 16px 36px;">
            <span style="font-family: monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #F28C28;">${otp}</span>
          </div>
        </div>

        <p style="font-size: 13px; color: #64748B; line-height: 1.5;">
          ⏱️ <strong>This verification code will expire in 15 minutes.</strong><br/>
          If you did not request a password reset, please ignore this email or contact your administrator immediately.
        </p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0 20px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
          Swagat Industries ERP &bull; Secure Enterprise Portal &bull; Confidential
        </p>
      </div>
    </div>
  `;

  // Safe fallback if SMTP is not configured in .env
  if (!smtpHost || !smtpUser) {
    console.log('\n==================================================');
    console.log(`[SWAGAT ERP DEV MAILER] OTP for ${username} (${toEmail}): ${otp}`);
    console.log('==================================================\n');
    return { success: true, simulated: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(smtpPort),
      secure: Number(smtpPort) === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: smtpFrom,
      to: toEmail,
      subject,
      html: htmlContent,
    });

    return { success: true, simulated: false };
  } catch (error) {
    console.error('Nodemailer send email error:', error);
    // Even if sending fails, log OTP to console in dev mode so developer is never blocked
    console.log(`[FALLBACK DEV OTP LOG] User: ${username}, OTP: ${otp}`);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOtpEmail,
};

import nodemailer from "nodemailer";

export const sendEmail = async ({ subject, text, html }) => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, ADMIN_EMAIL } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !ADMIN_EMAIL) {
    console.warn("Missing SMTP credentials or ADMIN_EMAIL in .env. Email dispatch skipped.");
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465, // true for 465, false for other ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Waitlist System" <${SMTP_USER}>`,
      to: ADMIN_EMAIL,
      subject,
      text,
      html,
    });

    console.log("Email notification sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Failed to send email notification:", error);
    return false;
  }
};

import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, text, html }) => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, ADMIN_EMAIL } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !ADMIN_EMAIL) {
    console.warn("Missing SMTP credentials or ADMIN_EMAIL in .env. Email dispatch skipped.");
    return false;
  }

  const recipient = to || ADMIN_EMAIL;

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
      from: `"46 GOLD COAST" <${SMTP_USER}>`,
      to: recipient,
      subject,
      text,
      html,
    });

    console.log("Email sent successfully to %s: %s", recipient, info.messageId);
    return true;
  } catch (error) {
    console.error("Failed to send email to %s:", recipient, error);
    return false;
  }
};

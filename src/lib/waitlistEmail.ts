export type WaitlistSubmission = {
  email: string;
  phone: string;
};

export const WAITLIST_EMAIL_SUBJECT = "New Fashion Waitlist Signup";

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

export const buildWaitlistEmailText = ({ email, phone }: WaitlistSubmission) =>
  `A new user has joined the waitlist.

Email: ${email}
Mobile Number: ${phone}`;

export const buildWaitlistEmailHtml = ({ email, phone }: WaitlistSubmission) => {
  const safeEmail = escapeHtml(email);
  const safePhone = escapeHtml(phone);

  return `
  <div style="background:#f6f6f4;padding:24px;font-family:Arial,sans-serif;color:#111111;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
      <tr>
        <td style="padding:20px 24px;border-bottom:1px solid #e5e7eb;">
          <h2 style="margin:0;font-size:20px;line-height:1.4;font-weight:700;">New Fashion Waitlist Signup</h2>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 24px;">
          <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#374151;">A new user has joined the waitlist.</p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
            <tr>
              <td style="padding:10px 12px;border:1px solid #e5e7eb;background:#f9fafb;font-size:13px;font-weight:700;width:180px;">Email</td>
              <td style="padding:10px 12px;border:1px solid #e5e7eb;font-size:13px;">${safeEmail}</td>
            </tr>
            <tr>
              <td style="padding:10px 12px;border:1px solid #e5e7eb;background:#f9fafb;font-size:13px;font-weight:700;width:180px;">Mobile Number</td>
              <td style="padding:10px 12px;border:1px solid #e5e7eb;font-size:13px;">${safePhone}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>`;
};

export const sendWaitlistNotification = async (submission: WaitlistSubmission) => {
  const endpoint = import.meta.env.VITE_WAITLIST_WEBHOOK_URL || "/api/waitlist";

  const payload = {
    subject: WAITLIST_EMAIL_SUBJECT,
    text: buildWaitlistEmailText(submission),
    html: buildWaitlistEmailHtml(submission),
    ...submission,
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = `Email request failed with status ${response.status}`;
    try {
      const body = (await response.json()) as { error?: string; details?: string };
      if (body.error) {
        message = body.details ? `${body.error} (${body.details})` : body.error;
      }
    } catch {
      // Keep default message when response is not JSON.
    }
    throw new Error(message);
  }
};

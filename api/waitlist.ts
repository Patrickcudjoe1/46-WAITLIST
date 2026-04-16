type WaitlistBody = {
  email?: string;
  phone?: string;
  subject?: string;
  text?: string;
  html?: string;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export default async function handler(request: Request) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.WAITLIST_TO_EMAIL;
  const fromEmail = process.env.WAITLIST_FROM_EMAIL;

  if (!resendApiKey || !toEmail || !fromEmail) {
    return json(
      {
        error:
          "Missing env vars. Required: RESEND_API_KEY, WAITLIST_TO_EMAIL, WAITLIST_FROM_EMAIL",
      },
      500,
    );
  }

  let body: WaitlistBody;
  try {
    body = (await request.json()) as WaitlistBody;
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const email = body.email?.trim();
  const phone = body.phone?.trim();
  const subject = body.subject?.trim() || "New Fashion Waitlist Signup";

  if (!email || !phone) {
    return json({ error: "email and phone are required" }, 400);
  }

  const text =
    body.text?.trim() ||
    `A new user has joined the waitlist.

Email: ${email}
Mobile Number: ${phone}`;

  const html =
    body.html?.trim() ||
    `<p>A new user has joined the waitlist.</p><p><strong>Email:</strong> ${email}<br/><strong>Mobile Number:</strong> ${phone}</p>`;

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      subject,
      text,
      html,
    }),
  });

  if (!resendResponse.ok) {
    const errorText = await resendResponse.text();
    return json({ error: "Failed to send email", details: errorText }, 502);
  }

  return json({ ok: true });
}

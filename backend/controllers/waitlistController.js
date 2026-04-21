import { userQueries } from "../config/db.js";
import { initializePayment, verifyTransaction } from "../services/paystackService.js";
import { sendEmail } from "../services/emailService.js";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhone = (phone) => /^[+()\d\s-]{7,20}$/.test(phone);

export const registerWaitlist = async (req, res) => {
  const name = String(req.body?.name || "").trim();
  const size = String(req.body?.size || "").trim();
  const location = String(req.body?.location || "").trim();
  const email = String(req.body?.email || "").trim().toLowerCase();
  const phone = String(req.body?.phone || "").trim();
  const quantity = parseInt(req.body?.quantity || "1", 10) || 1;
  const subject = req.body?.subject;
  const text = req.body?.text;
  const html = req.body?.html;

  if (!email || !phone || !name || !size || !location) {
    return res.status(400).json({ message: "name, size, location, email, and phone are required" });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "invalid email" });
  }
  if (!isValidPhone(phone)) {
    return res.status(400).json({ message: "invalid phone number" });
  }

  try {
    const existing = await userQueries.findByEmail(email);
    if (existing && existing.paymentStatus === "paid") {
      return res.status(409).json({ message: "email already registered and paid" });
    }

    const paidCount = await userQueries.countPaid();
    if (paidCount >= 20) {
      return res.status(403).json({ message: "Waitlist is completely full! All 20 slots have been claimed." });
    }

    // Pre-order amount: 450 GHS per item
    const unitPrice = 45000; // 450.00 GHS in pesewas
    const amount = unitPrice * quantity;

    // Construct callback URL from frontend origin
    const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
    const callbackUrl = `${frontendOrigin.replace(/\/$/, "")}/success`;
    
    const { authorizationUrl, reference } = await initializePayment({
      email,
      amount,
      metadata: { name, size, location, quantity, phone },
      callbackUrl,
    });

    if (existing && existing.paymentStatus === "pending") {
      console.log(">>> Retrying Registration for Existing Pending User:", email);
      await userQueries.updatePendingUser(
        name,
        size,
        location,
        quantity,
        email,
        phone,
        authorizationUrl,
        reference,
        new Date().toISOString(),
      );
      console.log(">>> DB Update Successful for Existing User. Reference:", reference);
    } else {
      console.log(">>> Attempting DB Insertion for New User:", email);
      await userQueries.insert(
        name,
        size,
        location,
        quantity,
        email,
        phone,
        authorizationUrl,
        reference,
        "pending",
        new Date().toISOString(),
      );
      console.log(">>> DB Insertion Successful for Reference:", reference);
    }

    // Dispatch email notification asynchronously without blocking response
    if (subject && (text || html)) {
      sendEmail({ subject, text, html }).catch((err) => console.error("Email failed:", err));
    }

    return res.status(201).json({ paymentLink: authorizationUrl });
  } catch (error) {
    console.error("Waitlist Registration Error:", error);
    const message = error instanceof Error ? error.message : "unknown error";
    // Handle unique constraint races
    if (String(message).toLowerCase().includes("unique")) {
      return res.status(409).json({ message: "email already registered" });
    }
    return res.status(500).json({ message: "failed to register waitlist", details: message });
  }
};
 
export const getWaitlistEntry = async (req, res) => {
  const { reference } = req.params;
  
  if (!reference) {
    return res.status(400).json({ message: "reference is required" });
  }

  try {
    const user = await userQueries.findByReference(reference);
    if (!user) {
      return res.status(404).json({ message: "registration not found" });
    }

    return res.status(200).json({
      name: user.name,
      size: user.size,
      quantity: user.quantity,
      location: user.location,
      status: user.paymentStatus,
    });
  } catch (error) {
    console.error("Fetch registration error:", error);
    return res.status(500).json({ message: "failed to fetch registration" });
  }
};

export const verifyWaitlistPayment = async (req, res) => {
  const { reference } = req.params;

  if (!reference) {
    return res.status(400).json({ message: "reference is required" });
  }

  try {
    const user = await userQueries.findByReference(reference);
    if (!user) {
      return res.status(404).json({ message: "registration not found" });
    }

    // If already paid, just return success
    if (user.paymentStatus === "paid") {
      return res.status(200).json({ status: "paid", message: "already verified" });
    }

    console.log(`>>> Manually Verifying Payment for reference: ${reference}`);
    const paystackData = await verifyTransaction(reference);

    if (paystackData.status === "success") {
      console.log(`>>> Paystack confirmed SUCCESS for ${reference}. Updating DB...`);
      await userQueries.markPaid(reference);
      return res.status(200).json({ status: "paid", message: "payment verified and updated" });
    } else {
      console.log(`>>> Paystack status for ${reference}: ${paystackData.status}`);
      return res.status(200).json({ status: paystackData.status, message: "payment not yet successful" });
    }
  } catch (error) {
    console.error("Manual verification error:", error);
    return res.status(500).json({ message: "failed to verify payment", error: error.message });
  }
};

export const getAllRegistrations = async (_req, res) => {
  try {
    const users = await userQueries.findAll();
    return res.status(200).json(users);
  } catch (error) {
    console.error("Fetch all registrations error:", error);
    return res.status(500).json({ message: "failed to fetch registrations" });
  }
};

export const refreshPaymentSession = async (req, res) => {
  const { reference } = req.params;

  if (!reference) {
    return res.status(400).json({ message: "reference is required" });
  }

  try {
    const user = await userQueries.findByReference(reference);
    if (!user) {
      return res.status(404).json({ message: "registration not found" });
    }

    if (user.paymentStatus === "paid") {
      return res.status(400).json({ message: "payment already completed", status: "paid" });
    }

    console.log(`>>> Refreshing Payment Session for Reference: ${reference}`);

    // Pre-order amount: 450 GHS per item
    const unitPrice = 45000;
    const amount = unitPrice * user.quantity;

    const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
    const callbackUrl = `${frontendOrigin.replace(/\/$/, "")}/success`;

    const { authorizationUrl, reference: newReference } = await initializePayment({
      email: user.email,
      amount,
      metadata: { 
        name: user.name, 
        size: user.size, 
        location: user.location, 
        quantity: user.quantity, 
        phone: user.phone 
      },
      callbackUrl,
    });

    // Update existing user with new reference and link
    await userQueries.updatePendingUser(
      user.name,
      user.size,
      user.location,
      user.quantity,
      user.email,
      user.phone,
      authorizationUrl,
      newReference,
      new Date().toISOString()
    );

    return res.status(200).json({ paymentLink: authorizationUrl });
  } catch (error) {
    console.error("Refresh payment session error:", error);
    return res.status(500).json({ message: "failed to refresh payment link" });
  }
};

export const sendRecoveryEmail = async (req, res) => {
  const { reference } = req.params;

  if (!reference) {
    return res.status(400).json({ message: "reference is required" });
  }

  try {
    const user = await userQueries.findByReference(reference);
    if (!user) {
      return res.status(404).json({ message: "registration not found" });
    }

    if (user.paymentStatus === "paid") {
      return res.status(400).json({ message: "payment already completed", status: "paid" });
    }

    const frontendOrigin = process.env.FRONTEND_ORIGIN || "https://46-waitlist.vercel.app";
    const recoveryLink = `${frontendOrigin.replace(/\/$/, "")}/checkout/${reference}`;

    const html = `
    <div style="background-color:#f6f6f4;padding:40px 20px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#111111;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;background-color:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
        <tr>
          <td style="padding:40px 40px 20px;text-align:center;">
            <h1 style="margin:0;font-size:24px;font-weight:800;letter-spacing:-0.02em;text-transform:uppercase;">46 GOLD COAST</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:0 40px 40px;">
            <p style="font-size:16px;line-height:1.6;margin-bottom:24px;">Hello ${user.name},</p>
            <p style="font-size:16px;line-height:1.6;margin-bottom:32px;color:#374151;">We noticed you started a pre-order for the <strong>46 Gold Coast Jersey</strong> but didn't quite finish. We've reserved your spot, but slots are filling up fast (only 20 total).</p>
            
            <div style="background-color:#f9fafb;border-radius:12px;padding:24px;margin-bottom:32px;border:1px solid #f3f4f6;">
              <h3 style="margin:0 0 16px;font-size:12px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em;">Order Summary</h3>
              <p style="margin:0 0 8px;font-size:14px;font-weight:600;">46 Gold Coast Jersey</p>
              <p style="margin:0;font-size:13px;color:#6b7280;">Size: ${user.size} / Quantity: ${user.quantity}</p>
            </div>

            <div style="text-align:center;margin-bottom:32px;">
              <a href="${recoveryLink}" style="display:inline-block;background-color:#000000;color:#ffffff;padding:18px 32px;font-size:14px;font-weight:700;text-decoration:none;border-radius:8px;text-transform:uppercase;letter-spacing:0.1em;">Continue to Payment</a>
            </div>

            <p style="font-size:14px;line-height:1.6;color:#6b7280;text-align:center;margin:0;">Limited slots available. Secure yours before they're gone.</p>
          </td>
        </tr>
        <tr>
          <td style="background-color:#f9fafb;padding:24px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em;">&copy; 2026 46 GOLD COAST</p>
          </td>
        </tr>
      </table>
    </div>
    `;

    const success = await sendEmail({
      to: user.email,
      subject: "Finish your 46 Gold Coast Pre-order",
      text: `Hello ${user.name}, finish your 46 Gold Coast Jersey pre-order here: ${recoveryLink}`,
      html
    });

    if (success) {
      return res.status(200).json({ message: "recovery email sent successfully" });
    } else {
      return res.status(500).json({ message: "failed to send email" });
    }
  } catch (error) {
    console.error("Send recovery email error:", error);
    return res.status(500).json({ message: "failed to process recovery email" });
  }
};


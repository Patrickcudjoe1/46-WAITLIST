import { userQueries } from "../config/db.js";
import { initializePayment } from "../services/paystackService.js";
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
    if (existing) {
      return res.status(409).json({ message: "email already registered" });
    }

    const paidCount = await userQueries.countPaid();
    if (paidCount >= 20) {
      return res.status(403).json({ message: "Waitlist is completely full! All 20 slots have been claimed." });
    }

    // For a simple waitlist, use a small fixed amount (edit as needed).
    const amount = 1000; // 10.00 GHS in pesewas

    const { authorizationUrl, reference } = await initializePayment({
      email,
      amount,
      metadata: { name, size, location, quantity, phone },
    });

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


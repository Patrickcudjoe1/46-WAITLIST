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
    if (existing) {
      return res.status(409).json({ message: "email already registered" });
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

    console.log(">>> Attempting DB Insertion for User:", email);
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


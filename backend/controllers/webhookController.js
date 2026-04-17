import crypto from "node:crypto";
import { userQueries } from "../config/db.js";

const verifySignature = ({ rawBody, signature, secret }) => {
  const hash = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
  return hash === signature;
};

export const paystackWebhook = async (req, res) => {
  console.log(">>> Webhook Received - Headers:", JSON.stringify(req.headers, null, 2));

  const secret = process.env.PAYSTACK_WEBHOOK_SECRET;
  if (!secret) {
    console.error("!!! Error: Missing PAYSTACK_WEBHOOK_SECRET");
    return res.status(500).json({ message: "Missing PAYSTACK_WEBHOOK_SECRET" });
  }

  const signature = req.headers["x-paystack-signature"];
  if (!signature || typeof signature !== "string") {
    console.warn("!!! Warning: Missing webhook signature in headers");
    return res.status(401).json({ message: "Missing webhook signature" });
  }

  const rawBody = req.body; // Buffer from express.raw
  if (!Buffer.isBuffer(rawBody)) {
    console.error("!!! Error: Webhook body is not a Buffer. Check express.raw configuration.");
    return res.status(400).json({ message: "Invalid webhook body" });
  }

  if (!verifySignature({ rawBody, signature, secret })) {
    const hash = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
    console.error("!!! Error: Webhook verification failed.");
    console.error("--- Expected Signature:", signature);
    console.error("--- Generated Hash:", hash);
    return res.status(401).json({ message: "Webhook verification failed" });
  }

  console.log(">>> Webhook Signature Verified Successfully");

  let event;
  try {
    event = JSON.parse(rawBody.toString("utf8"));
    console.log(">>> Webhook Event:", event.event);
  } catch (err) {
    console.error("!!! Error: Failed to parse webhook JSON:", err.message);
    return res.status(400).json({ message: "Invalid JSON payload" });
  }

  if (event?.event !== "charge.success") {
    console.log("--- Ignoring event type:", event?.event);
    return res.status(200).json({ ok: true });
  }

  const reference = event?.data?.reference;
  if (!reference || typeof reference !== "string") {
    console.error("!!! Error: Missing payment reference in event data");
    return res.status(400).json({ message: "Missing payment reference" });
  }

  console.log(">>> Processing Payment Confirmation for Reference:", reference);

  try {
    const user = await userQueries.findByReference(reference);
    if (!user) {
      console.warn("!!! Warning: No user found in database for reference:", reference);
      return res.status(404).json({ message: "User not found for reference" });
    }

    console.log(">>> Updating Payment Status to 'paid' for user:", user.email);
    await userQueries.markPaid(reference);
    console.log(">>> Database Update Successful");
    
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("!!! Error: Database update failed:", error);
    const message = error instanceof Error ? error.message : "unknown error";
    return res.status(500).json({ message: "Database update failed", details: message });
  }
};


import crypto from "node:crypto";
import { userQueries } from "../config/db.js";

const verifySignature = ({ rawBody, signature, secret }) => {
  const hash = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
  return hash === signature;
};

export const paystackWebhook = (req, res) => {
  const secret = process.env.PAYSTACK_WEBHOOK_SECRET;
  if (!secret) {
    return res.status(500).json({ message: "Missing PAYSTACK_WEBHOOK_SECRET" });
  }

  const signature = req.headers["x-paystack-signature"];
  if (!signature || typeof signature !== "string") {
    return res.status(401).json({ message: "Missing webhook signature" });
  }

  const rawBody = req.body; // Buffer from express.raw
  if (!Buffer.isBuffer(rawBody)) {
    return res.status(400).json({ message: "Invalid webhook body" });
  }

  if (!verifySignature({ rawBody, signature, secret })) {
    return res.status(401).json({ message: "Webhook verification failed" });
  }

  let event;
  try {
    event = JSON.parse(rawBody.toString("utf8"));
  } catch {
    return res.status(400).json({ message: "Invalid JSON payload" });
  }

  if (event?.event !== "charge.success") {
    return res.status(200).json({ ok: true });
  }

  const reference = event?.data?.reference;
  if (!reference || typeof reference !== "string") {
    return res.status(400).json({ message: "Missing payment reference" });
  }

  try {
    const user = userQueries.findByReference.get(reference);
    if (!user) {
      return res.status(404).json({ message: "User not found for reference" });
    }

    userQueries.markPaid.run(reference);
    return res.status(200).json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    return res.status(500).json({ message: "Database update failed", details: message });
  }
};


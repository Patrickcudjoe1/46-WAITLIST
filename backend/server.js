import "dotenv/config";
import express from "express";
import cors from "cors";
import waitlistRoutes from "./routes/waitlistRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";

const app = express();

const port = Number(process.env.PORT || 4000);
const frontendOrigin = process.env.FRONTEND_ORIGIN;

app.use(
  cors({
    origin: frontendOrigin || true,
    methods: ["GET", "POST", "OPTIONS"],
  }),
);

// Health check
app.get("/health", (_req, res) => res.json({ ok: true }));

// Webhooks need the raw body for signature verification.
app.use("/api/paystack-webhook", express.raw({ type: "*/*" }));
app.use("/api", webhookRoutes);

// Regular JSON endpoints
app.use(express.json({ limit: "100kb" }));
app.use("/api", waitlistRoutes);

// Global error handler (last)
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  const message = err instanceof Error ? err.message : "unknown error";
  res.status(500).json({ message: "server error", details: message });
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${port}`);
});


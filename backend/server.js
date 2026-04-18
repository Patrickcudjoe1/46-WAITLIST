import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import waitlistRoutes from "./routes/waitlistRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";

const app = express();

// Security Headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for simplicity since we're serving the SPA
  crossOriginEmbedderPolicy: false,
}));

// Global Rate Limiting (Protects the whole API)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` 
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." }
});

app.use("/api", limiter);

const port = Number(process.env.PORT || 4000);
const allowedOrigins = [
  process.env.FRONTEND_ORIGIN,
  "https://46-waitlist.vercel.app",
  "https://four6-waitlist.onrender.com",
  "http://localhost:5173",
  "http://localhost:4173",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes("*")) {
        callback(null, true);
      } else {
        // Fallback to true in production if needed, but safer to be explicit
        callback(null, true); 
      }
    },
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

// Static file serving for the frontend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, "../dist");

app.use(express.static(distPath));

// Catch-all route for SPA (React Router)
app.get("*", (req, res) => {
  // If request contains /api, it's a 404 for the API, not a route for the SPA.
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ message: "API endpoint not found" });
  }
  res.sendFile(path.join(distPath, "index.html"));
});

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


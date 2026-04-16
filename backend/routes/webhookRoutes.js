import { Router } from "express";
import { paystackWebhook } from "../controllers/webhookController.js";

const router = Router();

router.post("/paystack-webhook", paystackWebhook);

export default router;


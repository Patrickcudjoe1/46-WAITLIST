import { Router } from "express";
import { registerWaitlist, getWaitlistEntry, verifyWaitlistPayment } from "../controllers/waitlistController.js";

const router = Router();

router.post("/waitlist", registerWaitlist);
router.get("/waitlist/:reference", getWaitlistEntry);
router.post("/waitlist/verify/:reference", verifyWaitlistPayment);

export default router;


import { Router } from "express";
import { registerWaitlist, getWaitlistEntry } from "../controllers/waitlistController.js";

const router = Router();

router.post("/waitlist", registerWaitlist);
router.get("/waitlist/:reference", getWaitlistEntry);

export default router;


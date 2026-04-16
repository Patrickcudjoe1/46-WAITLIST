import { Router } from "express";
import { registerWaitlist } from "../controllers/waitlistController.js";

const router = Router();

router.post("/waitlist", registerWaitlist);

export default router;


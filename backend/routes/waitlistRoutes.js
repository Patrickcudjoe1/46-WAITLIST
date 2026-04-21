import { Router } from "express";
import { 
  registerWaitlist, 
  getWaitlistEntry, 
  verifyWaitlistPayment, 
  getAllRegistrations, 
  refreshPaymentSession 
} from "../controllers/waitlistController.js";

const router = Router();

router.post("/waitlist", registerWaitlist);
router.get("/waitlist", getAllRegistrations);
router.get("/waitlist/:reference", getWaitlistEntry);
router.post("/waitlist/verify/:reference", verifyWaitlistPayment);
router.post("/waitlist/refresh/:reference", refreshPaymentSession);

export default router;


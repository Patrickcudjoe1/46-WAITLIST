import { Router } from "express";
import { 
  registerWaitlist, 
  getWaitlistEntry, 
  verifyWaitlistPayment, 
  getAllRegistrations, 
  refreshPaymentSession,
  sendRecoveryEmail,
  sendFollowUpEmail
} from "../controllers/waitlistController.js";

const router = Router();

router.post("/waitlist", registerWaitlist);
router.get("/waitlist", getAllRegistrations);
router.get("/waitlist/:reference", getWaitlistEntry);
router.post("/waitlist/verify/:reference", verifyWaitlistPayment);
router.post("/waitlist/refresh/:reference", refreshPaymentSession);
router.post("/waitlist/send-recovery/:reference", sendRecoveryEmail);
router.post("/waitlist/send-followup/:reference", sendFollowUpEmail);

export default router;


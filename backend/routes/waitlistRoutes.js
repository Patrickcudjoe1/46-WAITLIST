import { Router } from "express";
import { 
  registerWaitlist, 
  getWaitlistEntry, 
  verifyWaitlistPayment, 
  getAllRegistrations, 
  refreshPaymentSession,
  sendRecoveryEmail,
  sendFollowUpEmail,
  sendProductionUpdateBroadcast,
  sendSingleProductionUpdate
} from "../controllers/waitlistController.js";

const router = Router();

router.post("/waitlist", registerWaitlist);
router.get("/waitlist", getAllRegistrations);
router.get("/waitlist/:reference", getWaitlistEntry);
router.post("/waitlist/verify/:reference", verifyWaitlistPayment);
router.post("/waitlist/refresh/:reference", refreshPaymentSession);
router.post("/waitlist/send-recovery/:reference", sendRecoveryEmail);
router.post("/waitlist/send-followup/:reference", sendFollowUpEmail);
router.post("/waitlist/send-production-update/:reference", sendSingleProductionUpdate);
router.post("/waitlist/broadcast-production-update", sendProductionUpdateBroadcast);

export default router;


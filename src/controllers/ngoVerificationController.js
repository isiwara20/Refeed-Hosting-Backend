// Import all NGO verify-related service functions
import * as service from "../services/ngoVerificationService.js";
import * as notificationService from "../services/notificationService.js";

//submit ngo verification details
export const submitVerification = async (req, res) => {
  try {
    const result = await service.submitVerification(req.body);

    await notificationService
      .sendInAppNotificationToUsername({
        username: req.body?.ngoUsername,
        role: "NGO",
        eventType: "VERIFICATION_SUBMITTED",
        subject: "Verification submitted",
        message: "Your NGO verification was submitted and is now under review.",
        metadata: {
          verificationId: result?._id?.toString(),
          ngoUsername: req.body?.ngoUsername,
        },
      })
      .catch((err) => console.error("NGO verification submit notification failed:", err));

    res.status(201).json({
      message: "Verification submitted successfully",
      data: result,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

//get the verification status
export const getVerificationStatus = async (req, res) => {
  try {
    const { ngoUsername } = req.params;

    const statusData = await service.getVerificationStatusByUsername(ngoUsername);

    res.status(200).json(statusData);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

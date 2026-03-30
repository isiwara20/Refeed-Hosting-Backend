import { sendOTPViaWhatsApp, verifyOTP, clearOTP } from "../services/otpService.js";

// Send OTP
export const sendOTP = async (req, res) => {
  const { phone } = req.body;

  if (!phone) return res.status(400).json({ message: "Phone number is required" });

  const result = await sendOTPViaWhatsApp(phone);

  if (result.success) {
    res.status(200).json({ message: "OTP sent successfully", otp: result.otp });
  } else {
    res.status(500).json({ message: "Failed to send OTP", error: result.error });
  }
};

// Verify OTP
export const checkOTP = (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) return res.status(400).json({ message: "Phone and OTP are required" });

  const isValid = verifyOTP(phone, otp);

  if (isValid) {
    // clear OTP after verification
    clearOTP(phone);
    res.status(200).json({ message: "OTP verified successfully" });
  } else {
    res.status(400).json({ message: "Invalid OTP" });
  }
};

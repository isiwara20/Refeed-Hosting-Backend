import axios from "axios";

const otpStore = {}; // Temporary store

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
}

// Send OTP via WhatsApp
export const sendOTPViaWhatsApp = async (phone) => {
  if (phone.startsWith("0")) phone = "94" + phone.slice(1);
  if (!phone.startsWith("94")) phone = "94" + phone;
  phone = phone.replace("+", "");

  const otp = generateOTP();
  otpStore[phone] = otp;

/**
 * Sends a One-Time Password (OTP) message via WhatsApp using the Waclient API.
 *
 * This function builds a JSON payload with recipient details, message content, 
 * and authentication credentials (instance ID and access token). It sends the request 
 * to the Waclient API endpoint and handles both successful and failed responses.
 *
 * Features:
 * - Accepts a phone number, OTP, and message to be sent via WhatsApp.
 * - Constructs the payload required by the Waclient API.
 * - Sends an HTTP POST request with JSON headers.
 * - Returns the API response on success or error details on failure.
 *
 * Parameters:
 * @param {string} phone   - The recipient's mobile number (must include country code, e.g., "94771234567").
 * @param {string} otp     - The one-time password to send (e.g., "123456").
 * @param {string} message - The message body to send along with the OTP.
 *
 * @returns {Promise<Object>} Response object:
 *   - { success: true, otp, response } on success.
 *   - { success: false, error } on failure.
 *
 * References:
 * - Waclient API Documentation: https://waclient.com/docs/
 * - Axios HTTP Client: https://axios-http.com/docs/intro
 */



  const message = `ReFeed Verification\n\nYour OTP is: ${otp}\nValid for 5 minutes.\nDo not share this code.`;



  const payload = {
    number: phone,
    type: "text",
    message: message,
    instance_id: "69A054D116B0A",
    access_token: "69a053d9139ed",
  };

  try {
    const response = await axios.post("https://waclient.com/api/send", payload, {
      headers: { "Content-Type": "application/json" },
    });

    return { success: true, otp, response: response.data };
  } catch (err) {
    console.error("OTP send error:", err.message);
    return { success: false, error: err.message };
  }
};

// Verify OTP
export const verifyOTP = (phone, otp) => {
  if (phone.startsWith("0")) phone = "94" + phone.slice(1);
  if (!phone.startsWith("94")) phone = "94" + phone;
  phone = phone.replace("+", "");

  return otpStore[phone] === otp;
};

// Optional: clear OTP after use
export const clearOTP = (phone) => {
  if (phone.startsWith("0")) phone = "94" + phone.slice(1);
  if (!phone.startsWith("94")) phone = "94" + phone;
  phone = phone.replace("+", "");

  delete otpStore[phone];
};

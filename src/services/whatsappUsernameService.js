import axios from "axios";

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

export const sendUsernameViaWhatsApp = async (phone, username) => {
  if (phone.startsWith("0")) phone = "94" + phone.slice(1);
  if (!phone.startsWith("94")) phone = "94" + phone;
  phone = phone.replace("+", "");

  const message = `ReFeed Registration Successful 🎉

Your username is:
👉 ${username}

Please keep this for future logins.
Thank you for joining ReFeed 💚`;

  const payload = {
    number: phone,
    type: "text",
    message,
    instance_id: process.env.WA_INSTANCE_ID ,
    access_token: process.env.WA_ACCESS_TOKEN
  };

  try {
    await axios.post("https://waclient.com/api/send", payload, {
      headers: { "Content-Type": "application/json" },
      timeout: 10000
    });
  } catch (err) {
    console.error("Username WhatsApp send failed:", err.message);
  }
};

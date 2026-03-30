import express from "express";
import crypto from "crypto";

const router = express.Router();

const MERCHANT_ID = process.env.DP_MERCHANT_ID || "PI11698";
const SECRET_KEY  = process.env.DP_SECRET_KEY  || "e323367ed65ed033115ff27555a418fd4f0e534067c49e0a10b9949a871427a0";

router.post("/initiate", (req, res) => {
  const { fname, lname, email, phone, amount } = req.body;

  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  const order_id = "RF" + Date.now() + Math.floor(1000 + Math.random() * 9000);

  const payload = {
    merchant_id: MERCHANT_ID,
    amount: Number(amount).toFixed(2),
    type: "ONE_TIME",
    order_id,
    currency: "LKR",
    response_url: process.env.DP_RESPONSE_URL || "http://localhost:3000/payment-success",
    first_name: fname || "NGO",
    last_name:  lname || "User",
    email:      email || "ngo@refeed.lk",
    phone:      phone || "0700000000",
    logo: "",
  };

  const jsonPayload    = JSON.stringify(payload);
  const encodedPayload = Buffer.from(jsonPayload).toString("base64");

  const hmac = crypto.createHmac("sha256", SECRET_KEY);
  hmac.update(encodedPayload);
  const signature = hmac.digest("hex");

  res.json({ encodedPayload, signature, order_id });
});

export default router;

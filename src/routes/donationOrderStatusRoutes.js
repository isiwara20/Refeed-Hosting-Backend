// backend/src/routes/donationOrderRoutes.js
import express from "express";
import * as controller from "../controllers/donationOrderController.js";

const router = express.Router();

router.post("/", controller.createOrder);
router.get("/ngo/:ngoUsername", controller.getOrdersByNGO);
router.patch("/:id", controller.updateOrder);
router.delete("/:id", controller.cancelOrder);

//for the donator to check who has ordered
router.get("/ngo-details-ordered/:surplusDonationId",controller.getOrderByDonation);

export default router;

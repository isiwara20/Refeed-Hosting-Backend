// backend/src/services/donationOrderService.js
import * as repo from "../repositories/donationOrderStatusRepository.js";
import * as userPhoneRepo from "../repositories/orderConfrimPhoneRepository.js";
import SurplusDonation from "../models/SurplusDonation.model.js";
import NGOAddress from "../models/NgoAddress.js";
import { sendWhatsAppMessage } from "./orderReservationWhatsAppService.js";

export const createDonationOrder = async ({ ngoUsername, deliveryType, surplusDonationId, selectedAddressId }) => {
  // 1️ Fetch the donation
  const donation = await SurplusDonation.findById(surplusDonationId);
  if (!donation) throw new Error("Donation not found");

  // 2️ Get donor username from donation
  const donorUsername = donation.donorUsername;

  // 3️ If delivery, fetch selected address
  let deliveryAddress = "";
  if (deliveryType === "delivery") {
    const address = await NGOAddress.findById(selectedAddressId);
    if (!address) throw new Error("Address not found");
    deliveryAddress = `${address.addressLine}, ${address.city}, ${address.state || ""}, ${address.postalCode || ""}`;
  }

  // 4️ Create order
const orderData = {
    ngoUsername,
    deliveryType,
    surplusDonationId,
    donorUsername,

    foodType: donation.foodType,
    quantity: {
      amount: donation.quantity.amount,
      unit: donation.quantity.unit,
    },

    deliveryAddress,
  };
  

 const order = await repo.createOrder(orderData);

  // 6️ Update donation lifecycle status → RESERVED
  donation.lifecycleStatus = "RESERVED";
  await donation.save();



  //adding sending whatsapp reservation message for donator and NGO's

  const donorPhone = await userPhoneRepo.getDonorPhoneByUsername(donorUsername);
  const ngoPhone = await userPhoneRepo.getNgoPhoneByUsername(ngoUsername);

  const donorMessage = `Your donation "${donation.foodType}" has been reserved by NGO "${ngoUsername}". Please prepare for ${deliveryType === "delivery" ? "pickup/delivery" : "collection"} at ${deliveryAddress || "your location"}.`;
  const ngoMessage = `Hello ${ngoUsername}, you have reserved a donation "${donation.foodType}" from donor "${donorUsername}". ${deliveryType === "delivery" ? `Delivery will be at: ${deliveryAddress}` : "Please collect at donor location."}`;

  // Trigger WhatsApp messages asynchronously (non-blocking)
  sendWhatsAppMessage(donorPhone, donorMessage);
  sendWhatsAppMessage(ngoPhone, ngoMessage);




  return order;


};

export const getOrdersForNGO = async (ngoUsername) => {
  return await repo.getOrdersByNGO(ngoUsername);
};

export const updateOrderStatus = async (id, status) => {
  return await repo.updateOrder(id, { status });
};

export const cancelOrder = async (id) => {
  return await repo.deleteOrder(id);
};



export const getOrderDetailsForDonor = async (surplusDonationId) => {
  const order = await repo.getOrderBySurplusDonationId(surplusDonationId);

  if (!order) {
    throw new Error("Order not found for this donation");
  }

  return order;
};
import DonationOrderStatus from "../models/DonationOrderStatus.model.js";

//creating donation order
export const createOrder = async (orderData) => {
  const order = new DonationOrderStatus(orderData);
  return await order.save();
};

//get donation order by NGO username
export const getOrdersByNGO = async (ngoUsername) => {
  return await DonationOrderStatus.find({ ngoUsername, isDeleted: false });
};

//update donation order
export const updateOrder = async (id, updateData) => {
  return await DonationOrderStatus.findByIdAndUpdate(id, updateData, { new: true });
};

//delete donation order
export const deleteOrder = async (id) => {
  return await DonationOrderStatus.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
};


export const getOrderBySurplusDonationId = async (surplusDonationId) => {
  return await DonationOrderStatus.findOne({
    surplusDonationId,
    isDeleted: false,
  });
};


export const updateOrderBySurplusDonationId = async (surplusDonationId, updateData) => {
  return await DonationOrderStatus.findOneAndUpdate(
    { surplusDonationId, isDeleted: false },
    updateData,
    { new: true }
  );
};

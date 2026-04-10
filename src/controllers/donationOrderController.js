// Import all donationorder-related service functions
import * as service from "../services/donationOrderService.js";
import * as notificationService from "../services/notificationService.js";

//create an order
export const createOrder = async (req, res) => {
  try {
    const order = await service.createDonationOrder(req.body);

    await Promise.all([
      notificationService.sendInAppNotificationToUsername({
        username: order.donorUsername,
        role: "DONATOR",
        eventType: "DONATION_ORDER_CREATED",
        subject: "Donation reserved",
        message: `Your donation was reserved by NGO ${order.ngoUsername}.`,
        metadata: {
          orderId: order._id?.toString(),
          surplusDonationId: order.surplusDonationId?.toString()
        }
      }),
      notificationService.sendInAppNotificationToUsername({
        username: order.ngoUsername,
        role: "NGO",
        eventType: "DONATION_ORDER_CREATED",
        subject: "Reservation confirmed",
        message: `You reserved donation from donor ${order.donorUsername}.`,
        metadata: {
          orderId: order._id?.toString(),
          surplusDonationId: order.surplusDonationId?.toString()
        }
      })
    ]).catch((err) => console.error("Donation order created notification failed:", err));
    
    res.status(201).json({ message: "Donation order created", order });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

//get orders by ngo username
export const getOrdersByNGO = async (req, res) => {
  try {
    const orders = await service.getOrdersForNGO(req.params.ngoUsername);
    res.status(200).json(orders);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

//update an order
export const updateOrder = async (req, res) => {
  try {
    const updated = await service.updateOrderStatus(req.params.id, req.body.status);

    if (!updated) {
      return res.status(404).json({ error: "Donation order not found" });
    }

    await Promise.all([
      notificationService.sendInAppNotificationToUsername({
        username: updated.donorUsername,
        role: "DONATOR",
        eventType: "DONATION_ORDER_STATUS_CHANGED",
        subject: "Donation order updated",
        message: `Order status changed to ${updated.status}.`,
        metadata: { orderId: updated._id?.toString(), status: updated.status }
      }),
      notificationService.sendInAppNotificationToUsername({
        username: updated.ngoUsername,
        role: "NGO",
        eventType: "DONATION_ORDER_STATUS_CHANGED",
        subject: "Order status updated",
        message: `Order status is now ${updated.status}.`,
        metadata: { orderId: updated._id?.toString(), status: updated.status }
      })
    ]).catch((err) => console.error("Donation order status changed notification failed:", err));
    
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

//delete an order
export const cancelOrder = async (req, res) => {
  try {
    const cancelled = await service.cancelOrder(req.params.id);

    if (!cancelled) {
      return res.status(404).json({ error: "Donation order not found" });
    }

    await Promise.all([
      notificationService.sendInAppNotificationToUsername({
        username: cancelled.donorUsername,
        role: "DONATOR",
        eventType: "DONATION_ORDER_CANCELLED",
        subject: "Order cancelled",
        message: `Order for your donation was cancelled.`,
        metadata: { orderId: cancelled._id?.toString() }
      }),
      notificationService.sendInAppNotificationToUsername({
        username: cancelled.ngoUsername,
        role: "NGO",
        eventType: "DONATION_ORDER_CANCELLED",
        subject: "Reservation cancelled",
        message: `Your donation reservation was cancelled.`,
        metadata: { orderId: cancelled._id?.toString() }
      })
    ]).catch((err) => console.error("Donation order cancelled notification failed:", err));

    await notificationService.notifyAllAdminsInApp({
      eventType: "DONATION_ORDER_CANCELLED",
      subject: "Donation order cancelled",
      message: `Order ${cancelled._id?.toString() || "(unknown)"} between donor ${cancelled.donorUsername || "(unknown)"} and NGO ${cancelled.ngoUsername || "(unknown)"} was cancelled.`,
      metadata: {
        orderId: cancelled._id?.toString() || "",
        donorUsername: cancelled.donorUsername || "",
        ngoUsername: cancelled.ngoUsername || ""
      }
    }).catch((err) => console.error("Admin broadcast for order cancellation failed:", err));
    
    res.status(200).json(cancelled);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


export const getOrderByDonation = async (req, res, next) => {
  try {
    const { surplusDonationId } = req.params;

    const order = await service.getOrderDetailsForDonor(surplusDonationId);

    res.json(order);
  } catch (error) {
    next(error);
  }
};
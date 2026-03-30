
// Import all address-related service functions
import * as service from "../services/addressService.js";
import * as notificationService from "../services/notificationService.js";


//Create a new address
export const createAddress = async (req, res) => {
  try {
    const address = await service.createUserAddress(req.body);

    await notificationService
      .sendInAppNotificationToUsername({
        username: address?.username || req.body?.username,
        role: "NGO",
        eventType: "ADDRESS_CREATED",
        subject: "Address added",
        message: "Your address was added successfully.",
        metadata: {
          addressId: address?._id?.toString(),
          city: address?.city,
          country: address?.country,
        },
      })
      .catch((err) => console.error("Address create notification failed:", err));

    res.status(201).json({ message: "Address added", address });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


//update an existing address
export const updateAddress = async (req, res) => {
  try {
    const address = await service.updateUserAddress(req.params.id, req.body);

    await notificationService
      .sendInAppNotificationToUsername({
        username: address?.username || req.body?.username,
        role: "NGO",
        eventType: "ADDRESS_UPDATED",
        subject: "Address updated",
        message: "Your address details were updated.",
        metadata: {
          addressId: address?._id?.toString(),
          updatedFields: Object.keys(req.body || {}),
        },
      })
      .catch((err) => console.error("Address update notification failed:", err));

    res.status(200).json({ message: "Address updated", address });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//delete an existing address
export const deleteAddress = async (req, res) => {
  try {
    const address = await service.deleteUserAddress(req.params.id);

    await notificationService
      .sendInAppNotificationToUsername({
        username: address?.username,
        role: "NGO",
        eventType: "ADDRESS_DELETED",
        subject: "Address removed",
        message: "An address was removed from your account.",
        metadata: {
          addressId: address?._id?.toString(),
        },
      })
      .catch((err) => console.error("Address delete notification failed:", err));

    res.status(200).json({ message: "Address deleted", address });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//get all the addresses
export const getAllAddresses = async (req, res) => {
  try {
    const addresses = await service.fetchAllAddresses();
    res.status(200).json(addresses);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//get the address by using the username
export const getAddressesByUsername = async (req, res) => {
  try {
    const addresses = await service.fetchAddressesByUsername(req.params.username);
    res.status(200).json(addresses);
    
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

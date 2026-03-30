import axios from "axios";
import { SurplusRepository } from "../repositories/surplus.repository.js";
import { validateTransition } from "./stateMachine.service.js";
import { now } from "../utils/time.util.js";
import { DonorRepository } from "../repositories/donor.repository.js";


/**
 * SurplusService
 * SRP: enforce donation lifecycle rules
 */


async function sendWhatsApp(toNumber, message) {
  if (toNumber.startsWith("0")) toNumber = "94" + toNumber.slice(1);
  if (!toNumber.startsWith("94")) toNumber = "94" + toNumber;
  toNumber = toNumber.replace("+", "");

  const payload = {
    number: toNumber,
    type: "text",
    message,
    instance_id: process.env.WA_INSTANCE_ID,
    access_token: process.env.WA_ACCESS_TOKEN,
  };

  await axios.post("https://waclient.com/api/send", payload, {
    headers: { "Content-Type": "application/json" },
    timeout: 10000,
  });
}





export const SurplusService = {

//allow selfDelivery to be stored.
  async createDraft(username, data) {
  if (data.expiryTime < now()) throw new Error("Expiry must be future");
  return SurplusRepository.create({
    ...data,
    donorUsername: username,
    lifecycleStatus: "DRAFT",
    selfDelivery: data.selfDelivery || false, // new
  });
}
,

  // Publish donation (DRAFT -> PUBLISHED)
  async publish(donationId) {
    const donation = await SurplusRepository.findById(donationId);
    if (!donation) throw new Error("Donation not found");

    validateTransition(donation.lifecycleStatus, "PUBLISHED");
    donation.lifecycleStatus = "PUBLISHED";
    return donation.save();
  },



  // Reserve donation (PUBLISHED -> RESERVED) 
 
  async reserveDonation(donationId) {
    const donation = await SurplusRepository.findById(donationId);
    if (!donation) throw new Error("Donation not found");

    validateTransition(donation.lifecycleStatus, "RESERVED");
    donation.lifecycleStatus = "RESERVED";
    return donation.save();
  },

  

  async updateStatus(donationId, newStatus) {
    const donation = await SurplusRepository.findById(donationId);
    validateTransition(donation.lifecycleStatus, newStatus);
    donation.lifecycleStatus = newStatus;
    return donation.save();
  },

  async getMyDonations(username) {
    return SurplusRepository.findByDonor(username);
  },



// Donor confirms completion (COLLECTED -> COMPLETED) + WhatsApp
  async markComplete(donationId) {
    const donation = await SurplusRepository.findById(donationId);
    if (!donation) throw new Error("Donation not found");

    validateTransition(donation.lifecycleStatus, "COMPLETED");
    donation.lifecycleStatus = "COMPLETED";
    await donation.save();

    const donor = await DonorRepository.findByUsername(donation.donorUsername);
    const message = `Donation ${donation._id} completed successfully. Thank you!`;

    if (donor?.phone) {
      await sendWhatsApp(donor.phone, message);
    }

    return donation;
  },




 // NGO scans QR -> mark COLLECTED (RESERVED -> COLLECTED)
  async markCollected(donationId) {
    const donation = await SurplusRepository.findById(donationId);
    if (!donation) throw new Error("Donation not found");

    validateTransition(donation.lifecycleStatus, "COLLECTED");
    donation.lifecycleStatus = "COLLECTED";
    return donation.save();
  }


};





/*


This service layer enforces the full lifecycle logic for surplus donations.
It contains business rules, status transition validation, and notification handling,
while delegating database operations to the repository layer.

Data Flow:
Controller → SurplusService → (validateTransition + Business Rules)
→ SurplusRepository / DonorRepository → Database

Core Responsibilities:

1. createDraft(username, data):
   - Validates expiry time (must be future).
   - Initializes lifecycleStatus as "DRAFT".
   - Stores optional selfDelivery flag.
   - Saves donation via repository.

2. publish(donationId):
   - Validates DRAFT → PUBLISHED transition.
   - Updates lifecycleStatus accordingly.

3. reserveDonation(donationId):
   - Validates PUBLISHED → RESERVED transition.
   - Updates lifecycleStatus.

4. markCollected(donationId):
   - Validates RESERVED → COLLECTED transition.
   - Updates lifecycleStatus.

5. markComplete(donationId):
   - Validates COLLECTED → COMPLETED transition.
   - Updates lifecycleStatus.
   - Retrieves donor details.
   - Sends WhatsApp notification upon successful completion.

6. updateStatus(donationId, newStatus):
   - Generic status updater with transition validation.

7. getMyDonations(username):
   - Retrieves all active donations created by a donor.

Design Characteristics:
- Follows Single Responsibility Principle (SRP).
- Enforces lifecycle control using stateMachine.service.
- Separates business logic from database logic.
- Integrates external service (WhatsApp API) for notifications.
- Maintains controlled, validated state transitions to prevent invalid updates.

This layer is the core business logic engine for the donation lifecycle.
*/
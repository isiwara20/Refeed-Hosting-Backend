import { DonorRepository } from "../repositories/donor.repository.js";

/**
 * DonorService
 * SRP: enforce profile + verification rules
 */
export const DonorService = {
  async createProfile(username, data) {
    return DonorRepository.create({
      username,
      email: data.email,
      name: data.name,
      phone: data.phone,
      businessRegNumber: data.businessRegNumber,
      nicNumber: data.nicNumber,
    });
  },

  async getProfile(username) {
    return DonorRepository.findByUsername(username);
  },



 async deleteProfile(username) {
  const existing = await DonorRepository.findByUsername(username);
  if (!existing) throw new Error("Donor not found");

  return DonorRepository.softDelete(username);
},


async hardDeleteProfile(username) {
  const result = await DonorRepository.hardDelete(username);
  if (result.deletedCount === 0) throw new Error("Donor not found");
  return result;
},

  async updateProfile(username, data) {
    const allowedUpdates = {};
    if (data.businessRegNumber) allowedUpdates.businessRegNumber = data.businessRegNumber;
    if (data.nicNumber) allowedUpdates.nicNumber = data.nicNumber;
    if (data.profileImage) allowedUpdates.profileImage = data.profileImage;

    return DonorRepository.updateByUsername(username, allowedUpdates);
  },

  async approveVerification(username) {
    return DonorRepository.updateByUsername(username, { verificationStatus: "APPROVED" });
  },
};



/*


This layer handles business logic related to Donor profiles.
It enforces rules before interacting with the DonorRepository,
following the Service Layer pattern and Single Responsibility Principle (SRP).

Data Flow:
Controller → DonorService → DonorRepository → Database

Responsibilities:

1. createProfile(username, data):
   - Creates a new donor profile.
   - Extracts only required fields from incoming data.
   - Passes structured data to the repository for persistence.

2. getProfile(username):
   - Retrieves a donor profile using the username.
   - Delegates database retrieval to the repository.

3. updateProfile(username, data):
   - Allows updating only specific fields (businessRegNumber, nicNumber).
   - Filters input to prevent unauthorized field modification.
   - Sends controlled updates to the repository.

4. approveVerification(username):
   - Updates verificationStatus to "APPROVED".
   - Enforces verification state change through service logic.

This layer contains business rules and validation logic,
while database operations remain isolated in the repository layer,
maintaining proper separation of concerns in the architecture.
*/
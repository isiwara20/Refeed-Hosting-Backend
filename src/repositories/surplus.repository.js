import SurplusDonation from "../models/SurplusDonation.model.js";

export const SurplusRepository = {
  create: (data) => SurplusDonation.create(data),
  findById: (id) => SurplusDonation.findById(id),
  findByDonor: (username) =>
    SurplusDonation.find({ donorUsername: username, isDeleted: false }),
  update: (id, data) =>
    SurplusDonation.findByIdAndUpdate(id, data, { new: true }),
};

/*


This layer acts as the data access abstraction for the SurplusDonation model.
It provides simple CRUD operations (create, read, update) that interact directly with
the MongoDB collection using Mongoose.

Data Flow:
Controller → Service → SurplusRepository → SurplusDonation Model → MongoDB

Responsibilities:
- create(data): Inserts a new donation document into the database.
- findById(id): Retrieves a specific donation using its MongoDB _id.
- findByDonor(username): Retrieves all non-deleted donations for a given donor.
- update(id, data): Updates an existing donation and returns the updated document.

This layer does NOT contain business logic.
It only handles database communication, keeping the application structured
according to separation of concerns (Controller → Service → Repository → Model).
*/
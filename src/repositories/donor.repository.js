import DonorProfile from "../models/DonorProfile.js";

export const DonorRepository = {
  create: (data) => DonorProfile.create(data),
  findByUsername: (username) => DonorProfile.findOne({ username, isDeleted: false }),
  updateByUsername: (username, data) =>
    DonorProfile.findOneAndUpdate({ username }, { $set: data }, { new: true }),
  
softDelete: (username) =>
  DonorProfile.findOneAndUpdate(
    { username, isDeleted: false },
    { $set: { isDeleted: true } },
    { new: true }
  ),


  hardDelete: (username) => DonorProfile.deleteOne({ username }),

};


/*


This  layer handles all database operations related to the DonorProfile model.
It abstracts direct MongoDB interactions using Mongoose and provides clean methods
for creating, retrieving, updating, and soft-deleting donor profiles.

Data Flow:
Controller → Service → DonorRepository → DonorProfile Model → MongoDB

Responsibilities:
- create(data): Inserts a new donor profile document into the database.
- findByUsername(username): Retrieves an active (not soft-deleted) donor profile.
- updateByUsername(username, data): Updates donor profile fields and returns the updated document.
- softDelete(username): Marks a donor profile as deleted by setting isDeleted = true (soft delete).

This layer strictly manages data persistence and does not contain business logic,
maintaining separation of concerns within the application architecture.
*/
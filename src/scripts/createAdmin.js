import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import Admin from "../models/Admin.js";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env correctly (THIS WAS THE ISSUE)
dotenv.config({
  path: path.join(__dirname, "../config/.env")
});

// Debug check (keep this)
console.log("MONGO_URI =", process.env.MONGO_URI);

const createAdmin = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI not loaded");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected ");

    const hashedPassword = await bcrypt.hash("Admin123!", 10);

    const admin = await Admin.create({
      username: "admin001",
      password: hashedPassword,
      name: "System Admin",
      email: "admin@refeed.com",
      phone: "0770000000"
    });

    console.log("Admin created ");
    console.log({
      username: admin.username,
      role: admin.role
    });

    process.exit();
  } catch (err) {
    console.error("Admin creation failed ");
    console.error(err.message);
    process.exit(1);
  }
};

createAdmin();



/*


This script is a standalone setup utility used to manually create
an initial Admin user in the database.

Purpose:
Seed the system with a default administrator account.

Main Flow:

1. Environment Setup:
   - Loads environment variables from ../config/.env using dotenv.
   - Fixes __dirname for ES modules.
   - Verifies that MONGO_URI is properly loaded.

2. Database Connection:
   - Connects to MongoDB using mongoose.connect().
   - Stops execution if MONGO_URI is missing.

3. Password Security:
   - Hashes the plain-text password ("Admin123!") using bcrypt.
   - Salt rounds: 10 (standard secure practice).
   - Ensures password is stored securely in hashed form.

4. Admin Creation:
   - Inserts a new Admin document into MongoDB.
   - Stores username, hashed password, name, email, and phone.
   - Role is typically set by the Admin model (default value).

5. Process Handling:
   - On success → logs created admin details and exits.
   - On failure → logs error message and exits with code 1.

Data Flow:
Script → Environment Config → MongoDB Connection → Hash Password → Create Admin → Exit Process


This is not part of the Express routing system.
It is meant to be executed manually (e.g., node createAdmin.js)
to initialize the system with a default admin account.
*/
import bcrypt from "bcrypt";
import Ngo from "../models/Ngo.js";
import Donator from "../models/Donator.js";
import { generateUsername } from "./usernameService.js";
import { sendUsernameViaWhatsApp } from "./whatsappUsernameService.js";

export const registerUser = async (data) => {
  const { name, email, password, confirmPassword, phone, role } = data;

  if (password !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const username = generateUsername(name);

  const payload = {
    name,
    email,
    password: hashedPassword,
    phone,
    username
  };

  let user;

  if (role === "ngo") {
    user = await Ngo.create(payload);
  } else if (role === "donator") {
    user = await Donator.create(payload);
  } else {
    throw new Error("Invalid role selected");
  }

  // ✅ Send WhatsApp AFTER successful DB save
  sendUsernameViaWhatsApp(phone, username).catch(console.error);

  return user;
};

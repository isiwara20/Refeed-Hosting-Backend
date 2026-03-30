//Sewni

import Admin from "../models/Admin.js";
import Ngo from "../models/Ngo.js";
import Donator from "../models/Donator.js";

export const countAdmins = () => Admin.countDocuments();

export const countNgos = () => Ngo.countDocuments();

export const countDonators = () => Donator.countDocuments();

export const getRecentAdmins = () =>
  Admin.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select("username name createdAt");
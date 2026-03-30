import Admin from "../models/Admin.js";
import Donator from "../models/Donator.js";
import Ngo from "../models/Ngo.js";

const roleModelMap = {
  DONATOR: Donator,
  NGO: Ngo,
  ADMIN: Admin
};

export const normalizeRole = (role = "") => role.toUpperCase();

export const findUserByUsernameAndRole = async ({ username, role }) => {
  const normalizedRole = normalizeRole(role);
  const Model = roleModelMap[normalizedRole];

  if (!Model) {
    throw new Error("Unsupported role");
  }

  const user = await Model.findOne({ username });
  if (!user) {
    return null;
  }

  return {
    _id: user._id,
    username: user.username,
    role: normalizedRole,
    name: user.name || user.username,
    email: user.email || ""
  };
};

export const listAllCommunicationUsers = async ({ excludeUsername, excludeRole }) => {
  const [donators, ngos, admins] = await Promise.all([
    Donator.find({}, "username role name"),
    Ngo.find({}, "username role name"),
    Admin.find({}, "username role name")
  ]);

  const users = [...donators, ...ngos, ...admins].map((user) => ({
    _id: user._id,
    username: user.username,
    role: normalizeRole(user.role),
    name: user.name || user.username
  }));

  return users.filter(
    (user) =>
      !(user.username === excludeUsername && normalizeRole(user.role) === normalizeRole(excludeRole))
  );
};

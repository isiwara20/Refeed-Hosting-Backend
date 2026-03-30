import bcrypt from "bcrypt";
import Donator from "../models/Donator.js";
import Ngo from "../models/Ngo.js";
import Admin from "../models/Admin.js";

export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }

    let user = null;
    let role = null;

    // 1 Donator
    user = await Donator.findOne({ username });
    if (user) role = "DONATOR";

    // 2️ NGO
    if (!user) {
      user = await Ngo.findOne({ username });
      if (user) role = "NGO";
    }

    // 3️ Admin
    if (!user) {
      user = await Admin.findOne({ username });
      if (user) role = "ADMIN";
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // 4️ Role-based dashboard
    let dashboard = "";
    if (role === "DONATOR") dashboard = "/donator-dashboard";
    if (role === "NGO") dashboard = "/ngo-dashboard";
    if (role === "ADMIN") dashboard = "/admin-dashboard";

    return res.status(200).json({
      message: "Login successful",
      _id: user._id,
      name: user.name || "",
      email: user.email || "",
      username: user.username,
      role,
      dashboard
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

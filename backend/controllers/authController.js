import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import admin, { firebaseEnabled } from "../config/firebaseAdmin.js";

// REGISTER
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// FIREBASE LOGIN (Google / Phone)
export const loginWithFirebase = async (req, res) => {
  try {
    if (!firebaseEnabled) {
      return res.status(500).json({ message: "Firebase auth not configured" });
    }

    const { idToken } = req.body || {};
    if (!idToken) {
      return res.status(400).json({ message: "idToken is required" });
    }

    const decoded = await admin.auth().verifyIdToken(idToken);
    const email =
      decoded.email || `phone_${decoded.uid}@phone.local`;
    const name =
      decoded.name || decoded.phone_number || "Firebase User";

    let user = await User.findOne({ email });

    if (!user) {
      const randomPassword = await bcrypt.hash(
        `${decoded.uid}_${Date.now()}`,
        10
      );
      user = await User.create({
        name,
        email,
        phone: decoded.phone_number,
        password: randomPassword
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(401).json({
      message: error?.message || "Firebase login failed"
    });
  }
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d"
  });
};

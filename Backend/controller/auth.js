import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import jwt from "jsonwebtoken";

const router = express.Router();

/* REGISTER */
export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword, phone, role } = req.body;

    // 🔴 VALIDATIONS (Keep your existing checks...)
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // 🔐 HASH PASSWORD
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 💾 SAVE USER
    const newUser = new User({
      firstName,
      lastName,
      email,
      phone, 
      password: hashedPassword,
      // 🔥 SECURITY LOGIC: 
      // Force 'user' role for public registrations. 
      // Do NOT take the role from req.body directly.
      role: "user" 
    });

    await newUser.save();

    return res.status(201).json({
      message: "Registration successful",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 🔴 SECURITY CHECK: Prevent banned users from logging in
    if (user.isBanned) {
      return res.status(403).json({ message: "Your account has been suspended by an admin." });
    }

    // 🔐 Generate JWT (Include the ROLE in the payload)
    const token = jwt.sign(
      { id: user._id, role: user.role }, // 🔥 Adding role here makes 'isAdmin' middleware work
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role, // 🔥 Send role to frontend for redirection
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

router.get(
  "/admin-only",
  authMiddleware,
  roleMiddleware("ADMIN"),
  (req, res) => {
    res.status(200).json({
      message: "Welcome Admin",
    });
  }
);

router.get(
  "/users",
  authMiddleware,
  roleMiddleware("ADMIN"),
  async (req, res) => {
    try {
      const users = await User.find({}, "_id name email role");
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
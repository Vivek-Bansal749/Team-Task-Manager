import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/me", authMiddleware, (req, res) => {
  res.status(200).json({
    message: "Protected route accessed",
    user: req.user,
  });
});

export default router;
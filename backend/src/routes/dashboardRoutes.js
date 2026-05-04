import express from "express";
import Task from "../models/task.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();
router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    let filter = {};

    // Member sees only own tasks
    if (req.user.role === "MEMBER") {
      filter.assignedTo = req.user.id;
    }

    const totalTasks = await Task.countDocuments(filter);

    const completedTasks = await Task.countDocuments({
      ...filter,
      status: "DONE",
    });

    const pendingTasks = await Task.countDocuments({
      ...filter,
      status: { $ne: "DONE" },
    });

    const overdueTasks = await Task.countDocuments({
      ...filter,
      dueDate: { $lt: new Date() },
      status: { $ne: "DONE" },
    });

    const completionRate =
      totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    res.status(200).json({
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      completionRate,
    });
  } catch (error) {
    res.status(500).json({ message:error.message });
  }
});

export default router;
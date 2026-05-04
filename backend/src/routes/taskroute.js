import express from "express";
import Task from "../models/task.js";
import Project from "../models/Project.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.post(
  "/tasks",
  authMiddleware,
  roleMiddleware("ADMIN"),
  async (req, res) => {
    try {
      const {
        title,
        description,
        priority,
        dueDate,
        project,
        assignedTo,
      } = req.body;

      if (!title || !project || !assignedTo) {
        return res.status(400).json({
          message: "Title, project and assigned user are required",
        });
      }

      // check project exists
      const existingProject = await Project.findById(project);

      if (!existingProject) {
        return res.status(404).json({ message: "Project not found" });
      }

      // create task
      const task = await Task.create({
        title,
        description,
        priority,
        dueDate,
        project,
        assignedTo,
        createdBy: req.user.id,
      });

      res.status(201).json({
        message: "Task created successfully",
        task,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);


router.get("/tasks", authMiddleware, async (req, res) => {
  try {
    let tasks;

    // Admin sees all tasks
    if (req.user.role === "ADMIN") {
      tasks = await Task.find()
        .populate("project", "name status priority")
        .populate("assignedTo", "name email role")
        .populate("createdBy", "name email");
    }

    // Member sees only assigned tasks
    else {
      tasks = await Task.find({
        assignedTo: req.user.id,
      })
        .populate("project", "name status priority")
        .populate("assignedTo", "name email role")
        .populate("createdBy", "name email");
    }

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


// upating task status
router.patch("/tasks/:taskId", authMiddleware, async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // MEMBER can update only own task status
    if (req.user.role === "MEMBER") {
      if (task.assignedTo.toString() !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      task.status = req.body.status || task.status;

      if (req.body.status === "DONE") {
        task.completedAt = new Date();
      }

      await task.save();

      return res.status(200).json({
        message: "Task status updated successfully",
        task,
      });
    }

    // ADMIN can update any task field
    Object.assign(task, req.body);

    if (req.body.status === "DONE") {
      task.completedAt = new Date();
    }

    await task.save();

    res.status(200).json({
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
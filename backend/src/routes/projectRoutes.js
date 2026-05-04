import express from "express";
import Project from "../models/Project.js";
import Task from "../models/task.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.post(
  "/projects",
  authMiddleware,
  roleMiddleware("ADMIN"),
  async (req, res) => {
    try {
      const {
        name,
        description,
        status,
        priority,
        startDate,
        endDate,
      } = req.body;

      if (!name) {
        return res.status(400).json({ message: "Project name is required" });
      }

      const project = await Project.create({
        name,
        description,
        status,
        priority,
        startDate,
        endDate,
        owner: req.user.id,
        members: [req.user.id],
      });

      res.status(201).json({
        message: "Project created successfully",
        project,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.get("/projects", authMiddleware, async (req, res) => {
  try {
    let projects;

    // Admin sees all projects
    if (req.user.role === "ADMIN") {
      projects = await Project.find()
        .populate("owner", "name email role")
        .populate("members", "name email role");
    } 
    
    // Member sees only assigned projects
    else {
      projects = await Project.find({
        members: req.user.id,
      })
        .populate("owner", "name email role")
        .populate("members", "name email role");
    }

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});



router.post(
  "/projects/:projectId/members",
  authMiddleware,
  roleMiddleware("ADMIN"),
  async (req, res) => {
    try {
      const { projectId } = req.params;
      const { userId } = req.body;

      // validate input
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      // find project
      const project = await Project.findById(projectId);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // prevent duplicate member
      if (project.members.includes(userId)) {
        return res.status(400).json({ message: "Member already added" });
      }

      // add member
      project.members.push(userId);
      await project.save();

      res.status(200).json({
        message: "Member added successfully",
        project,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.delete(
  "/projects/:projectId/members/:userId",
  authMiddleware,
  roleMiddleware("ADMIN"),
  async (req, res) => {
    try {
      const { projectId, userId } = req.params;

      const project = await Project.findById(projectId);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      if (project.owner.toString() === userId) {
        return res.status(400).json({ message: "Cannot remove project owner" });
      }

      if (!project.members.includes(userId)) {
        return res.status(400).json({ message: "Member not part of this project" });
      }

      project.members = project.members.filter(
        (memberId) => memberId.toString() !== userId
      );

      await project.save();

      res.status(200).json({
        message: "Member removed successfully",
        project,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.delete(
  "/projects/:projectId",
  authMiddleware,
  roleMiddleware("ADMIN"),
  async (req, res) => {
    try {
      const { projectId } = req.params;
      const project = await Project.findById(projectId);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      await Task.deleteMany({ project: projectId });
      await project.deleteOne();

      res.status(200).json({ message: "Project deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/authContext";
import "../styles/tasks.css";

const Tasks = () => {
  const { token, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [assigneeSelection, setAssigneeSelection] = useState({});
  const [isCreating, setIsCreating] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    dueDate: "",
    project: "",
    assignedTo: "",
  });

  const fetchTasks = async () => {
    try {
      const res = await api.get("/auth/tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTasks(res.data);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    }
  };

  const fetchUsers = async () => {
    if (user?.role !== "ADMIN") return;

    try {
      const res = await api.get("/auth/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(res.data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };

  const fetchProjects = async () => {
    if (user?.role !== "ADMIN") return;

    try {
      const res = await api.get("/auth/projects", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProjects(res.data);
    } catch (error) {
      console.error("Failed to fetch projects for tasks", error);
    }
  };

  const handleTaskInput = (e) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({ ...prev, [name]: value }));
  };

  const createTask = async (e) => {
    e.preventDefault();

    try {
      await api.post(
        "/auth/tasks",
        {
          title: newTask.title,
          description: newTask.description,
          priority: newTask.priority,
          dueDate: newTask.dueDate || undefined,
          project: newTask.project,
          assignedTo: newTask.assignedTo,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNewTask({
        title: "",
        description: "",
        priority: "MEDIUM",
        dueDate: "",
        project: "",
        assignedTo: "",
      });
      setIsCreating(false);
      fetchTasks();
    } catch (error) {
      console.error("Failed to create task", error);
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      await api.patch(
        `/auth/tasks/${taskId}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchTasks();
    } catch (error) {
      console.error("Failed to update task", error);
    }
  };

  const updateTaskAssignee = async (taskId, assignedTo) => {
    try {
      await api.patch(
        `/auth/tasks/${taskId}`,
        { assignedTo },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchTasks();
    } catch (error) {
      console.error("Failed to update assignee", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTasks();
      fetchUsers();
      fetchProjects();
    }
  }, [token]);

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <h1 className="tasks-title">Tasks</h1>
        {user?.role === "ADMIN" && (
          <button
            type="button"
            className="task-button"
            onClick={() => setIsCreating((prev) => !prev)}
          >
            {isCreating ? "Cancel" : "Create Task"}
          </button>
        )}
      </div>

      {isCreating && (
        <form className="task-form" onSubmit={createTask}>
          <div className="task-form-row">
            <input
              name="title"
              value={newTask.title}
              onChange={handleTaskInput}
              placeholder="Task title"
              className="task-input"
              required
            />
            <select
              name="priority"
              value={newTask.priority}
              onChange={handleTaskInput}
              className="task-select"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          <textarea
            name="description"
            value={newTask.description}
            onChange={handleTaskInput}
            placeholder="Description"
            className="task-textarea"
          />

          <div className="task-form-row">
            <select
              name="project"
              value={newTask.project}
              onChange={handleTaskInput}
              className="task-select"
              required
            >
              <option value="">Select project</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
            <select
              name="assignedTo"
              value={newTask.assignedTo}
              onChange={handleTaskInput}
              className="task-select"
              required
            >
              <option value="">Assign to member</option>
              {users.map((availableUser) => (
                <option key={availableUser._id} value={availableUser._id}>
                  {availableUser.name}
                </option>
              ))}
            </select>
          </div>

          <div className="task-form-row">
            <input
              type="date"
              name="dueDate"
              value={newTask.dueDate}
              onChange={handleTaskInput}
              className="task-input"
            />
          </div>

          <button type="submit" className="task-button task-submit">
            Save Task
          </button>
        </form>
      )}

      <div className="task-grid">
        {tasks.map((task) => (
          <div key={task._id} className="task-card">
            <h3>{task.title}</h3>
            <p>{task.description}</p>

            <div className="task-meta">Status: {task.status}</div>
            <div className="task-meta">Priority: {task.priority}</div>
            <div className="task-meta">
              Project: {task.project?.name || "N/A"}
            </div>
            <div className="task-meta">
              Assigned To: {task.assignedTo?.name || "N/A"}
            </div>

            {user?.role === "MEMBER" && (
              <select
                value={task.status}
                className="task-select"
                onChange={(e) => updateTaskStatus(task._id, e.target.value)}
              >
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="DONE">DONE</option>
              </select>
            )}

            {user?.role === "ADMIN" && (
              <div className="task-admin-actions">
                <select
                  value={assigneeSelection[task._id] || task.assignedTo?._id || ""}
                  className="task-select"
                  onChange={(e) => {
                    const assignedTo = e.target.value;
                    setAssigneeSelection((prev) => ({
                      ...prev,
                      [task._id]: assignedTo,
                    }));
                    if (assignedTo) {
                      updateTaskAssignee(task._id, assignedTo);
                    }
                  }}
                >
                  <option value="">Assign to member...</option>
                  {users.map((availableUser) => (
                    <option key={availableUser._id} value={availableUser._id}>
                      {availableUser.name} ({availableUser.role})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tasks;
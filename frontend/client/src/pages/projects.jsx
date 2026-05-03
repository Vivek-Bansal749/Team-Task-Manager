import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/authContext";
import "../styles/project.css";

const Projects = () => {
  const { token, user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [memberSelection, setMemberSelection] = useState({});
  const [isCreating, setIsCreating] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    status: "PLANNED",
    priority: "MEDIUM",
    startDate: "",
    endDate: "",
  });

  const fetchProjects = async () => {
    try {
      const res = await api.get("/auth/projects", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProjects(res.data);
    } catch (error) {
      console.error("Failed to fetch projects", error);
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

  const handleProjectInput = (e) => {
    const { name, value } = e.target;
    setNewProject((prev) => ({ ...prev, [name]: value }));
  };

  const createProject = async (e) => {
    e.preventDefault();

    try {
      await api.post(
        "/auth/projects",
        {
          name: newProject.name,
          description: newProject.description,
          status: newProject.status,
          priority: newProject.priority,
          startDate: newProject.startDate || undefined,
          endDate: newProject.endDate || undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNewProject({
        name: "",
        description: "",
        status: "PLANNED",
        priority: "MEDIUM",
        startDate: "",
        endDate: "",
      });
      setIsCreating(false);
      fetchProjects();
    } catch (error) {
      console.error("Failed to create project", error);
    }
  };

  const addProjectMember = async (projectId) => {
    const userId = memberSelection[projectId];
    if (!userId) return;

    try {
      await api.post(
        `/auth/projects/${projectId}/members`,
        { userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMemberSelection((prev) => ({ ...prev, [projectId]: "" }));
      fetchProjects();
    } catch (error) {
      console.error("Failed to add project member", error);
    }
  };

  const removeProjectMember = async (projectId, memberId) => {
    try {
      await api.delete(`/auth/projects/${projectId}/members/${memberId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchProjects();
    } catch (error) {
      console.error("Failed to remove project member", error);
    }
  };

  const deleteProject = async (projectId) => {
    try {
      await api.delete(`/auth/projects/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchProjects();
    } catch (error) {
      console.error("Failed to delete project", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProjects();
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [token, user?.role]);

  return (
    <div className="projects-page">
      <div className="projects-header">
        <h1 className="projects-title">Projects</h1>
        {user?.role === "ADMIN" && (
          <button
            type="button"
            className="project-button"
            onClick={() => setIsCreating((prev) => !prev)}
          >
            {isCreating ? "Cancel" : "Create Project"}
          </button>
        )}
      </div>

      {isCreating && (
        <form className="project-form" onSubmit={createProject}>
          <div className="project-form-row">
            <input
              name="name"
              value={newProject.name}
              onChange={handleProjectInput}
              placeholder="Project name"
              className="project-input"
              required
            />
            <select
              name="status"
              value={newProject.status}
              onChange={handleProjectInput}
              className="project-select"
            >
              <option value="PLANNED">Planned</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
            </select>
            <select
              name="priority"
              value={newProject.priority}
              onChange={handleProjectInput}
              className="project-select"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          <textarea
            name="description"
            value={newProject.description}
            onChange={handleProjectInput}
            placeholder="Description"
            className="project-textarea"
          />

          <div className="project-form-row">
            <input
              type="date"
              name="startDate"
              value={newProject.startDate}
              onChange={handleProjectInput}
              className="project-input"
            />
            <input
              type="date"
              name="endDate"
              value={newProject.endDate}
              onChange={handleProjectInput}
              className="project-input"
            />
          </div>

          <button type="submit" className="project-button project-submit">
            Save Project
          </button>
        </form>
      )}

      {projects.length === 0 ? (
        <p>No projects found.</p>
      ) : (
        <div className="project-grid">
          {projects.map((project) => {
            const availableUsers = users.filter(
              (u) =>
                u._id !== project.owner?._id &&
                !project.members?.some((member) => member._id === u._id)
            );

            return (
              <div key={project._id} className="project-card">
                <h3>{project.name}</h3>
                <p>{project.description}</p>

                <div className="project-meta">Status: {project.status}</div>
                <div className="project-meta">Priority: {project.priority}</div>
                <div className="project-meta">
                  Owner: {project.owner?.name || "N/A"}
                </div>
                <div className="project-meta">
                  Members: {project.members?.length || 0}
                </div>

                <div className="project-members">
                  {project.members?.map((member) => (
                    <div key={member._id} className="project-member">
                      <span>{member.name}</span>
                      {user?.role === "ADMIN" &&
                        member._id !== project.owner?._id && (
                          <button
                            type="button"
                            className="project-action"
                            onClick={() =>
                              removeProjectMember(project._id, member._id)
                            }
                          >
                            Remove
                          </button>
                        )}
                    </div>
                  ))}
                </div>

                {user?.role === "ADMIN" && (
                  <div className="project-actions">
                    <select
                      value={memberSelection[project._id] || ""}
                      onChange={(e) =>
                        setMemberSelection((prev) => ({
                          ...prev,
                          [project._id]: e.target.value,
                        }))
                      }
                      className="project-select"
                    >
                      <option value="">Add member...</option>
                      {availableUsers.map((availableUser) => (
                        <option key={availableUser._id} value={availableUser._id}>
                          {availableUser.name} ({availableUser.role})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="project-action"
                      onClick={() => addProjectMember(project._id)}
                      disabled={!memberSelection[project._id]}
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      className="project-action project-delete"
                      onClick={() => deleteProject(project._id)}
                    >
                      Delete Project
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Projects;
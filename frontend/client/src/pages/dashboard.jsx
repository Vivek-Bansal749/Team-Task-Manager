import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/authContext";
import "../styles/dashboard.css";

const Dashboard = () => {
  const { token, user } = useAuth();

  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    completionRate: 0,
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/auth/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setStats(res.data);
      } catch (error) {
        console.error("Failed to fetch dashboard", error);
      }
    };

    fetchDashboard();
  }, [token]);

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-title">Welcome, {user?.name}</h1>
      <p className="dashboard-subtitle">
        {user?.role === "ADMIN"
          ? "Here is your overall team task summary."
          : "Here is your task summary."}
      </p>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Total Tasks</h3>
          <p>{stats.totalTasks}</p>
        </div>

        <div className="dashboard-card">
          <h3>Completed</h3>
          <p>{stats.completedTasks}</p>
        </div>

        <div className="dashboard-card">
          <h3>Pending</h3>
          <p>{stats.pendingTasks}</p>
        </div>

        <div className="dashboard-card">
          <h3>Overdue</h3>
          <p>{stats.overdueTasks}</p>
        </div>

        <div className="dashboard-card">
          <h3>Completion %</h3>
          <p>{stats.completionRate}%</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
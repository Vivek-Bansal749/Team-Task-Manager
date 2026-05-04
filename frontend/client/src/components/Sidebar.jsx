import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import "../styles/sidebar.css";

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="sidebar">
      <Link to="/">Dashboard</Link>
      <Link to="/projects">Projects</Link>
      <Link to="/tasks">Tasks</Link>
      <button type="button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
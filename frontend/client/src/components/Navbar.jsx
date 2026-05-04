import { useAuth } from "../context/authContext";
import "./../styles/navbar.css";

const Navbar = () => {
  const { user } = useAuth();

  return (
    <div className="navbar">
      <h2 className="navbar-title">Team Task Manager</h2>
      {user ? (
        <div className="navbar-user-wrap">
          <p className="navbar-user">{user.name}</p>
          <span className={`navbar-role role-${user.role?.toLowerCase()}`}>
            {user.role}
          </span>
        </div>
      ) : null}
    </div>
  );
};

export default Navbar;
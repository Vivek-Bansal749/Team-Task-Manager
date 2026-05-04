import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import "../styles/layout.css";

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Sidebar />
      <div className="layout-main">
        <Navbar />
        <div className="layout-content">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
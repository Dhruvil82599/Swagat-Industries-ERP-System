import "./Header.css";
import logo from "../../assets/Swagat Industries.png";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmLogout = window.confirm(
      "Are you sure you want to logout?"
    );

    if (confirmLogout) {
      navigate("/");
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <img src={logo} alt="Swagat Industries" className="header-logo" />

        <div className="header-branding">
          <div className="brand-text">
            <h1>Swagat Industries</h1>
            <p>Shutter Management System</p>
          </div>
          <span className="brand-chip">Admin Panel</span>
        </div>
      </div>

      <div className="header-center">
        <div className="header-status">
          <span>Welcome back, admin</span>
          <p>Monitor customers, manage shutters, and stay on top of daily tasks.</p>
        </div>
      </div>

      <div className="header-right">
        <div className="user-card">
          <span className="user-avatar">S</span>
          <div className="user-details">
            <strong>Super Admin</strong>
            <small>Management</small>
          </div>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;

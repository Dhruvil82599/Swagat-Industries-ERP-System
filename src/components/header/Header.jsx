import "./Header.css";
import logo from "../../assets/Swagat Industries.png";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
  console.log("Logout clicked");

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
        <img
          src={logo}
          alt="Swagat Industries"
          className="header-logo"
        />

        <div className="header-title">
          <h2>Swagat Industries</h2>
          <span>Shutter Management System</span>
        </div>
      </div>

      <div className="header-center">
        <h4>Admin Panel</h4>
      </div>

      <div className="header-right">
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
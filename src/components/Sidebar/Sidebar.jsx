import "./Sidebar.css";
import { NavLink } from "react-router-dom";
import { useState, useContext } from "react";
import { FaTimes, FaBars } from "react-icons/fa";
import { SidebarContext } from "../Context API/SidebarContext";

const Sidebar = () => {
  const [customerMenu, setCustomerMenu] = useState(false);
  const { sidebarOpen, toggleSidebar, closeSidebar } = useContext(SidebarContext);

  return (
    <>
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {sidebarOpen ? <FaTimes /> : <FaBars />}
      </button>

      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h3>Navigation</h3>
          <button className="close-btn" onClick={closeSidebar}>
            <FaTimes />
          </button>
        </div>

        <nav className="sidebar-menu">
          <li>
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) => (isActive ? "menu-link active" : "menu-link")}
              onClick={closeSidebar}
            >
              <span>Dashboard</span>
            </NavLink>
          </li>

          <li>
            <div
              className="menu-parent"
              onClick={() => setCustomerMenu(!customerMenu)}
            >
              <span>Manage Customers</span>
              <span className={`arrow ${customerMenu ? "rotate" : ""}`}>›</span>
            </div>

            <ul className={`submenu ${customerMenu ? "open" : ""}`}>
              <li>
                <NavLink
                  to="/admin/addcustomers"
                  className={({ isActive }) =>
                    isActive ? "submenu-link active" : "submenu-link"
                  }
                  onClick={closeSidebar}
                >
                  Add Customer
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/admin/listcustomers"
                  className={({ isActive }) =>
                    isActive ? "submenu-link active" : "submenu-link"
                  }
                  onClick={closeSidebar}
                >
                  List of Customers
                </NavLink>
              </li>
            </ul>
          </li>

          <li>
            <NavLink
              to="/admin/reports"
              className={({ isActive }) => (isActive ? "menu-link active" : "menu-link")}
              onClick={closeSidebar}
            >
              <span>List of Quotations</span>
            </NavLink>
          </li>
        </nav>
      </div>

      {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar} />}
    </>
  );
};

export default Sidebar;

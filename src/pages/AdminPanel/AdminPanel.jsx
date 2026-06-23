import Header from "../../components/header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import { Outlet } from "react-router-dom";
import { useContext } from "react";
import { SidebarContext } from "../../components/Context API/SidebarContext";
import "./Adminpanel.css";

const AdminPanel = () => {
  const { sidebarOpen } = useContext(SidebarContext);

  return (
    <>
      <Header />

      <div className={`admin-layout ${sidebarOpen ? "sidebar-open" : ""}`}>
        <Sidebar />

        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default AdminPanel;

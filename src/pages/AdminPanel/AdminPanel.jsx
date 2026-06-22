import Header from "../../components/header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import { Outlet } from "react-router-dom";

const AdminPanel = () => {
  return (
    <>
      <Header />

      <div style={{ display: "flex" }}>
        <Sidebar />

        {/* White Content Area */}
        <div
          style={{
            flex: 1,
            background: "#fff",
            minHeight: "calc(100vh - 70px)",
            padding: "20px",
          }}
        >
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default AdminPanel;
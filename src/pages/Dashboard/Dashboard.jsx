import { useNavigate } from "react-router-dom";
import { FaUsers, FaDoorOpen, FaCheckCircle, FaClock } from "react-icons/fa";
import { useCustomer } from "../../components/Context API/CustomerContext";

import "./Dashboard.css";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { customerData } = useCustomer();


  const stats = [
    {
      title: "Total Customers",
      value: customerData.length,
      icon: <FaUsers />,
      className: "employees",
      path: "/admin/listcustomers",
    },
    {
      title: "Total Shutters",
      value: 350,
      icon: <FaDoorOpen />,
      className: "shutters",
      path: "/admin/shutters",
    },
    {
      title: "Paid Quotations",
      value: 78,
      icon: <FaCheckCircle />,
      className: "paid",
      path: "/admin/paid-quotations",
    },
    {
      title: "Pending Quotations",
      value: 22,
      icon: <FaClock />,
      className: "pending",
      path: "/admin/pending-quotations",
    },
  ];

  return (
    <div className="stats-grid">
      {stats.map((item, index) => (
        <div
          key={index}
          className={`stat-card ${item.className}`}
          onClick={() => navigate(item.path)}
        >
          <div className="icon-box">{item.icon}</div>

          <div className="card-content">
            <h2>{item.value}</h2>
            <p>{item.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;

import { useNavigate } from "react-router-dom";
import { FaUsers, FaDoorOpen, FaCheckCircle, FaClock } from "react-icons/fa";
import { useCustomer } from "../../components/Context API/CustomerContext";

import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const { customerData } = useCustomer();

  const stats = [
    {
      title: "Total Customers",
      value: customerData.length,
      icon: <FaUsers />,
      className: "customers",
      path: "/admin/listcustomers",
      description: "Active accounts registered in the system.",
    },
    {
      title: "Total Shutters",
      value: 350,
      icon: <FaDoorOpen />,
      className: "shutters",
      path: "/admin/shutters",
      description: "Shutters ready for installation and service.",
    },
    {
      title: "Paid Quotations",
      value: 78,
      icon: <FaCheckCircle />,
      className: "paid",
      path: "/admin/paid-quotations",
      description: "Confirmed customer orders and completed payments.",
    },
    {
      title: "Pending Quotations",
      value: 22,
      icon: <FaClock />,
      className: "pending",
      path: "/admin/pending-quotations",
      description: "Quotes awaiting approval or customer response.",
    },
  ];

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Performance overview</h1>
          <p className="hero-copy">
            Keep track of customers, shutters, and quotation status from one
            polished workspace.
          </p>
        </div>

        <div className="hero-actions">
          <button className="hero-btn" onClick={() => navigate("/admin/listcustomers")}>View Customers</button>
          <button className="hero-btn secondary" onClick={() => navigate("/admin/shutters")}>Manage Shutters</button>
        </div>
      </section>

      <section className="stats-grid">
        {stats.map((item, index) => (
          <article
            key={index}
            className={`stat-card ${item.className}`}
            onClick={() => navigate(item.path)}
          >
            <div className="card-top">
              <div className="icon-box">{item.icon}</div>
              <span className="card-label">{item.title}</span>
            </div>

            <div className="card-content">
              <h2>{item.value}</h2>
              <p>{item.description}</p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};

export default Dashboard;

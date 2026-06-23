import "./List_of_customer.css";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const List_of_customer = () => {
  const navigate = useNavigate();
  const [customerData, setCustomerData] = useState([]);

  useEffect(() => {
    GetCustomerData();
  }, []);

  const GetCustomerData = async () => {
    try {
      const response = await fetch("http://localhost:3000/customers");
      const data = await response.json();
      setCustomerData(data);
    } catch (error) {
      console.log("Error fetching customers:", error);
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/customers/addcustomers/${id}`);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this customer?",
    );

    if (!confirmDelete) return;

    try {
      await fetch(`http://localhost:3000/customers/${id}`, {
        method: "DELETE",
      });
      GetCustomerData();
    } catch (error) {
      console.log("Delete Error:", error);
    }
  };

  return (
    <div className="customer-list-page">
      <div className="list-header-card">
        <div>
          <p className="eyebrow">Customers</p>
          <h2>List of Customers</h2>
          <p className="subtext">
            Manage your customer roster, edit client details, or remove outdated
            entries with confidence.
          </p>
        </div>

        <div className="summary-card">
          <span>Total customers</span>
          <strong>{customerData.length}</strong>
        </div>
      </div>

      <div className="customer-list-container">
        <div className="table-toolbar">
          <div className="search-box">
            <input type="search" placeholder="Search by name or city" />
          </div>

          <button className="primary-btn" onClick={() => navigate("/admin/addcustomers")}>Add Customer</button>
        </div>

        <div className="table-wrap">
          <table className="customer-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>City</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {customerData.length > 0 ? (
                customerData.map((customer) => (
                  <tr key={customer.id}>
                    <td>{customer.customerName}</td>
                    <td>{customer.email}</td>
                    <td>{customer.mobile}</td>
                    <td>{customer.city}</td>
                    <td className="action-buttons">
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(customer.id)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(customer.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-data">
                    No Customers Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default List_of_customer;

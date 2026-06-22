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
      await fetch(`http://localhost:3000/addcustomers/${id}`, {
        method: "DELETE",
      });

      GetCustomerData();
    } catch (error) {
      console.log("Delete Error:", error);
    }
  };

  return (
    <div className="customer-list-container">
      <div className="table-header">
        <h2>List of Customers</h2>

        <div className="total-count">
          Total Customers: {customerData.length}
        </div>
      </div>

      <table className="customer-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Location</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {customerData.length > 0 ? (
            customerData.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.name}</td>
                <td>{customer.mobile}</td>
                <td>{customer.locations}</td>

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
              <td colSpan="4" className="no-data">
                No Customers Found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default List_of_customer;

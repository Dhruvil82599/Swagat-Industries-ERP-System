import React, { useState } from "react";
import "./Customer.css";

const Customers = () => {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    city: "",
    address: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Customer Added Successfully");

        setFormData({
          customerName: "",
          mobile: "",
          email: "",
          city: "",
          address: "",
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="customer-page">
      <div className="customer-grid">
        <aside className="customer-info-panel">
          <div className="panel-badge">Add Customer</div>
          <h2>New customer details</h2>
          <p>
            Capture customer information with a clean form and keep your records
            ready for orders, quotations, and follow-ups.
          </p>

          <div className="info-list">
            <div>
              <span>Quick onboarding</span>
              <strong>Fast data entry</strong>
            </div>
            <div>
              <span>Clean records</span>
              <strong>Accurate customer profiles</strong>
            </div>
          </div>
        </aside>

        <section className="customer-form-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Customer Form</p>
              <h3>Add new customer</h3>
            </div>
            <span className="badge">ERP</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Customer Name</label>
                <input
                  type="text"
                  name="customerName"
                  placeholder="Enter customer name"
                  value={formData.customerName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Mobile Number</label>
                <input
                  type="text"
                  name="mobile"
                  placeholder="Enter mobile number"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Address</label>
              <textarea
                rows="4"
                name="address"
                placeholder="Enter address"
                value={formData.address}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <button type="submit" className="save-btn">
              Save Customer
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Customers;
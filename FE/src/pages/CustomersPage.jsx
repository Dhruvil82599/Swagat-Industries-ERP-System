import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout, { useToast } from '../components/Layout/AppLayout';
import { api } from '../services/api';
import ConfirmModal from '../components/UI/ConfirmModal';
import { 
  FiPlus, 
  FiSearch, 
  FiEdit2, 
  FiTrash2, 
  FiEye, 
  FiArrowRight, 
  FiX, 
  FiUsers 
} from 'react-icons/fi';
import { getGstValidationStatus, getMobileValidationStatus } from '../utils/validation';
import ActionButtons from '../components/UI/ActionButtons';


export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Form fields
  const [formData, setFormData] = useState({
    customer_name: '',
    mobile_number: '',
    address: '',
    gst_no: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { addToast } = useToast();

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await api.getCustomers(search);
      setCustomers(data);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCustomers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const openAddModal = () => {
    setSelectedCustomer(null);
    setFormData({
      customer_name: '',
      mobile_number: '',
      address: '',
      gst_no: ''
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const openEditModal = (cust) => {
    setSelectedCustomer(cust);
    setFormData({
      customer_name: cust.customerName,
      mobile_number: cust.mobileNumber,
      address: cust.address,
      gst_no: cust.gstNo || ''
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const openViewModal = (cust) => {
    setSelectedCustomer(cust);
    setIsViewOpen(true);
  };

  const openDeleteModal = (cust) => {
    setSelectedCustomer(cust);
    setIsDeleteOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.customer_name || formData.customer_name.trim() === '') {
      errors.customer_name = 'Customer name is required';
    }
    if (!formData.mobile_number || !/^\d{10}$/.test(formData.mobile_number.trim())) {
      errors.mobile_number = 'Mobile number must be exactly 10 digits';
    }
    if (!formData.address || formData.address.trim() === '') {
      errors.address = 'Address is required';
    }
    if (formData.gst_no && formData.gst_no.trim() !== '') {
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstRegex.test(formData.gst_no.trim().toUpperCase())) {
        errors.gst_no = 'GST Number must be a valid 15-character GSTIN (e.g. 24ABCDE1234F1Z5)';
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      if (selectedCustomer) {
        await api.updateCustomer(selectedCustomer.id, formData);
        addToast('Customer updated successfully', 'success');
      } else {
        await api.createCustomer(formData);
        addToast('Customer added successfully', 'success');
      }
      setIsFormOpen(false);
      loadCustomers();
    } catch (err) {
      if (err.errors && Array.isArray(err.errors)) {
        const errorMap = {};
        err.errors.forEach((er) => { errorMap[er.field] = er.message; });
        setFormErrors(errorMap);
      }
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteCustomer(selectedCustomer.id);
      addToast('Customer deleted successfully', 'success');
      setIsDeleteOpen(false);
      loadCustomers();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <AppLayout title="Customer Management">
      {/* Breadcrumb Flow */}
      <div className="breadcrumb-flow">
        <span className="breadcrumb-item active">
          <FiUsers /> 1. Customers
        </span>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-item" style={{ opacity: 0.6 }}>
          2. Industries
        </span>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-item" style={{ opacity: 0.6 }}>
          3. Sites
        </span>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-item" style={{ opacity: 0.6 }}>
          4. Shutters
        </span>
      </div>

      <div className="erp-card">
        <div className="erp-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h2 className="erp-card-title">
              <FiUsers style={{ color: 'var(--primary)' }} />
              All Customers ({customers.length})
            </h2>
            <div className="search-input-wrapper">
              <FiSearch className="search-icon" />
              <input
                type="text"
                className="form-control-swagat"
                placeholder="Search by Name or Mobile..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <button className="btn-accent-swagat" onClick={openAddModal}>
            <FiPlus /> Add Customer
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Loading customers...
            </div>
          ) : customers.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              {search ? 'No customers found matching your search.' : 'No customers created yet. Click "Add Customer" to create one.'}
            </div>
          ) : (
            <table className="erp-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Sr.</th>
                  <th>Customer Name</th>
                  <th>Mobile Number</th>
                  <th>GST No.</th>
                  <th>Address</th>
                  <th>Industries</th>
                  <th style={{ width: '180px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((cust, idx) => (
                  <tr key={cust.id}>
                    <td>{idx + 1}</td>
                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
                      {cust.customerName}
                    </td>
                    <td>{cust.mobileNumber}</td>
                    <td>{cust.gstNo || <span style={{ color: '#94A3B8' }}>N/A</span>}</td>
                    <td style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {cust.address}
                    </td>
                    <td>
                      <button
                        className="btn-outline-swagat"
                        style={{ padding: '4px 10px', fontSize: '12px' }}
                        onClick={() => navigate(`/industries?customerId=${cust.id}`)}
                      >
                        {cust._count?.industries || 0} Units <FiArrowRight />
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <ActionButtons
                        onView={() => openViewModal(cust)}
                        viewTitle="View Details"
                        onEdit={() => openEditModal(cust)}
                        editTitle="Edit Customer"
                        onDelete={() => openDeleteModal(cust)}
                        deleteTitle="Delete Customer"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add / Edit Customer Modal */}
      {isFormOpen && (
        <div className="modal-overlay">
          <div className="modal-content-swagat">
            <div className="modal-header-swagat">
              <h3>{selectedCustomer ? 'Edit Customer' : 'Add New Customer'}</h3>
              <button className="modal-close-btn" onClick={() => setIsFormOpen(false)}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body-swagat">
                {(() => {
                  const mobileStatus = getMobileValidationStatus(formData.mobile_number, false);
                  const gstStatus = getGstValidationStatus(formData.gst_no);
                  return (
                    <div style={{ display: 'grid', gap: '16px' }}>
                      <div>
                        <label className="form-label-swagat">
                          Customer Name <span style={{ color: 'var(--danger)' }}>*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control-swagat"
                          placeholder="e.g. Shree Radhe Textiles"
                          value={formData.customer_name}
                          onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                        />
                        {formErrors.customer_name && (
                          <span style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px', display: 'block' }}>
                            {formErrors.customer_name}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                          <label className="form-label-swagat">
                            Mobile Number (10 Digits) <span style={{ color: 'var(--danger)' }}>*</span>
                          </label>
                          <input
                            type="text"
                            maxLength="10"
                            className="form-control-swagat"
                            placeholder="e.g. 9825012345"
                            value={formData.mobile_number}
                            onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value.replace(/\D/g, '') })}
                          />
                          {formErrors.mobile_number ? (
                            <span style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px', display: 'block' }}>
                              ✕ {formErrors.mobile_number}
                            </span>
                          ) : mobileStatus.message ? (
                            <span
                              style={{
                                fontSize: '12px',
                                fontWeight: 500,
                                color: mobileStatus.isValid ? 'var(--success)' : 'var(--danger)',
                                marginTop: '4px',
                                display: 'block'
                              }}
                            >
                              {mobileStatus.message}
                            </span>
                          ) : null}
                        </div>

                        <div>
                          <label className="form-label-swagat">GST Number (Optional)</label>
                          <input
                            type="text"
                            maxLength="15"
                            className="form-control-swagat"
                            placeholder="e.g. 24ABCDE1234F1Z5"
                            value={formData.gst_no}
                            onChange={(e) => setFormData({ ...formData, gst_no: e.target.value.toUpperCase() })}
                          />
                          {formErrors.gst_no ? (
                            <span style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px', display: 'block' }}>
                              {formErrors.gst_no}
                            </span>
                          ) : gstStatus.message ? (
                            <span
                              style={{
                                fontSize: '12px',
                                fontWeight: 500,
                                color: gstStatus.isValid ? 'var(--success)' : 'var(--danger)',
                                marginTop: '4px',
                                display: 'block'
                              }}
                            >
                              {gstStatus.message}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div>
                        <label className="form-label-swagat">
                          Full Address <span style={{ color: 'var(--danger)' }}>*</span>
                        </label>
                        <textarea
                          rows="3"
                          className="form-control-swagat"
                          placeholder="Enter billing/office address..."
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                        {formErrors.address && (
                          <span style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px', display: 'block' }}>
                            {formErrors.address}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
              <div className="modal-footer-swagat">
                <button
                  type="button"
                  className="btn-outline-swagat"
                  onClick={() => setIsFormOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-swagat"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : selectedCustomer ? 'Update Customer' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Customer Details Modal */}
      {isViewOpen && selectedCustomer && (
        <div className="modal-overlay">
          <div className="modal-content-swagat">
            <div className="modal-header-swagat">
              <h3>Customer Profile</h3>
              <button className="modal-close-btn" onClick={() => setIsViewOpen(false)}>
                <FiX />
              </button>
            </div>
            <div className="modal-body-swagat">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Customer Name</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary)' }}>
                    {selectedCustomer.customerName}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Mobile Number</div>
                  <div style={{ fontSize: '15px', fontWeight: 600 }}>{selectedCustomer.mobileNumber}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>GST No.</div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>
                    {selectedCustomer.gstNo || 'Not Applicable'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Linked Industries</div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>
                    {selectedCustomer._count?.industries || 0} Companies
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Address</div>
                <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '14px' }}>
                  {selectedCustomer.address}
                </div>
              </div>
            </div>
            <div className="modal-footer-swagat">
              <button
                className="btn-accent-swagat"
                onClick={() => {
                  setIsViewOpen(false);
                  navigate(`/industries?customerId=${selectedCustomer.id}`);
                }}
              >
                View Industries & Sites <FiArrowRight />
              </button>
              <button className="btn-outline-swagat" onClick={() => setIsViewOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        title="Delete Customer?"
        message={`Are you sure you want to delete "${selectedCustomer?.customerName}"? This will also remove associated industries, sites, and shutters.`}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </AppLayout>
  );
}

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
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
  FiMapPin, 
  FiBriefcase, 
  FiUsers, 
  FiFilter 
} from 'react-icons/fi';
import { getMobileValidationStatus } from '../utils/validation';

export default function SitesPage() {
  const [sites, setSites] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedIndustryId = searchParams.get('industryId') || '';

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState(null);

  // Form fields
  const [formData, setFormData] = useState({
    industry_id: '',
    site_name: '',
    site_address: '',
    city_location: '',
    contact_person: '',
    mobile_no: '',
    remark: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { addToast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [siteList, indList] = await Promise.all([
        api.getSites(selectedIndustryId, search),
        api.getIndustries()
      ]);
      setSites(siteList);
      setIndustries(indList);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedIndustryId, search]);

  const openAddModal = () => {
    setSelectedSite(null);
    setFormData({
      industry_id: selectedIndustryId || (industries.length > 0 ? industries[0].id : ''),
      site_name: '',
      site_address: '',
      city_location: '',
      contact_person: '',
      mobile_no: '',
      remark: ''
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const openEditModal = (site) => {
    setSelectedSite(site);
    setFormData({
      industry_id: site.industryId,
      site_name: site.siteName,
      site_address: site.siteAddress,
      city_location: site.cityLocation,
      contact_person: site.contactPerson || '',
      mobile_no: site.mobileNo || '',
      remark: site.remark || ''
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const openViewModal = (site) => {
    setSelectedSite(site);
    setIsViewOpen(true);
  };

  const openDeleteModal = (site) => {
    setSelectedSite(site);
    setIsDeleteOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.industry_id) {
      errors.industry_id = 'Please select an industry';
    }
    if (!formData.site_name || formData.site_name.trim() === '') {
      errors.site_name = 'Site name is required';
    }
    if (!formData.site_address || formData.site_address.trim() === '') {
      errors.site_address = 'Site address is required';
    }
    if (!formData.city_location || formData.city_location.trim() === '') {
      errors.city_location = 'City / Location is required';
    }
    if (formData.mobile_no && !/^\d{10}$/.test(formData.mobile_no.trim())) {
      errors.mobile_no = 'Mobile number must be a valid 10-digit number';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      if (selectedSite) {
        await api.updateSite(selectedSite.id, formData);
        addToast('Site updated successfully', 'success');
      } else {
        await api.createSite(formData);
        addToast('Site added successfully', 'success');
      }
      setIsFormOpen(false);
      loadData();
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
      await api.deleteSite(selectedSite.id);
      addToast('Site deleted successfully', 'success');
      setIsDeleteOpen(false);
      loadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const currentIndustryObj = industries.find((i) => String(i.id) === String(selectedIndustryId));

  return (
    <AppLayout title="Site / Location Management">
      {/* Breadcrumb Flow */}
      <div className="breadcrumb-flow">
        <Link to="/customers" className="breadcrumb-item">
          <FiUsers /> 1. Customers
        </Link>
        <span className="breadcrumb-separator">/</span>
        <Link to="/industries" className="breadcrumb-item">
          <FiBriefcase /> 2. Industries
        </Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-item active">
          <FiMapPin /> 3. Sites {currentIndustryObj ? `(${currentIndustryObj.industryName})` : ''}
        </span>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-item" style={{ opacity: 0.6 }}>
          4. Shutters
        </span>
      </div>

      <div className="erp-card">
        <div className="erp-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <h2 className="erp-card-title">
              <FiMapPin style={{ color: 'var(--primary)' }} />
              Sites / Locations ({sites.length})
            </h2>

            {/* Industry Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FiFilter style={{ color: 'var(--text-secondary)' }} />
              <select
                className="form-select-swagat"
                style={{ width: '230px' }}
                value={selectedIndustryId}
                onChange={(e) => {
                  if (e.target.value) {
                    setSearchParams({ industryId: e.target.value });
                  } else {
                    setSearchParams({});
                  }
                }}
              >
                <option value="">All Industries</option>
                {industries.map((ind) => (
                  <option key={ind.id} value={ind.id}>
                    {ind.industryName} ({ind.customer?.customerName || ''})
                  </option>
                ))}
              </select>
            </div>

            <div className="search-input-wrapper">
              <FiSearch className="search-icon" />
              <input
                type="text"
                className="form-control-swagat"
                placeholder="Search Site, City, Contact..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <button className="btn-accent-swagat" onClick={openAddModal}>
            <FiPlus /> Add Site
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Loading sites...
            </div>
          ) : sites.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              {search || selectedIndustryId
                ? 'No sites match your search criteria.'
                : 'No sites created yet. Click "Add Site" to register one.'}
            </div>
          ) : (
            <table className="erp-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Sr.</th>
                  <th>Site Name</th>
                  <th>Industry / Company</th>
                  <th>City / Location</th>
                  <th>Contact Person</th>
                  <th>Mobile No.</th>
                  <th>Shutters</th>
                  <th style={{ width: '180px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sites.map((site, idx) => (
                  <tr key={site.id}>
                    <td>{idx + 1}</td>
                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
                      {site.siteName}
                    </td>
                    <td>{site.industry?.industryName || 'N/A'}</td>
                    <td>
                      <span className="badge-swagat" style={{ backgroundColor: '#EEF2F6', color: '#1E293B' }}>
                        {site.cityLocation}
                      </span>
                    </td>
                    <td>{site.contactPerson || <span style={{ color: '#94A3B8' }}>-</span>}</td>
                    <td>{site.mobileNo || <span style={{ color: '#94A3B8' }}>-</span>}</td>
                    <td>
                      <button
                        className="btn-outline-swagat"
                        style={{ padding: '4px 10px', fontSize: '12px' }}
                        onClick={() => navigate(`/shutters?siteId=${site.id}`)}
                      >
                        {site._count?.shutters || 0} Shutters <FiArrowRight />
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          className="btn-icon-action"
                          title="View Details"
                          onClick={() => openViewModal(site)}
                        >
                          <FiEye />
                        </button>
                        <button
                          className="btn-icon-action"
                          title="Edit Site"
                          onClick={() => openEditModal(site)}
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          className="btn-icon-action danger"
                          title="Delete Site"
                          onClick={() => openDeleteModal(site)}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add / Edit Site Modal */}
      {isFormOpen && (
        <div className="modal-overlay">
          <div className="modal-content-swagat">
            <div className="modal-header-swagat">
              <h3>{selectedSite ? 'Edit Site' : 'Add New Site'}</h3>
              <button className="modal-close-btn" onClick={() => setIsFormOpen(false)}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body-swagat">
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div>
                    <label className="form-label-swagat">
                      Belongs to Industry <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <select
                      className="form-select-swagat"
                      value={formData.industry_id}
                      onChange={(e) => setFormData({ ...formData, industry_id: e.target.value })}
                    >
                      <option value="">Select an Industry...</option>
                      {industries.map((ind) => (
                        <option key={ind.id} value={ind.id}>
                          {ind.industryName} ({ind.customer?.customerName || ''})
                        </option>
                      ))}
                    </select>
                    {formErrors.industry_id && (
                      <span style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px', display: 'block' }}>
                        {formErrors.industry_id}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
                    <div>
                      <label className="form-label-swagat">
                        Site / Location Name <span style={{ color: 'var(--danger)' }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control-swagat"
                        placeholder="e.g. Unit 1 Main Warehouse"
                        value={formData.site_name}
                        onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
                      />
                      {formErrors.site_name && (
                        <span style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px', display: 'block' }}>
                          {formErrors.site_name}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="form-label-swagat">
                        City / Location <span style={{ color: 'var(--danger)' }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control-swagat"
                        placeholder="e.g. Rajkot, Gondal"
                        value={formData.city_location}
                        onChange={(e) => setFormData({ ...formData, city_location: e.target.value })}
                      />
                      {formErrors.city_location && (
                        <span style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px', display: 'block' }}>
                          {formErrors.city_location}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label className="form-label-swagat">Site Contact Person</label>
                      <input
                        type="text"
                        className="form-control-swagat"
                        placeholder="e.g. Suresh Bhai"
                        value={formData.contact_person}
                        onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="form-label-swagat">Mobile No. (Optional)</label>
                      <input
                        type="text"
                        maxLength="10"
                        className="form-control-swagat"
                        placeholder="e.g. 9825012345"
                        value={formData.mobile_no}
                        onChange={(e) => setFormData({ ...formData, mobile_no: e.target.value.replace(/\D/g, '') })}
                      />
                      {(() => {
                        const mobStatus = getMobileValidationStatus(formData.mobile_no, true);
                        if (formErrors.mobile_no) {
                          return (
                            <span style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px', display: 'block' }}>
                              ✕ {formErrors.mobile_no}
                            </span>
                          );
                        }
                        if (mobStatus.message) {
                          return (
                            <span
                              style={{
                                fontSize: '12px',
                                fontWeight: 500,
                                color: mobStatus.isValid ? 'var(--success)' : 'var(--danger)',
                                marginTop: '4px',
                                display: 'block'
                              }}
                            >
                              {mobStatus.message}
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>

                  <div>
                    <label className="form-label-swagat">
                      Site Physical Address <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <textarea
                      rows="2"
                      className="form-control-swagat"
                      placeholder="Enter detailed site address/plot number..."
                      value={formData.site_address}
                      onChange={(e) => setFormData({ ...formData, site_address: e.target.value })}
                    />
                    {formErrors.site_address && (
                      <span style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px', display: 'block' }}>
                        {formErrors.site_address}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="form-label-swagat">Remark (Optional)</label>
                    <input
                      type="text"
                      className="form-control-swagat"
                      placeholder="e.g. Height clearance 15 ft, new building"
                      value={formData.remark}
                      onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                    />
                  </div>
                </div>
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
                  {submitting ? 'Saving...' : selectedSite ? 'Update Site' : 'Save Site'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Site Details Modal */}
      {isViewOpen && selectedSite && (
        <div className="modal-overlay">
          <div className="modal-content-swagat">
            <div className="modal-header-swagat">
              <h3>Site Details</h3>
              <button className="modal-close-btn" onClick={() => setIsViewOpen(false)}>
                <FiX />
              </button>
            </div>
            <div className="modal-body-swagat">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Site Name</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary)' }}>
                    {selectedSite.siteName}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Industry / Company</div>
                  <div style={{ fontSize: '15px', fontWeight: 600 }}>
                    {selectedSite.industry?.industryName || 'N/A'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>City / Location</div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>
                    {selectedSite.cityLocation}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Contact Person</div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>
                    {selectedSite.contactPerson || '-'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Mobile No.</div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>
                    {selectedSite.mobileNo || '-'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Shutters Installed</div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>
                    {selectedSite._count?.shutters || 0} Shutters
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Address</div>
                <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '14px' }}>
                  {selectedSite.siteAddress}
                </div>
              </div>

              {selectedSite.remark && (
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Remark</div>
                  <div style={{ fontStyle: 'italic', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {selectedSite.remark}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer-swagat">
              <button
                className="btn-accent-swagat"
                onClick={() => {
                  setIsViewOpen(false);
                  navigate(`/shutters?siteId=${selectedSite.id}`);
                }}
              >
                View Shutters <FiArrowRight />
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
        title="Delete Site?"
        message={`Are you sure you want to delete "${selectedSite?.siteName}"? This will also remove all associated shutter catalog items.`}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </AppLayout>
  );
}

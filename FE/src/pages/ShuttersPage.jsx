import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import AppLayout, { useToast } from "../components/Layout/AppLayout";
import { api } from "../services/api";
import ConfirmModal from "../components/UI/ConfirmModal";
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiX,
  FiLayers,
  FiMapPin,
  FiBriefcase,
  FiUsers,
  FiFilter,
  FiDollarSign,
} from "react-icons/fi";
import ActionButtons from "../components/UI/ActionButtons";


const calculateShutterPrice = (sht) => {
  if (!sht) return 0;
  const round2 = (val) => Math.round((Number(val) + Number.EPSILON) * 100) / 100;
  const hIn = parseFloat(sht.heightInches) || 0;
  const wIn = parseFloat(sht.widthInches) || 0;
  const type = sht.shutterType || "Manual";
  const rate = parseFloat(sht.ratePerSqft) || 0;
  const giRate = parseFloat(sht.giTopCoverRatePerSqft) || 0;
  const gear = type === "Gear" ? parseFloat(sht.gearPrice) || 0 : 0;
  const motor = type === "Motorised" ? parseFloat(sht.motorPrice) || 0 : 0;

  if (hIn <= 0 || wIn <= 0) return 0;

  const hFt = round2(hIn / 12);
  const wFt = round2(wIn / 12);

  let overH = 0;
  let overW = 0;
  let coverSize = 0;

  if (type === "Manual") {
    overH = round2(hFt + 1.5);
    overW = round2(wFt + 0.5);
    coverSize = round2(overW + 0.5);
  } else {
    overH = round2(hFt + 2.0);
    overW = round2(wFt + 0.75);
    coverSize = round2(overW + 0.75);
  }

  const totalSqft = round2(overH * overW);
  const shutterBasic = round2(
    totalSqft * rate + (type === "Gear" ? gear : type === "Motorised" ? motor : 0)
  );
  const giCoverBasic = round2(coverSize * giRate);
  return round2(shutterBasic + giCoverBasic);
};

const computeShutterPreviewFromObj = (sht) => {
  if (!sht) return null;
  const hIn = parseFloat(sht.heightInches ?? sht.height_inches) || 0;
  const wIn = parseFloat(sht.widthInches ?? sht.width_inches) || 0;
  const rate = parseFloat(sht.ratePerSqft ?? sht.rate_per_sqft) || 0;
  const giRate = parseFloat(sht.giTopCoverRatePerSqft ?? sht.gi_top_cover_rate_per_sqft) || 0;
  const type = sht.shutterType || sht.shutter_type || "Manual";
  const gear = type === "Gear" ? parseFloat(sht.gearPrice ?? sht.gear_price) || 0 : 0;
  const motor = type === "Motorised" ? parseFloat(sht.motorPrice ?? sht.motor_price) || 0 : 0;

  if (hIn <= 0 || wIn <= 0) return null;

  const round2 = (val) => Math.round((Number(val) + Number.EPSILON) * 100) / 100;

  const hFt = round2(hIn / 12);
  const wFt = round2(wIn / 12);

  let overH = 0;
  let overW = 0;
  let coverSize = 0;

  if (type === "Manual") {
    overH = round2(hFt + 1.5);
    overW = round2(wFt + 0.5);
    coverSize = round2(overW + 0.5);
  } else {
    overH = round2(hFt + 2.0);
    overW = round2(wFt + 0.75);
    coverSize = round2(overW + 0.75);
  }

  const totalSqft = round2(overH * overW);
  const shutterBasic = round2(
    totalSqft * rate + (type === "Gear" ? gear : type === "Motorised" ? motor : 0)
  );
  const giCoverBasic = round2(coverSize * giRate);
  const basicTotal = round2(shutterBasic + giCoverBasic);

  return {
    hFt,
    wFt,
    overH,
    overW,
    totalSqft,
    coverSize,
    shutterBasic,
    giCoverBasic,
    basicTotal,
  };
};

export default function ShuttersPage() {
  const [shutters, setShutters] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedSiteId = searchParams.get("siteId") || "";

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedShutter, setSelectedShutter] = useState(null);

  // Form fields
  const [formData, setFormData] = useState({
    site_id: "",
    shutter_name_no: "",
    height_inches: "",
    width_inches: "",
    shutter_type: "Manual",
    fitting_type: "A Type",
    rate_per_sqft: "",
    gi_top_cover_rate_per_sqft: "",
    gear_price: "",
    motor_price: "",
    gst_applicable: true,
    remark: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const { addToast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [shutterList, siteList] = await Promise.all([
        api.getShutters(selectedSiteId, search),
        api.getSites(),
      ]);
      setShutters(shutterList);
      setSites(siteList);
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedSiteId, search]);

  const openAddModal = () => {
    setSelectedShutter(null);
    setFormData({
      site_id: selectedSiteId || (sites.length > 0 ? sites[0].id : ""),
      shutter_name_no: "",
      height_inches: "",
      width_inches: "",
      shutter_type: "Manual",
      fitting_type: "A Type",
      rate_per_sqft: "",
      gi_top_cover_rate_per_sqft: "",
      gear_price: "",
      motor_price: "",
      gst_applicable: true,
      remark: "",
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const openEditModal = (sht) => {
    setSelectedShutter(sht);
    setFormData({
      site_id: sht.siteId,
      shutter_name_no: sht.shutterNameNo,
      height_inches: sht.heightInches,
      width_inches: sht.widthInches,
      shutter_type: sht.shutterType,
      fitting_type: sht.fittingType,
      rate_per_sqft: sht.ratePerSqft,
      gi_top_cover_rate_per_sqft: sht.giTopCoverRatePerSqft,
      gear_price: sht.gearPrice,
      motor_price: sht.motorPrice,
      gst_applicable: sht.gstApplicable,
      remark: sht.remark || "",
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const openViewModal = (sht) => {
    setSelectedShutter(sht);
    setIsViewOpen(true);
  };

  const openDeleteModal = (sht) => {
    setSelectedShutter(sht);
    setIsDeleteOpen(true);
  };

  // Live calculation preview in form
  const computeLivePreview = () => {
    const hIn = parseFloat(formData.height_inches) || 0;
    const wIn = parseFloat(formData.width_inches) || 0;
    const rate = parseFloat(formData.rate_per_sqft) || 0;
    const giRate = parseFloat(formData.gi_top_cover_rate_per_sqft) || 0;
    const gear =
      formData.shutter_type === "Gear"
        ? parseFloat(formData.gear_price) || 0
        : 0;
    const motor =
      formData.shutter_type === "Motorised"
        ? parseFloat(formData.motor_price) || 0
        : 0;

    if (hIn <= 0 || wIn <= 0) return null;

    const round2 = (val) =>
      Math.round((Number(val) + Number.EPSILON) * 100) / 100;

    const hFt = round2(hIn / 12);
    const wFt = round2(wIn / 12);

    let overH = 0;
    let overW = 0;
    let coverSize = 0;

    if (formData.shutter_type === "Manual") {
      overH = round2(hFt + 1.5);
      overW = round2(wFt + 0.5);
      coverSize = round2(overW + 0.5);
    } else {
      overH = round2(hFt + 2.0);
      overW = round2(wFt + 0.75);
      coverSize = round2(overW + 0.75);
    }

    const totalSqft = round2(overH * overW);
    const shutterBasic = round2(
      totalSqft * rate +
        (formData.shutter_type === "Gear"
          ? gear
          : formData.shutter_type === "Motorised"
            ? motor
            : 0),
    );
    const giCoverBasic = round2(coverSize * giRate);
    const basicTotal = round2(shutterBasic + giCoverBasic);

    return {
      hFt,
      wFt,
      overH,
      overW,
      totalSqft,
      coverSize,
      shutterBasic,
      giCoverBasic,
      basicTotal,
    };
  };

  const preview = computeLivePreview();

  const validateForm = () => {
    const errors = {};
    if (!formData.site_id) {
      errors.site_id = "Please select a site";
    }
    if (!formData.shutter_name_no || formData.shutter_name_no.trim() === "") {
      errors.shutter_name_no = "Shutter name / number is required";
    }
    const h = parseFloat(formData.height_inches);
    if (isNaN(h) || h <= 0) {
      errors.height_inches = "Height must be a positive number (> 0)";
    }
    const w = parseFloat(formData.width_inches);
    if (isNaN(w) || w <= 0) {
      errors.width_inches = "Width must be a positive number (> 0)";
    }
    if (
      formData.rate_per_sqft !== "" &&
      parseFloat(formData.rate_per_sqft) < 0
    ) {
      errors.rate_per_sqft = "Rate cannot be negative";
    }
    if (
      formData.gi_top_cover_rate_per_sqft !== "" &&
      parseFloat(formData.gi_top_cover_rate_per_sqft) < 0
    ) {
      errors.gi_top_cover_rate_per_sqft =
        "GI Top Cover rate cannot be negative";
    }
    if (
      formData.shutter_type === "Gear" &&
      formData.gear_price !== "" &&
      parseFloat(formData.gear_price) < 0
    ) {
      errors.gear_price = "Gear price cannot be negative";
    }
    if (
      formData.shutter_type === "Motorised" &&
      formData.motor_price !== "" &&
      parseFloat(formData.motor_price) < 0
    ) {
      errors.motor_price = "Motor price cannot be negative";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        height_inches: parseFloat(formData.height_inches),
        width_inches: parseFloat(formData.width_inches),
        rate_per_sqft: parseFloat(formData.rate_per_sqft) || 0,
        gi_top_cover_rate_per_sqft:
          parseFloat(formData.gi_top_cover_rate_per_sqft) || 0,
        gear_price:
          formData.shutter_type === "Gear"
            ? parseFloat(formData.gear_price) || 0
            : 0,
        motor_price:
          formData.shutter_type === "Motorised"
            ? parseFloat(formData.motor_price) || 0
            : 0,
        gst_applicable: Boolean(formData.gst_applicable),
      };

      if (selectedShutter) {
        await api.updateShutter(selectedShutter.id, payload);
        addToast("Shutter updated successfully", "success");
      } else {
        await api.createShutter(payload);
        addToast("Shutter added successfully", "success");
      }
      setIsFormOpen(false);
      loadData();
    } catch (err) {
      if (err.errors && Array.isArray(err.errors)) {
        const errorMap = {};
        err.errors.forEach((er) => {
          errorMap[er.field] = er.message;
        });
        setFormErrors(errorMap);
      }
      addToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteShutter(selectedShutter.id);
      addToast("Shutter deleted successfully", "success");
      setIsDeleteOpen(false);
      loadData();
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const currentSiteObj = sites.find(
    (s) => String(s.id) === String(selectedSiteId),
  );

  return (
    <AppLayout title="Shutter Master Catalog">
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
        <Link to="/sites" className="breadcrumb-item">
          <FiMapPin /> 3. Sites
        </Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-item active">
          <FiLayers /> 4. Shutters{" "}
          {currentSiteObj ? `(${currentSiteObj.siteName})` : ""}
        </span>
      </div>

      <div className="erp-card">
        <div className="erp-card-header">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <h2 className="erp-card-title">
              <FiLayers style={{ color: "var(--primary)" }} />
              Shutters Catalog ({shutters.length})
            </h2>

            {/* Site Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <FiFilter style={{ color: "var(--text-secondary)" }} />
              <select
                className="form-select-swagat"
                style={{ width: "240px" }}
                value={selectedSiteId}
                onChange={(e) => {
                  if (e.target.value) {
                    setSearchParams({ siteId: e.target.value });
                  } else {
                    setSearchParams({});
                  }
                }}
              >
                <option value="">All Sites</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.siteName} ({s.cityLocation})
                  </option>
                ))}
              </select>
            </div>

            <div className="search-input-wrapper">
              <FiSearch className="search-icon" />
              <input
                type="text"
                className="form-control-swagat"
                placeholder="Search Shutter Name/No..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <button className="btn-accent-swagat" onClick={openAddModal}>
            <FiPlus /> Add Shutter
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          {loading ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "var(--text-secondary)",
              }}
            >
              Loading shutters...
            </div>
          ) : shutters.length === 0 ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "var(--text-secondary)",
              }}
            >
              {search || selectedSiteId
                ? "No shutters match your search criteria."
                : 'No shutters created yet. Click "Add Shutter" to add one to the catalog.'}
            </div>
          ) : (
            <table className="erp-table">
              <thead>
                <tr>
                  <th style={{ width: "50px" }}>Sr.</th>
                  <th>Shutter Name / No.</th>
                  <th>Site / Industry</th>
                  <th>Dimensions (H × W)</th>
                  <th>Type</th>
                  <th>Fitting</th>
                  <th>Rate / Sqft</th>
                  <th>GI Top Cover Rate</th>
                  <th>Price</th>
                  <th style={{ width: "150px", textAlign: "right" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {shutters.map((sht, idx) => (
                  <tr key={sht.id}>
                    <td>{idx + 1}</td>
                    <td style={{ fontWeight: 600, color: "var(--primary)" }}>
                      {sht.shutterNameNo}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>
                        {sht.site?.siteName || "N/A"}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {sht.site?.industry?.industryName || ""}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>
                        {sht.heightInches}" × {sht.widthInches}"
                      </span>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        ({(Number(sht.heightInches) / 12).toFixed(2)}' ×{" "}
                        {(Number(sht.widthInches) / 12).toFixed(2)}')
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge-swagat badge-${sht.shutterType.toLowerCase()}`}
                      >
                        {sht.shutterType}
                      </span>
                    </td>
                    <td>
                      <span
                        className="badge-swagat"
                        style={{ backgroundColor: "#F1F5F9", color: "#475569" }}
                      >
                        {sht.fittingType}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      ₹{Number(sht.ratePerSqft).toFixed(2)}
                    </td>
                    <td>₹{Number(sht.giTopCoverRatePerSqft).toFixed(2)}</td>
                    <td>
                      <span
                        style={{
                          fontWeight: 700,
                          color: "#047857",
                          backgroundColor: "#D1FAE5",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "13px",
                          display: "inline-block",
                          border: "1px solid #A7F3D0",
                        }}
                      >
                        ₹{calculateShutterPrice(sht).toFixed(2)}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <ActionButtons
                        onView={() => openViewModal(sht)}
                        viewTitle="View Details"
                        onEdit={() => openEditModal(sht)}
                        editTitle="Edit Shutter"
                        onDelete={() => openDeleteModal(sht)}
                        deleteTitle="Delete Shutter"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add / Edit Shutter Modal */}
      {isFormOpen && (
        <div className="modal-overlay">
          <div className="modal-content-swagat modal-lg">
            <div className="modal-header-swagat">
              <h3>
                {selectedShutter
                  ? "Edit Shutter Catalog Item"
                  : "Add New Shutter to Catalog"}
              </h3>
              <button
                className="modal-close-btn"
                onClick={() => setIsFormOpen(false)}
              >
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body-swagat">
                <div style={{ display: "grid", gap: "16px" }}>
                  {/* Site & Name */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.2fr 1fr",
                      gap: "16px",
                    }}
                  >
                    <div>
                      <label className="form-label-swagat">
                        Belongs to Site{" "}
                        <span style={{ color: "var(--danger)" }}>*</span>
                      </label>
                      <select
                        className="form-select-swagat"
                        value={formData.site_id}
                        onChange={(e) =>
                          setFormData({ ...formData, site_id: e.target.value })
                        }
                      >
                        <option value="">Select a Site...</option>
                        {sites.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.siteName} ({s.cityLocation}) -{" "}
                            {s.industry?.industryName || ""}
                          </option>
                        ))}
                      </select>
                      {formErrors.site_id && (
                        <span
                          style={{
                            fontSize: "12px",
                            color: "var(--danger)",
                            marginTop: "4px",
                            display: "block",
                          }}
                        >
                          {formErrors.site_id}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="form-label-swagat">
                        Shutter Name / Number{" "}
                        <span style={{ color: "var(--danger)" }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control-swagat"
                        placeholder="e.g. Shutter 1 (Main Gate)"
                        value={formData.shutter_name_no}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            shutter_name_no: e.target.value,
                          })
                        }
                      />
                      {formErrors.shutter_name_no && (
                        <span
                          style={{
                            fontSize: "12px",
                            color: "var(--danger)",
                            marginTop: "4px",
                            display: "block",
                          }}
                        >
                          {formErrors.shutter_name_no}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dimensions */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "16px",
                    }}
                  >
                    <div>
                      <label className="form-label-swagat">
                        Height (Inches){" "}
                        <span style={{ color: "var(--danger)" }}>*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="1"
                        className="form-control-swagat"
                        placeholder="e.g. 120"
                        value={formData.height_inches}
                        onWheel={(e) => e.target.blur()}
                        onKeyDown={(e) =>
                          (e.key === "ArrowUp" || e.key === "ArrowDown") &&
                          e.preventDefault()
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            height_inches: e.target.value,
                          })
                        }
                      />
                      {formErrors.height_inches && (
                        <span
                          style={{
                            fontSize: "12px",
                            color: "var(--danger)",
                            marginTop: "4px",
                            display: "block",
                          }}
                        >
                          {formErrors.height_inches}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="form-label-swagat">
                        Width (Inches){" "}
                        <span style={{ color: "var(--danger)" }}>*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="1"
                        className="form-control-swagat"
                        placeholder="e.g. 96"
                        value={formData.width_inches}
                        onWheel={(e) => e.target.blur()}
                        onKeyDown={(e) =>
                          (e.key === "ArrowUp" || e.key === "ArrowDown") &&
                          e.preventDefault()
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            width_inches: e.target.value,
                          })
                        }
                      />
                      {formErrors.width_inches && (
                        <span
                          style={{
                            fontSize: "12px",
                            color: "var(--danger)",
                            marginTop: "4px",
                            display: "block",
                          }}
                        >
                          {formErrors.width_inches}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Shutter Type & Fitting Type */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "16px",
                    }}
                  >
                    <div>
                      <label className="form-label-swagat">
                        Shutter Type{" "}
                        <span style={{ color: "var(--danger)" }}>*</span>
                      </label>
                      <select
                        className="form-select-swagat"
                        value={formData.shutter_type}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            shutter_type: e.target.value,
                          })
                        }
                      >
                        <option value="Manual">Manual</option>
                        <option value="Gear">Gear</option>
                        <option value="Motorised">Motorised</option>
                      </select>
                    </div>

                    <div>
                      <label className="form-label-swagat">
                        Fitting Type{" "}
                        <span style={{ color: "var(--danger)" }}>*</span>
                      </label>
                      <select
                        className="form-select-swagat"
                        value={formData.fitting_type}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            fitting_type: e.target.value,
                          })
                        }
                      >
                        <option value="A Type">A Type</option>
                        <option value="B Type">B Type</option>
                      </select>
                    </div>
                  </div>

                  {/* Rates */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "16px",
                    }}
                  >
                    <div>
                      <label className="form-label-swagat">
                        Rate Per Sq.Ft. (₹)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="form-control-swagat"
                        placeholder="e.g. 250"
                        value={formData.rate_per_sqft}
                        onWheel={(e) => e.target.blur()}
                        onKeyDown={(e) =>
                          (e.key === "ArrowUp" || e.key === "ArrowDown") &&
                          e.preventDefault()
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            rate_per_sqft: e.target.value,
                          })
                        }
                      />
                      {formErrors.rate_per_sqft && (
                        <span
                          style={{
                            fontSize: "12px",
                            color: "var(--danger)",
                            marginTop: "4px",
                            display: "block",
                          }}
                        >
                          {formErrors.rate_per_sqft}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="form-label-swagat">
                        GI Top Cover Rate Per Sq.Ft. (₹)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="form-control-swagat"
                        placeholder="e.g. 80"
                        value={formData.gi_top_cover_rate_per_sqft}
                        onWheel={(e) => e.target.blur()}
                        onKeyDown={(e) =>
                          (e.key === "ArrowUp" || e.key === "ArrowDown") &&
                          e.preventDefault()
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            gi_top_cover_rate_per_sqft: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Dynamic Fields based on Shutter Type */}
                  {formData.shutter_type === "Gear" && (
                    <div
                      style={{
                        backgroundColor: "#FEF3C7",
                        padding: "14px",
                        borderRadius: "6px",
                        border: "1px solid #FDE68A",
                      }}
                    >
                      <label
                        className="form-label-swagat"
                        style={{ color: "#92400E" }}
                      >
                        Gear Price (₹){" "}
                        <span style={{ color: "var(--danger)" }}>*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="form-control-swagat"
                        placeholder="Enter gear price (e.g. 3500)"
                        value={formData.gear_price}
                        onWheel={(e) => e.target.blur()}
                        onKeyDown={(e) =>
                          (e.key === "ArrowUp" || e.key === "ArrowDown") &&
                          e.preventDefault()
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            gear_price: e.target.value,
                          })
                        }
                      />
                    </div>
                  )}

                  {formData.shutter_type === "Motorised" && (
                    <div
                      style={{
                        backgroundColor: "#DBEAFE",
                        padding: "14px",
                        borderRadius: "6px",
                        border: "1px solid #BFDBFE",
                      }}
                    >
                      <label
                        className="form-label-swagat"
                        style={{ color: "#1E40AF" }}
                      >
                        Motor Price (₹){" "}
                        <span style={{ color: "var(--danger)" }}>*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="form-control-swagat"
                        placeholder="Enter motor price (e.g. 15000)"
                        value={formData.motor_price}
                        onWheel={(e) => e.target.blur()}
                        onKeyDown={(e) =>
                          (e.key === "ArrowUp" || e.key === "ArrowDown") &&
                          e.preventDefault()
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            motor_price: e.target.value,
                          })
                        }
                      />
                    </div>
                  )}

                  {/* Dynamic Live Calculation Preview */}
                  {preview && (
                    <div className="calc-preview-box">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: "13px",
                            color: "var(--primary-dark)",
                          }}
                        >
                          Live Shutter Calculation Preview
                        </span>
                        <span
                          style={{
                            fontSize: "12px",
                            color: "var(--text-secondary)",
                          }}
                        >
                          Height: {preview.hFt}' | Width: {preview.wFt}'
                        </span>
                      </div>
                      <div className="calc-preview-grid">
                        <div className="calc-preview-item">
                          <div className="label">Over Height (Feet)</div>
                          <div className="value">{preview.overH}'</div>
                        </div>
                        <div className="calc-preview-item">
                          <div className="label">Over Width (Feet)</div>
                          <div className="value">{preview.overW}'</div>
                        </div>
                        <div className="calc-preview-item">
                          <div className="label">Total sq. ft</div>
                          <div className="value">{preview.totalSqft} sq.ft</div>
                        </div>
                        <div className="calc-preview-item">
                          <div className="label">GI Top Cover in sq. ft</div>
                          <div className="value">{preview.coverSize}'</div>
                        </div>
                        <div className="calc-preview-item">
                          <div className="label">Shutter Basic</div>
                          <div className="value">₹{preview.shutterBasic}</div>
                        </div>
                        <div className="calc-preview-item">
                          <div className="label">GI Top Cover Basic</div>
                          <div className="value">₹{preview.giCoverBasic}</div>
                        </div>
                        <div className="calc-preview-item">
                          <div className="label">Basic Total</div>
                          <div
                            className="value"
                            style={{ color: "var(--success)", fontWeight: 700 }}
                          >
                            ₹{preview.basicTotal}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="form-label-swagat">
                      Remark (Optional)
                    </label>
                    <input
                      type="text"
                      className="form-control-swagat"
                      placeholder="e.g. Heavy duty guide channels"
                      value={formData.remark}
                      onChange={(e) =>
                        setFormData({ ...formData, remark: e.target.value })
                      }
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
                  {submitting
                    ? "Saving..."
                    : selectedShutter
                      ? "Update Shutter"
                      : "Save Shutter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Shutter Details Modal */}
      {isViewOpen && selectedShutter && (
        <div className="modal-overlay">
          <div className="modal-content-swagat modal-lg">
            <div className="modal-header-swagat">
              <h3>View Shutter Catalog Item</h3>
              <button
                className="modal-close-btn"
                onClick={() => setIsViewOpen(false)}
              >
                <FiX />
              </button>
            </div>
            <div className="modal-body-swagat">
              <div style={{ display: "grid", gap: "16px" }}>
                {/* Site & Name */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.2fr 1fr",
                    gap: "16px",
                  }}
                >
                  <div>
                    <label className="form-label-swagat">Belongs to Site</label>
                    <input
                      type="text"
                      className="form-control-swagat"
                      value={
                        selectedShutter.site
                          ? `${selectedShutter.site.siteName}${
                              selectedShutter.site.cityLocation
                                ? ` (${selectedShutter.site.cityLocation})`
                                : ""
                            }${
                              selectedShutter.site.industry?.industryName
                                ? ` - ${selectedShutter.site.industry.industryName}`
                                : ""
                            }`
                          : "N/A"
                      }
                      readOnly
                      disabled
                    />
                  </div>

                  <div>
                    <label className="form-label-swagat">
                      Shutter Name / Number
                    </label>
                    <input
                      type="text"
                      className="form-control-swagat"
                      value={selectedShutter.shutterNameNo || ""}
                      readOnly
                      disabled
                    />
                  </div>
                </div>

                {/* Dimensions */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  <div>
                    <label className="form-label-swagat">
                      Height (Inches)
                    </label>
                    <input
                      type="text"
                      className="form-control-swagat"
                      value={selectedShutter.heightInches || ""}
                      readOnly
                      disabled
                    />
                  </div>

                  <div>
                    <label className="form-label-swagat">Width (Inches)</label>
                    <input
                      type="text"
                      className="form-control-swagat"
                      value={selectedShutter.widthInches || ""}
                      readOnly
                      disabled
                    />
                  </div>
                </div>

                {/* Shutter Type & Fitting Type */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  <div>
                    <label className="form-label-swagat">Shutter Type</label>
                    <input
                      type="text"
                      className="form-control-swagat"
                      value={selectedShutter.shutterType || ""}
                      readOnly
                      disabled
                    />
                  </div>

                  <div>
                    <label className="form-label-swagat">Fitting Type</label>
                    <input
                      type="text"
                      className="form-control-swagat"
                      value={selectedShutter.fittingType || ""}
                      readOnly
                      disabled
                    />
                  </div>
                </div>

                {/* Rates */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  <div>
                    <label className="form-label-swagat">
                      Rate Per Sq.Ft. (₹)
                    </label>
                    <input
                      type="text"
                      className="form-control-swagat"
                      value={selectedShutter.ratePerSqft || "0"}
                      readOnly
                      disabled
                    />
                  </div>

                  <div>
                    <label className="form-label-swagat">
                      GI Top Cover Rate Per Sq.Ft. (₹)
                    </label>
                    <input
                      type="text"
                      className="form-control-swagat"
                      value={selectedShutter.giTopCoverRatePerSqft || "0"}
                      readOnly
                      disabled
                    />
                  </div>
                </div>

                {/* Dynamic Fields based on Shutter Type */}
                {selectedShutter.shutterType === "Gear" && (
                  <div
                    style={{
                      backgroundColor: "#FEF3C7",
                      padding: "14px",
                      borderRadius: "6px",
                      border: "1px solid #FDE68A",
                    }}
                  >
                    <label
                      className="form-label-swagat"
                      style={{ color: "#92400E" }}
                    >
                      Gear Price (₹)
                    </label>
                    <input
                      type="text"
                      className="form-control-swagat"
                      value={selectedShutter.gearPrice || "0"}
                      readOnly
                      disabled
                    />
                  </div>
                )}

                {selectedShutter.shutterType === "Motorised" && (
                  <div
                    style={{
                      backgroundColor: "#DBEAFE",
                      padding: "14px",
                      borderRadius: "6px",
                      border: "1px solid #BFDBFE",
                    }}
                  >
                    <label
                      className="form-label-swagat"
                      style={{ color: "#1E40AF" }}
                    >
                      Motor Price (₹)
                    </label>
                    <input
                      type="text"
                      className="form-control-swagat"
                      value={selectedShutter.motorPrice || "0"}
                      readOnly
                      disabled
                    />
                  </div>
                )}

                {/* Live Shutter Calculation Preview */}
                {(() => {
                  const viewPreview = computeShutterPreviewFromObj(selectedShutter);
                  if (!viewPreview) return null;
                  return (
                    <div className="calc-preview-box">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: "13px",
                            color: "var(--primary-dark)",
                          }}
                        >
                          Live Shutter Calculation Preview
                        </span>
                        <span
                          style={{
                            fontSize: "12px",
                            color: "var(--text-secondary)",
                          }}
                        >
                          Height: {viewPreview.hFt}' | Width: {viewPreview.wFt}'
                        </span>
                      </div>
                      <div className="calc-preview-grid">
                        <div className="calc-preview-item">
                          <div className="label">Over Height (Feet)</div>
                          <div className="value">{viewPreview.overH}'</div>
                        </div>
                        <div className="calc-preview-item">
                          <div className="label">Over Width (Feet)</div>
                          <div className="value">{viewPreview.overW}'</div>
                        </div>
                        <div className="calc-preview-item">
                          <div className="label">Total sq. ft</div>
                          <div className="value">{viewPreview.totalSqft} sq.ft</div>
                        </div>
                        <div className="calc-preview-item">
                          <div className="label">GI Top Cover in sq. ft</div>
                          <div className="value">{viewPreview.coverSize}'</div>
                        </div>
                        <div className="calc-preview-item">
                          <div className="label">Shutter Basic</div>
                          <div className="value">₹{viewPreview.shutterBasic}</div>
                        </div>
                        <div className="calc-preview-item">
                          <div className="label">GI Top Cover Basic</div>
                          <div className="value">₹{viewPreview.giCoverBasic}</div>
                        </div>
                        <div className="calc-preview-item">
                          <div className="label">Basic Total</div>
                          <div
                            className="value"
                            style={{ color: "var(--success)", fontWeight: 700 }}
                          >
                            ₹{viewPreview.basicTotal}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div>
                  <label className="form-label-swagat">Remark (Optional)</label>
                  <input
                    type="text"
                    className="form-control-swagat"
                    value={selectedShutter.remark || ""}
                    placeholder="No remark"
                    readOnly
                    disabled
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer-swagat">
              <button
                className="btn-outline-swagat"
                onClick={() => setIsViewOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        title="Delete Shutter Catalog Item?"
        message={`Are you sure you want to delete "${selectedShutter?.shutterNameNo}"?`}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </AppLayout>
  );
}

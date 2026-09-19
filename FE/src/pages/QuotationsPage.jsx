import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout, { useToast } from "../components/Layout/AppLayout";
import { api } from "../services/api";
import ConfirmModal from "../components/UI/ConfirmModal";
import QuotationPDFModal from "../components/UI/QuotationPDFModal";
import {
  FiPlus,
  FiSearch,
  FiTrash2,
  FiEye,
  FiEdit2,
  FiX,
  FiFileText,
  FiUsers,
  FiBriefcase,
  FiMapPin,
  FiCalendar,
  FiFilter,
  FiRefreshCw,
  FiPrinter,
  FiSliders,
  FiCreditCard,
} from "react-icons/fi";
import ActionButtons, { ActionButton, ActionButtonsGroup } from "../components/UI/ActionButtons";


export default function QuotationsPage() {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [sites, setSites] = useState([]);
  const [availableShutters, setAvailableShutters] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [isPDFOpen, setIsPDFOpen] = useState(false);
  const [pdfQuotationId, setPdfQuotationId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    customer_id: "",
    industry_id: "",
    site_id: "",
    transportation_charges: "0",
    additional_charges: [],
    discount_amount: "0",
    discount_reason: "",
    gst_applicable: true,
    gst_percent: 18,
    remark: "",
  });

  // Selected & Custom Item Snapshots for Quotation Creation / Editing
  const [selectedShutterIds, setSelectedShutterIds] = useState([]);
  const [quotationItems, setQuotationItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Custom Shutter Modal State for Quotations
  const [isCustomShutterModalOpen, setIsCustomShutterModalOpen] =
    useState(false);
  const [customShutterForm, setCustomShutterForm] = useState({
    shutter_name_no: "",
    height_inches: "",
    width_inches: "",
    shutter_type: "Manual",
    fitting_type: "A Type",
    rate_per_sqft: "",
    gi_top_cover_rate_per_sqft: "",
    gear_price: "",
    motor_price: "",
  });

  // Additional Charges Helper Handlers (Phase 7)
  const handleAddAdditionalCharge = (presetDescription = "") => {
    setFormData((prev) => ({
      ...prev,
      additional_charges: [
        ...(prev.additional_charges || []),
        {
          id: Date.now() + Math.random(),
          description: presetDescription,
          amount: "",
          charge_type: "Quotation-wise",
          remark: "",
        },
      ],
    }));
  };

  const handleRemoveAdditionalCharge = (index) => {
    setFormData((prev) => ({
      ...prev,
      additional_charges: (prev.additional_charges || []).filter(
        (_, i) => i !== index,
      ),
    }));
  };

  const handleAdditionalChargeChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...(prev.additional_charges || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, additional_charges: updated };
    });
  };
  const [customShutterErrors, setCustomShutterErrors] = useState({});

  // Edit Shutter Item Modal State for Quotations
  const [isEditShutterModalOpen, setIsEditShutterModalOpen] = useState(false);
  const [editingShutterIndex, setEditingShutterIndex] = useState(null);
  const [editShutterForm, setEditShutterForm] = useState({
    shutter_name_no: "",
    height_inches: "",
    width_inches: "",
    shutter_type: "Manual",
    fitting_type: "A Type",
    rate_per_sqft: "",
    gi_top_cover_rate_per_sqft: "",
    gear_price: "",
    motor_price: "",
  });
  const [editShutterErrors, setEditShutterErrors] = useState({});

  const { addToast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [quotList, custs] = await Promise.all([
        api.getQuotations(search, "", "", "", startDate, endDate),
        api.getCustomers(),
      ]);
      setQuotations(quotList);
      setCustomers(custs);
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
  }, [search, startDate, endDate]);

  // Handle Customer change -> load filtered industries
  const handleCustomerChange = async (customerId) => {
    setFormData((prev) => ({
      ...prev,
      customer_id: customerId,
      industry_id: "",
      site_id: "",
    }));
    setIndustries([]);
    setSites([]);
    setAvailableShutters([]);
    setSelectedShutterIds([]);
    setQuotationItems([]);

    if (customerId) {
      try {
        const indList = await api.getIndustries(customerId);
        setIndustries(indList);
      } catch (err) {
        addToast(err.message, "error");
      }
    }
  };

  // Handle Industry change -> load filtered sites
  const handleIndustryChange = async (industryId) => {
    setFormData((prev) => ({
      ...prev,
      industry_id: industryId,
      site_id: "",
    }));
    setSites([]);
    setAvailableShutters([]);
    setSelectedShutterIds([]);
    setQuotationItems([]);

    if (industryId) {
      try {
        const siteList = await api.getSites(industryId);
        setSites(siteList);
      } catch (err) {
        addToast(err.message, "error");
      }
    }
  };

  // Handle Site change -> load shutters
  const handleSiteChange = async (siteId) => {
    setFormData((prev) => ({
      ...prev,
      site_id: siteId,
    }));
    setAvailableShutters([]);
    setSelectedShutterIds([]);
    setQuotationItems([]);

    if (siteId) {
      try {
        const shtList = await api.getShutters(siteId);
        setAvailableShutters(shtList);
      } catch (err) {
        addToast(err.message, "error");
      }
    }
  };

  // Open Create Modal
  const openAddModal = () => {
    setSelectedQuotation(null);
    setFormData({
      customer_id: "",
      industry_id: "",
      site_id: "",
      transportation_charges: "0",
      additional_charges: [],
      discount_amount: "0",
      discount_reason: "",
      gst_applicable: true,
      gst_percent: 18,
      remark: "",
    });
    setIndustries([]);
    setSites([]);
    setAvailableShutters([]);
    setSelectedShutterIds([]);
    setQuotationItems([]);
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Open Edit Modal (Phase 6 Requirement)
  const openEditModal = async (quot) => {
    try {
      setLoading(true);
      const full = await api.getQuotationById(quot.id);
      setSelectedQuotation(full);

      // Load cascading dropdown options for customer, industry, site
      const custId = String(full.customerId);
      const indId = full.industryId ? String(full.industryId) : "";
      const stId = full.siteId ? String(full.siteId) : "";

      if (custId) {
        const indList = await api.getIndustries(custId);
        setIndustries(indList);
      }
      if (indId) {
        const siteList = await api.getSites(indId);
        setSites(siteList);
      }
      if (stId) {
        const shtList = await api.getShutters(stId);
        setAvailableShutters(shtList);
      }

      setFormData({
        customer_id: custId,
        industry_id: indId,
        site_id: stId,
        transportation_charges: String(full.transportationCharges || 0),
        additional_charges: (full.additionalCharges || []).map((c) => ({
          id: c.id,
          description: c.description || "",
          amount: String(c.amount || ""),
          charge_type: c.chargeType || c.charge_type || "Quotation-wise",
          remark: c.remark || "",
        })),
        discount_amount: String(full.discountAmount || 0),
        discount_reason: full.discountReason || "",
        gst_applicable: Boolean(full.gstApplicable),
        gst_percent: Number(full.gstPercent) || 18,
        remark: full.remark || "",
      });

      // Populate quotation items from stored snapshot items
      const loadedItems = full.items.map((it) => ({
        shutter_id: it.shutterId,
        shutter_name_no: it.shutterNameNo || `Shutter ${it.srNo}`,
        height_inches: Number(it.heightInches),
        width_inches: Number(it.widthInches),
        shutter_type: it.shutterType,
        fitting_type: it.fittingType,
        rate_per_sqft: Number(it.ratePerSqft),
        gi_top_cover_rate_per_sqft: Number(it.giTopCoverRatePerSqft),
        gear_price: Number(it.gearPrice),
        motor_price: Number(it.motorPrice),
      }));

      setQuotationItems(loadedItems);
      setSelectedShutterIds(
        loadedItems.filter((i) => i.shutter_id).map((i) => i.shutter_id),
      );
      setFormErrors({});
      setIsFormOpen(true);
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const openViewModal = async (quot) => {
    try {
      const full = await api.getQuotationById(quot.id);
      setSelectedQuotation(full);
      setIsViewOpen(true);
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const openPDFModal = (quot) => {
    setPdfQuotationId(quot.id);
    setIsPDFOpen(true);
  };

  const openDeleteModal = (quot) => {
    setSelectedQuotation(quot);
    setIsDeleteOpen(true);
  };

  // Toggle Shutter Selection
  const toggleSelectShutter = (sht) => {
    if (selectedShutterIds.includes(sht.id)) {
      setSelectedShutterIds(selectedShutterIds.filter((id) => id !== sht.id));
      setQuotationItems(
        quotationItems.filter((it) => it.shutter_id !== sht.id),
      );
    } else {
      setSelectedShutterIds([...selectedShutterIds, sht.id]);
      const newItem = {
        shutter_id: sht.id,
        shutter_name_no: sht.shutterNameNo,
        height_inches: sht.heightInches,
        width_inches: sht.widthInches,
        shutter_type: sht.shutterType,
        fitting_type: sht.fittingType,
        rate_per_sqft: sht.ratePerSqft,
        gi_top_cover_rate_per_sqft: sht.giTopCoverRatePerSqft,
        gear_price: sht.gearPrice,
        motor_price: sht.motorPrice,
      };
      setQuotationItems([...quotationItems, newItem]);
    }
  };

  // Toggle Select All Shutters
  const toggleSelectAllShutters = () => {
    if (selectedShutterIds.length === availableShutters.length) {
      setSelectedShutterIds([]);
      setQuotationItems([]);
    } else {
      const allIds = availableShutters.map((s) => s.id);
      setSelectedShutterIds(allIds);
      const allItems = availableShutters.map((sht) => ({
        shutter_id: sht.id,
        shutter_name_no: sht.shutterNameNo,
        height_inches: sht.heightInches,
        width_inches: sht.widthInches,
        shutter_type: sht.shutterType,
        fitting_type: sht.fittingType,
        rate_per_sqft: sht.ratePerSqft,
        gi_top_cover_rate_per_sqft: sht.giTopCoverRatePerSqft,
        gear_price: sht.gearPrice,
        motor_price: sht.motorPrice,
      }));
      setQuotationItems(allItems);
    }
  };

  // Helper rounding
  const round2 = (num) =>
    Math.round((Number(num) + Number.EPSILON) * 100) / 100;

  // Open Add Custom Shutter Modal
  const openCustomShutterModal = () => {
    setCustomShutterForm({
      shutter_name_no: `Custom Shutter ${quotationItems.length + 1}`,
      height_inches: "",
      width_inches: "",
      shutter_type: "Manual",
      fitting_type: "A Type",
      rate_per_sqft: "",
      gi_top_cover_rate_per_sqft: "",
      gear_price: "",
      motor_price: "",
    });
    setCustomShutterErrors({});
    setIsCustomShutterModalOpen(true);
  };

  const computeCustomShutterPreview = () => {
    const hIn = parseFloat(customShutterForm.height_inches) || 0;
    const wIn = parseFloat(customShutterForm.width_inches) || 0;
    const type = customShutterForm.shutter_type || "Manual";
    const rate = parseFloat(customShutterForm.rate_per_sqft) || 0;
    const giRate =
      parseFloat(customShutterForm.gi_top_cover_rate_per_sqft) || 0;
    const gear =
      type === "Gear" ? parseFloat(customShutterForm.gear_price) || 0 : 0;
    const motor =
      type === "Motorised" ? parseFloat(customShutterForm.motor_price) || 0 : 0;

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
      totalSqft * rate +
        (type === "Gear" ? gear : type === "Motorised" ? motor : 0),
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

  const customPreview = computeCustomShutterPreview();

  const handleAddCustomShutterSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    if (
      !customShutterForm.shutter_name_no ||
      !customShutterForm.shutter_name_no.trim()
    ) {
      errors.shutter_name_no = "Shutter name / number is required";
    }
    const h = parseFloat(customShutterForm.height_inches);
    if (isNaN(h) || h <= 0) {
      errors.height_inches = "Height must be a positive number (> 0)";
    }
    const w = parseFloat(customShutterForm.width_inches);
    if (isNaN(w) || w <= 0) {
      errors.width_inches = "Width must be a positive number (> 0)";
    }
    if (customShutterForm.shutter_type === "Gear") {
      const g = parseFloat(customShutterForm.gear_price);
      if (isNaN(g) || g < 0)
        errors.gear_price = "Gear price cannot be negative";
    }
    if (customShutterForm.shutter_type === "Motorised") {
      const m = parseFloat(customShutterForm.motor_price);
      if (isNaN(m) || m < 0)
        errors.motor_price = "Motor price cannot be negative";
    }

    setCustomShutterErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const newItem = {
      shutter_id: null,
      shutter_name_no: customShutterForm.shutter_name_no.trim(),
      height_inches: parseFloat(customShutterForm.height_inches),
      width_inches: parseFloat(customShutterForm.width_inches),
      shutter_type: customShutterForm.shutter_type,
      fitting_type: customShutterForm.fitting_type,
      rate_per_sqft: parseFloat(customShutterForm.rate_per_sqft) || 0,
      gi_top_cover_rate_per_sqft:
        parseFloat(customShutterForm.gi_top_cover_rate_per_sqft) || 0,
      gear_price:
        customShutterForm.shutter_type === "Gear"
          ? parseFloat(customShutterForm.gear_price) || 0
          : 0,
      motor_price:
        customShutterForm.shutter_type === "Motorised"
          ? parseFloat(customShutterForm.motor_price) || 0
          : 0,
    };

    setQuotationItems([...quotationItems, newItem]);
    setIsCustomShutterModalOpen(false);
  };

  // Open Edit Shutter Modal
  const handleOpenEditShutterModal = (index) => {
    const item = quotationItems[index];
    if (!item) return;
    setEditingShutterIndex(index);
    setEditShutterForm({
      shutter_name_no: item.shutter_name_no || "",
      height_inches: String(item.height_inches || ""),
      width_inches: String(item.width_inches || ""),
      shutter_type: item.shutter_type || "Manual",
      fitting_type: item.fitting_type || "A Type",
      rate_per_sqft: String(item.rate_per_sqft || ""),
      gi_top_cover_rate_per_sqft: String(item.gi_top_cover_rate_per_sqft || ""),
      gear_price: String(item.gear_price || 0),
      motor_price: String(item.motor_price || 0),
    });
    setEditShutterErrors({});
    setIsEditShutterModalOpen(true);
  };

  const computeEditShutterPreview = () => {
    const hIn = parseFloat(editShutterForm.height_inches) || 0;
    const wIn = parseFloat(editShutterForm.width_inches) || 0;
    const type = editShutterForm.shutter_type || "Manual";
    const rate = parseFloat(editShutterForm.rate_per_sqft) || 0;
    const giRate = parseFloat(editShutterForm.gi_top_cover_rate_per_sqft) || 0;
    const gear =
      type === "Gear" ? parseFloat(editShutterForm.gear_price) || 0 : 0;
    const motor =
      type === "Motorised" ? parseFloat(editShutterForm.motor_price) || 0 : 0;

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
      totalSqft * rate +
        (type === "Gear" ? gear : type === "Motorised" ? motor : 0),
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

  const editPreview = computeEditShutterPreview();

  const handleSaveEditShutterSubmit = (e) => {
    e.preventDefault();
    if (editingShutterIndex === null) return;

    const errors = {};
    if (
      !editShutterForm.shutter_name_no ||
      !editShutterForm.shutter_name_no.trim()
    ) {
      errors.shutter_name_no = "Shutter name / number is required";
    }
    const h = parseFloat(editShutterForm.height_inches);
    if (isNaN(h) || h <= 0) {
      errors.height_inches = "Height must be a positive number (> 0)";
    }
    const w = parseFloat(editShutterForm.width_inches);
    if (isNaN(w) || w <= 0) {
      errors.width_inches = "Width must be a positive number (> 0)";
    }
    if (editShutterForm.shutter_type === "Gear") {
      const g = parseFloat(editShutterForm.gear_price);
      if (isNaN(g) || g < 0)
        errors.gear_price = "Gear price cannot be negative";
    }
    if (editShutterForm.shutter_type === "Motorised") {
      const m = parseFloat(editShutterForm.motor_price);
      if (isNaN(m) || m < 0)
        errors.motor_price = "Motor price cannot be negative";
    }

    setEditShutterErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const updatedItems = [...quotationItems];
    updatedItems[editingShutterIndex] = {
      ...updatedItems[editingShutterIndex],
      shutter_name_no: editShutterForm.shutter_name_no.trim(),
      height_inches: parseFloat(editShutterForm.height_inches),
      width_inches: parseFloat(editShutterForm.width_inches),
      shutter_type: editShutterForm.shutter_type,
      fitting_type: editShutterForm.fitting_type,
      rate_per_sqft: parseFloat(editShutterForm.rate_per_sqft) || 0,
      gi_top_cover_rate_per_sqft:
        parseFloat(editShutterForm.gi_top_cover_rate_per_sqft) || 0,
      gear_price:
        editShutterForm.shutter_type === "Gear"
          ? parseFloat(editShutterForm.gear_price) || 0
          : 0,
      motor_price:
        editShutterForm.shutter_type === "Motorised"
          ? parseFloat(editShutterForm.motor_price) || 0
          : 0,
    };

    setQuotationItems(updatedItems);
    setIsEditShutterModalOpen(false);
    setEditingShutterIndex(null);
  };

  // Remove item row
  const removeQuotationItem = (index) => {
    const itemToRemove = quotationItems[index];
    if (itemToRemove && itemToRemove.shutter_id) {
      setSelectedShutterIds(
        selectedShutterIds.filter((id) => id !== itemToRemove.shutter_id),
      );
    }
    setQuotationItems(quotationItems.filter((_, idx) => idx !== index));
  };

  // Update item field in wizard
  const updateQuotationItemField = (index, field, value) => {
    const updated = [...quotationItems];
    updated[index] = { ...updated[index], [field]: value };
    setQuotationItems(updated);
  };

  // Compute live calculations for quotation preview
  const computeLiveSummary = () => {
    let shutterBasicTotal = 0;
    let giTopCoverTotal = 0;
    let totalCoverRft = 0;

    const processedItems = quotationItems.map((item, idx) => {
      const hIn = parseFloat(item.height_inches) || 0;
      const wIn = parseFloat(item.width_inches) || 0;
      const type = item.shutter_type || "Manual";
      const rate = parseFloat(item.rate_per_sqft) || 0;
      const giRate = parseFloat(item.gi_top_cover_rate_per_sqft) || 0;
      const gear = type === "Gear" ? parseFloat(item.gear_price) || 0 : 0;
      const motor =
        type === "Motorised" ? parseFloat(item.motor_price) || 0 : 0;

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
        totalSqft * rate +
          (type === "Gear" ? gear : type === "Motorised" ? motor : 0),
      );
      const giTopCoverBasic = round2(coverSize * giRate);
      const basicTotal = round2(shutterBasic + giTopCoverBasic);

      shutterBasicTotal = round2(shutterBasicTotal + shutterBasic);
      giTopCoverTotal = round2(giTopCoverTotal + giTopCoverBasic);
      totalCoverRft = round2(totalCoverRft + coverSize);

      return {
        ...item,
        srNo: idx + 1,
        hFt,
        wFt,
        overH,
        overW,
        totalSqft,
        coverSize,
        shutterBasic,
        giTopCoverBasic,
        basicTotal,
      };
    });

    const transportation = round2(
      parseFloat(formData.transportation_charges) || 0,
    );
    const discount = 0;

    let addlTotal = 0;
    formData.additional_charges.forEach((chg) => {
      addlTotal = round2(addlTotal + (parseFloat(chg.amount) || 0));
    });

    const totalBasic = round2(
      shutterBasicTotal +
        giTopCoverTotal +
        transportation +
        addlTotal -
        discount,
    );
    const gstAmount = formData.gst_applicable
      ? round2((totalBasic * (formData.gst_percent || 18)) / 100)
      : 0;
    const finalTotal = round2(totalBasic + gstAmount);

    return {
      processedItems,
      shutterBasicTotal,
      giTopCoverTotal,
      totalCoverRft: round2(totalCoverRft),
      transportation,
      addlTotal,
      discount,
      totalBasic,
      gstAmount,
      finalTotal,
    };
  };

  const summaryPreview = computeLiveSummary();

  const validateForm = () => {
    const errors = {};
    if (!formData.customer_id) errors.customer_id = "Please select a Customer";
    if (!formData.site_id) errors.site_id = "Please select a Site";
    if (quotationItems.length === 0)
      errors.items = "Select or add at least one shutter for the quotation";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveQuotation = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const payload = {
        customer_id: parseInt(formData.customer_id, 10),
        industry_id: formData.industry_id
          ? parseInt(formData.industry_id, 10)
          : null,
        site_id: formData.site_id ? parseInt(formData.site_id, 10) : null,
        transportation_charges:
          parseFloat(formData.transportation_charges) || 0,
        additional_charges: (formData.additional_charges || []).map((chg) => ({
          description: chg.description ? chg.description.trim() : "",
          amount: parseFloat(chg.amount) || 0,
          charge_type: chg.charge_type || chg.chargeType || "Quotation-wise",
          remark: chg.remark ? chg.remark.trim() : "",
        })),
        discount_amount: 0,
        discount_reason: "",
        gst_applicable: Boolean(formData.gst_applicable),
        gst_percent: parseFloat(formData.gst_percent) || 18,
        remark: formData.remark,
        items: quotationItems.map((it, idx) => ({
          shutter_id: it.shutter_id || null,
          sr_no: idx + 1,
          shutter_name_no: it.shutter_name_no,
          height_inches: parseFloat(it.height_inches) || 0,
          width_inches: parseFloat(it.width_inches) || 0,
          shutter_type: it.shutter_type,
          fitting_type: it.fitting_type,
          rate_per_sqft: parseFloat(it.rate_per_sqft) || 0,
          gi_top_cover_rate_per_sqft:
            parseFloat(it.gi_top_cover_rate_per_sqft) || 0,
          gear_price: parseFloat(it.gear_price) || 0,
          motor_price: parseFloat(it.motor_price) || 0,
        })),
      };

      if (selectedQuotation) {
        // Edit Quotation (Phase 6)
        await api.updateQuotation(selectedQuotation.id, payload);
        addToast(
          `Quotation #${selectedQuotation.quotationNo} updated successfully`,
          "success",
        );
      } else {
        // Create Quotation (Phase 5)
        await api.createQuotation(payload);
        addToast("Quotation created successfully", "success");
      }
      setIsFormOpen(false);
      loadData();
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuotation = async () => {
    try {
      await api.deleteQuotation(selectedQuotation.id);
      addToast("Quotation deleted successfully", "success");
      setIsDeleteOpen(false);
      loadData();
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const resetFilters = () => {
    setSearch("");
    setStartDate("");
    setEndDate("");
  };

  return (
    <AppLayout title="Quotations Management & Editing">
      {/* Breadcrumb Header */}
      <div className="breadcrumb-flow">
        <span className="breadcrumb-item active">
          <FiFileText /> 6. Quotation Editing & Multi-Parameter Search
        </span>
      </div>

      <div className="erp-card">
        <div
          className="erp-card-header"
          style={{
            flexDirection: "column",
            alignItems: "stretch",
            gap: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <h2 className="erp-card-title">
              <FiFileText style={{ color: "var(--primary)" }} />
              Quotations Catalog ({quotations.length})
            </h2>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button className="btn-accent-swagat" onClick={openAddModal}>
                <FiPlus /> Create Quotation
              </button>
            </div>
          </div>

          {/* Search & Multi-parameter Filters */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr auto",
              gap: "12px",
              alignItems: "center",
              backgroundColor: "#F8FAFC",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #E2E8F0",
            }}
          >
            {/* Search Input */}
            <div className="search-input-wrapper">
              <FiSearch className="search-icon" />
              <input
                type="text"
                className="form-control-swagat"
                placeholder="Search by Quotation No, Customer, Mobile, Industry, Date (e.g. 16/09/2026)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Date Range Start */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <FiCalendar style={{ color: "var(--text-secondary)" }} />
              <input
                type="date"
                className="form-control-swagat"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                title="Start Date"
              />
            </div>

            {/* Date Range End */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <FiCalendar style={{ color: "var(--text-secondary)" }} />
              <input
                type="date"
                className="form-control-swagat"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                title="End Date"
              />
            </div>

            {/* Reset Filters */}
            {(search || startDate || endDate) && (
              <button
                className="btn-outline-swagat"
                style={{ padding: "8px 12px" }}
                onClick={resetFilters}
                title="Reset Search & Filters"
              >
                <FiRefreshCw /> Reset
              </button>
            )}
          </div>
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
              Loading quotations...
            </div>
          ) : quotations.length === 0 ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "var(--text-secondary)",
              }}
            >
              {search || startDate || endDate
                ? "No quotations match your search criteria."
                : 'No quotations generated yet. Click "Create Quotation" to add one.'}
            </div>
          ) : (
            <table className="erp-table">
              <thead>
                <tr>
                  <th style={{ width: "40px" }}>Sr.</th>
                  <th>Quotation No.</th>
                  <th>Date</th>
                  <th>Customer Name</th>
                  <th>Industry / Company</th>
                  <th>Site Location</th>
                  <th>Total Amount</th>
                  <th>GST</th>
                  <th style={{ width: "160px", textAlign: "right" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {quotations.map((q, idx) => (
                  <tr key={q.id}>
                    <td>{idx + 1}</td>
                    <td
                      style={{ fontWeight: 700, color: "var(--primary-dark)" }}
                    >
                      {q.quotationNo}
                    </td>
                    <td>
                      {new Date(q.quotationDate).toLocaleDateString("en-IN")}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {q.customer?.customerName}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        📱 {q.customer?.mobileNumber}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>
                        {q.industry?.industryName || "N/A"}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>
                        {q.site?.siteName || "N/A"}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        📍 {q.site?.cityLocation || ""}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: "var(--success)", fontSize: "14px" }}>
                        ₹{Number(q.finalTotal).toFixed(2)}
                      </div>
                      <div style={{ fontSize: "11px", marginTop: "3px" }}>
                        {Number(q.pendingAmount || 0) <= 0 ? (
                          <span style={{ color: "#059669", fontWeight: 700, backgroundColor: "#ECFDF5", padding: "1px 6px", borderRadius: "4px", border: "1px solid #A7F3D0" }}>
                            Paid Full
                          </span>
                        ) : (
                          <span style={{ color: "#D97706", fontWeight: 600 }}>
                            Paid: ₹{Number(q.totalPaid || 0).toFixed(0)} | Pend: ₹{Number(q.pendingAmount || 0).toFixed(0)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge-swagat ${q.gstApplicable ? "badge-gst-yes" : "badge-gst-no"}`}
                        style={{
                          fontWeight: 600,
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          display: "inline-block",
                          border: q.gstApplicable ? "1px solid #A7F3D0" : "1px solid #CBD5E1",
                        }}
                      >
                        {q.gstApplicable
                          ? `GST 18% (₹${Number(q.gstAmount || 0).toFixed(2)})`
                          : "No GST"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <ActionButtons
                        onView={() => openViewModal(q)}
                        viewTitle="View Quotation"
                        onEdit={() => openEditModal(q)}
                        editTitle="Edit Quotation"
                        onDelete={() => openDeleteModal(q)}
                        deleteTitle="Delete Quotation"
                      >
                        <ActionButton
                          variant="success"
                          icon={<FiCreditCard />}
                          title="View & Record Payments"
                          onClick={() => navigate(`/payments?quotationId=${q.id}`)}
                        />
                      </ActionButtons>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* CREATE / EDIT QUOTATION WIZARD MODAL */}
      {isFormOpen && (
        <div className="modal-overlay">
          <div className="modal-content-swagat modal-xl">
            <div className="modal-header-swagat">
              <h3>
                <FiFileText style={{ color: "var(--primary)" }} />
                {selectedQuotation
                  ? `Edit Quotation #${selectedQuotation.quotationNo}`
                  : "Create New Quotation"}
              </h3>
              <button
                className="modal-close-btn"
                onClick={() => setIsFormOpen(false)}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSaveQuotation}>
              <div
                className="modal-body-swagat"
                style={{ maxHeight: "75vh", overflowY: "auto" }}
              >
                {/* Cascading Selectors */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "16px",
                    marginBottom: "20px",
                  }}
                >
                  {/* Select Customer */}
                  <div>
                    <label className="form-label-swagat">
                      1. Customer{" "}
                      <span style={{ color: "var(--danger)" }}>*</span>
                    </label>
                    <select
                      className="form-select-swagat"
                      disabled={Boolean(selectedQuotation)}
                      value={formData.customer_id}
                      onChange={(e) => handleCustomerChange(e.target.value)}
                    >
                      <option value="">Choose Customer...</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.customerName} ({c.mobileNumber})
                        </option>
                      ))}
                    </select>
                    {formErrors.customer_id && (
                      <span
                        style={{
                          fontSize: "12px",
                          color: "var(--danger)",
                          marginTop: "4px",
                          display: "block",
                        }}
                      >
                        {formErrors.customer_id}
                      </span>
                    )}
                  </div>

                  {/* Select Industry */}
                  <div>
                    <label className="form-label-swagat">
                      2. Industry / Company
                    </label>
                    <select
                      className="form-select-swagat"
                      disabled={
                        Boolean(selectedQuotation) || !formData.customer_id
                      }
                      value={formData.industry_id}
                      onChange={(e) => handleIndustryChange(e.target.value)}
                    >
                      <option value="">Choose Industry...</option>
                      {industries.map((ind) => (
                        <option key={ind.id} value={ind.id}>
                          {ind.industryName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select Site */}
                  <div>
                    <label className="form-label-swagat">
                      3. Site / Location{" "}
                      <span style={{ color: "var(--danger)" }}>*</span>
                    </label>
                    <select
                      className="form-select-swagat"
                      disabled={
                        Boolean(selectedQuotation) || !formData.industry_id
                      }
                      value={formData.site_id}
                      onChange={(e) => handleSiteChange(e.target.value)}
                    >
                      <option value="">Choose Site...</option>
                      {sites.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.siteName} ({st.cityLocation})
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
                </div>

                {/* Shutter Selection Master Table (for new item selection) */}
                {formData.site_id &&
                  availableShutters.length > 0 &&
                  !selectedQuotation && (
                    <div style={{ marginBottom: "24px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "10px",
                        }}
                      >
                        <h4
                          style={{
                            fontSize: "14px",
                            fontWeight: 700,
                            margin: 0,
                            color: "var(--primary-dark)",
                          }}
                        >
                          Select Shutters from Master Catalog (
                          {availableShutters.length} Available)
                        </h4>
                        <button
                          type="button"
                          className="btn-outline-swagat"
                          style={{ padding: "4px 12px", fontSize: "12px" }}
                          onClick={toggleSelectAllShutters}
                        >
                          {selectedShutterIds.length ===
                          availableShutters.length
                            ? "Deselect All"
                            : "Select All Shutters"}
                        </button>
                      </div>

                      <div
                        style={{
                          border: "1px solid #E2E8F0",
                          borderRadius: "6px",
                          overflowX: "auto",
                        }}
                      >
                        <table
                          className="erp-table"
                          style={{ fontSize: "12px" }}
                        >
                          <thead>
                            <tr style={{ backgroundColor: "#F1F5F9" }}>
                              <th
                                style={{ width: "40px", textAlign: "center" }}
                              >
                                Select
                              </th>
                              <th style={{ minWidth: "120px" }}>
                                Shutter Name / No
                              </th>
                              <th>Height (in)</th>
                              <th>Width (in)</th>
                              <th>Type</th>
                              <th>Fitting</th>
                              <th>Over H × W</th>
                              <th>Shutter Sqft</th>
                              <th>GI Cover R.Ft</th>
                              <th>Rate/Sqft</th>
                              <th>GI Cover Rate</th>
                              <th>Gear/Motor Price</th>
                              <th style={{ backgroundColor: "#F8FAFC", color: "var(--primary-dark)" }}>
                                Basic Total (No Cover)
                              </th>
                              <th style={{ backgroundColor: "#F8FAFC", color: "#0284C7" }}>
                                GI Cover Total
                              </th>
                              <th style={{ backgroundColor: "#ECFDF5", color: "var(--success)", fontWeight: 800 }}>
                                Shutter Price (Basic + Cover)
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {availableShutters.map((sht) => {
                              const isChecked = selectedShutterIds.includes(
                                sht.id,
                              );
                              const hIn = parseFloat(sht.heightInches) || 0;
                              const wIn = parseFloat(sht.widthInches) || 0;
                              const type = sht.shutterType || "Manual";
                              const rate = parseFloat(sht.ratePerSqft) || 0;
                              const giRate =
                                parseFloat(sht.giTopCoverRatePerSqft) || 0;
                              const gear =
                                type === "Gear"
                                  ? parseFloat(sht.gearPrice) || 0
                                  : 0;
                              const motor =
                                type === "Motorised"
                                  ? parseFloat(sht.motorPrice) || 0
                                  : 0;

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
                                totalSqft * rate +
                                  (type === "Gear"
                                    ? gear
                                    : type === "Motorised"
                                      ? motor
                                      : 0),
                              );
                              const giTopCoverBasic = round2(
                                coverSize * giRate,
                              );
                              const basicTotal = round2(
                                shutterBasic + giTopCoverBasic,
                              );

                              return (
                                <tr
                                  key={sht.id}
                                  style={{
                                    backgroundColor: isChecked
                                      ? "#F0F9FF"
                                      : "transparent",
                                  }}
                                >
                                  <td style={{ textAlign: "center" }}>
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => toggleSelectShutter(sht)}
                                      style={{
                                        cursor: "pointer",
                                        width: "16px",
                                        height: "16px",
                                      }}
                                    />
                                  </td>
                                  <td style={{ fontWeight: 600 }}>
                                    {sht.shutterNameNo}
                                  </td>
                                  <td>
                                    {sht.heightInches}"
                                    <div
                                      style={{
                                        fontSize: "10px",
                                        color: "var(--text-secondary)",
                                      }}
                                    >
                                      ({hFt}')
                                    </div>
                                  </td>
                                  <td>
                                    {sht.widthInches}"
                                    <div
                                      style={{
                                        fontSize: "10px",
                                        color: "var(--text-secondary)",
                                      }}
                                    >
                                      ({wFt}')
                                    </div>
                                  </td>
                                  <td>
                                    <span
                                      className={`badge-swagat badge-${sht.shutterType.toLowerCase()}`}
                                    >
                                      {sht.shutterType}
                                    </span>
                                  </td>
                                  <td>{sht.fittingType}</td>
                                  <td style={{ fontWeight: 600 }}>
                                    {overH}' × {overW}'
                                  </td>
                                  <td
                                    style={{
                                      fontWeight: 700,
                                      color: "var(--primary)",
                                    }}
                                  >
                                    {totalSqft}
                                  </td>
                                  <td
                                    style={{
                                      fontWeight: 600,
                                      color: "#0284C7",
                                    }}
                                  >
                                    {coverSize}'
                                  </td>
                                  <td>₹{rate.toFixed(2)}</td>
                                  <td>₹{giRate.toFixed(2)}</td>
                                  <td>
                                    {type === "Gear"
                                      ? `₹${gear.toFixed(2)}`
                                      : type === "Motorised"
                                        ? `₹${motor.toFixed(2)}`
                                        : "-"}
                                  </td>
                                  <td style={{ fontWeight: 600, color: "#334155" }}>
                                    ₹{shutterBasic.toFixed(2)}
                                  </td>
                                  <td style={{ fontWeight: 600, color: "#0284C7" }}>
                                    ₹{giTopCoverBasic.toFixed(2)}
                                  </td>
                                  <td style={{ fontWeight: 800, color: "var(--success)" }}>
                                    ₹{basicTotal.toFixed(2)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                {/* Editable Quotation Items Table */}
                <div style={{ marginBottom: "24px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "10px",
                    }}
                  >
                    <h4
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        margin: 0,
                        color: "var(--primary-dark)",
                      }}
                    >
                      Quotation Shutter Items ({quotationItems.length}) —
                      Real-Time Recalculation
                    </h4>
                    <button
                      type="button"
                      className="btn-accent-swagat"
                      style={{ padding: "4px 12px", fontSize: "12px" }}
                      onClick={openCustomShutterModal}
                    >
                      <FiPlus /> Add Shutter Row
                    </button>
                  </div>

                  {quotationItems.length === 0 ? (
                    <div
                      style={{
                        padding: "20px",
                        backgroundColor: "#FEF2F2",
                        border: "1px solid #FCA5A5",
                        borderRadius: "6px",
                        textAlign: "center",
                        color: "#991B1B",
                        fontSize: "13px",
                      }}
                    >
                      No shutter items added to quotation. Click "Add Shutter
                      Row" or select shutters from catalog above.
                    </div>
                  ) : (
                    <div
                      style={{
                        border: "1px solid #CBD5E1",
                        borderRadius: "6px",
                        overflowX: "auto",
                      }}
                    >
                      <table className="erp-table" style={{ fontSize: "12px" }}>
                        <thead>
                          <tr style={{ backgroundColor: "#F1F5F9" }}>
                            <th style={{ width: "35px" }}>Sr</th>
                            <th style={{ minWidth: "120px" }}>Shutter Name</th>
                            <th>Height (in)</th>
                            <th>Width (in)</th>
                            <th>Type</th>
                            <th>Fitting</th>
                            <th>Over H × W</th>
                            <th>Shutter Sqft</th>
                            <th>GI Cover R.Ft</th>
                            <th>Rate/Sqft</th>
                            <th>GI Cover Rate</th>
                            <th style={{ backgroundColor: "#F8FAFC", color: "var(--primary-dark)" }}>Basic Total (No Cover)</th>
                            <th style={{ backgroundColor: "#F8FAFC", color: "#0284C7" }}>GI Cover Total</th>
                            <th style={{ backgroundColor: "#ECFDF5", color: "var(--success)", fontWeight: 800 }}>Shutter Price (Basic + Cover)</th>
                            <th style={{ width: "75px" }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {summaryPreview.processedItems.map((item, idx) => {
                            return (
                              <tr key={idx}>
                                <td style={{ fontWeight: 700 }}>{item.srNo}</td>
                                <td>
                                  <input
                                    type="text"
                                    className="form-control-swagat"
                                    style={{ padding: "4px 8px" }}
                                    placeholder="e.g. Shutter 1"
                                    value={item.shutter_name_no || ""}
                                    onChange={(e) =>
                                      updateQuotationItemField(
                                        idx,
                                        "shutter_name_no",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    step="0.01"
                                    className="form-control-swagat"
                                    style={{
                                      width: "85px",
                                      padding: "4px 8px",
                                    }}
                                    placeholder="Height"
                                    value={item.height_inches}
                                    onWheel={(e) => e.target.blur()}
                                    onKeyDown={(e) =>
                                      (e.key === "ArrowUp" ||
                                        e.key === "ArrowDown") &&
                                      e.preventDefault()
                                    }
                                    onChange={(e) =>
                                      updateQuotationItemField(
                                        idx,
                                        "height_inches",
                                        e.target.value,
                                      )
                                    }
                                  />
                                  <div
                                    style={{
                                      fontSize: "10px",
                                      color: "var(--text-secondary)",
                                    }}
                                  >
                                    ({item.hFt}')
                                  </div>
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    step="0.01"
                                    className="form-control-swagat"
                                    style={{
                                      width: "85px",
                                      padding: "4px 8px",
                                    }}
                                    placeholder="Width"
                                    value={item.width_inches}
                                    onWheel={(e) => e.target.blur()}
                                    onKeyDown={(e) =>
                                      (e.key === "ArrowUp" ||
                                        e.key === "ArrowDown") &&
                                      e.preventDefault()
                                    }
                                    onChange={(e) =>
                                      updateQuotationItemField(
                                        idx,
                                        "width_inches",
                                        e.target.value,
                                      )
                                    }
                                  />
                                  <div
                                    style={{
                                      fontSize: "10px",
                                      color: "var(--text-secondary)",
                                    }}
                                  >
                                    ({item.wFt}')
                                  </div>
                                </td>
                                <td>
                                  <select
                                    className="form-select-swagat"
                                    style={{
                                      padding: "4px 6px",
                                      fontSize: "12px",
                                      minWidth: "115px",
                                    }}
                                    value={item.shutter_type || "Manual"}
                                    onChange={(e) =>
                                      updateQuotationItemField(
                                        idx,
                                        "shutter_type",
                                        e.target.value,
                                      )
                                    }
                                  >
                                    <option value="Manual">Manual</option>
                                    <option value="Gear">Gear</option>
                                    <option value="Motorised">
                                      Motorised
                                    </option>
                                  </select>
                                </td>
                                <td>
                                  <select
                                    className="form-select-swagat"
                                    style={{
                                      padding: "4px 6px",
                                      fontSize: "12px",
                                      minWidth: "100px",
                                    }}
                                    value={item.fitting_type || "A Type"}
                                    onChange={(e) =>
                                      updateQuotationItemField(
                                        idx,
                                        "fitting_type",
                                        e.target.value,
                                      )
                                    }
                                  >
                                    <option value="A Type">A Type</option>
                                    <option value="B Type">B Type</option>
                                  </select>
                                </td>
                                <td style={{ fontWeight: 600 }}>
                                  {item.overH}' × {item.overW}'
                                </td>
                                <td
                                  style={{
                                    fontWeight: 700,
                                    color: "var(--primary)",
                                  }}
                                >
                                  {item.totalSqft}
                                </td>
                                <td
                                  style={{ fontWeight: 600, color: "#0284C7" }}
                                >
                                  {item.coverSize}'
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    step="0.01"
                                    className="form-control-swagat"
                                    style={{
                                      width: "80px",
                                      padding: "4px 8px",
                                    }}
                                    placeholder="Rate"
                                    value={item.rate_per_sqft}
                                    onWheel={(e) => e.target.blur()}
                                    onKeyDown={(e) =>
                                      (e.key === "ArrowUp" ||
                                        e.key === "ArrowDown") &&
                                      e.preventDefault()
                                    }
                                    onChange={(e) =>
                                      updateQuotationItemField(
                                        idx,
                                        "rate_per_sqft",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    step="0.01"
                                    className="form-control-swagat"
                                    style={{
                                      width: "80px",
                                      padding: "4px 8px",
                                    }}
                                    placeholder="GI Rate"
                                    value={item.gi_top_cover_rate_per_sqft}
                                    onWheel={(e) => e.target.blur()}
                                    onKeyDown={(e) =>
                                      (e.key === "ArrowUp" ||
                                        e.key === "ArrowDown") &&
                                      e.preventDefault()
                                    }
                                    onChange={(e) =>
                                      updateQuotationItemField(
                                        idx,
                                        "gi_top_cover_rate_per_sqft",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </td>
                                <td style={{ fontWeight: 600, color: "#334155" }}>
                                  ₹{item.shutterBasic.toFixed(2)}
                                </td>
                                <td style={{ fontWeight: 600, color: "#0284C7" }}>
                                  ₹{item.giTopCoverBasic.toFixed(2)}
                                </td>
                                <td
                                  style={{
                                    fontWeight: 800,
                                    color: "var(--success)",
                                    fontSize: "13px",
                                  }}
                                >
                                  ₹{item.basicTotal.toFixed(2)}
                                </td>
                                <td>
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: "6px",
                                      alignItems: "center",
                                    }}
                                  >
                                    <button
                                      type="button"
                                      className="btn-icon-action primary"
                                      title="Edit Shutter Row Item"
                                      onClick={() =>
                                        handleOpenEditShutterModal(idx)
                                      }
                                      style={{
                                        backgroundColor: "#EFF6FF",
                                        color: "#2563EB",
                                        border: "1px solid #BFDBFE",
                                        borderRadius: "4px",
                                        padding: "4px 6px",
                                        cursor: "pointer",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                      }}
                                    >
                                      <FiEdit2 size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      className="btn-icon-action danger"
                                      title="Remove Item"
                                      onClick={() => removeQuotationItem(idx)}
                                      style={{
                                        padding: "4px 6px",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                      }}
                                    >
                                      <FiTrash2 size={13} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Quotation Charges & Recalculation Summary */}
                {quotationItems.length > 0 && (
                  <div
                    style={{
                      backgroundColor: "#F8FAFC",
                      padding: "16px",
                      borderRadius: "8px",
                      border: "1px solid #E2E8F0",
                    }}
                  >
                    <h4
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        marginBottom: "12px",
                        color: "var(--primary-dark)",
                      }}
                    >
                      Quotation Financial Recalculation Engine
                    </h4>

                    {/* Additional Charges Section (Phase 7) — Positioned BEFORE Transportation & GST */}
                    <div
                      style={{
                        backgroundColor: "#F8FAFC",
                        padding: "16px",
                        borderRadius: "8px",
                        border: "1px solid #E2E8F0",
                        marginBottom: "16px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "12px",
                        }}
                      >
                        <label
                          className="form-label-swagat"
                          style={{ marginBottom: 0, fontSize: "14px", fontWeight: 700 }}
                        >
                          Additional Charges (Optional)
                        </label>
                        <button
                          type="button"
                          className="btn-outline-swagat"
                          style={{ fontSize: "12px", padding: "4px 12px" }}
                          onClick={() => handleAddAdditionalCharge()}
                        >
                          <FiPlus style={{ marginRight: "4px" }} /> Add Additional Charge
                        </button>
                      </div>

                      {/* Preset Quick-Add Buttons */}
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          flexWrap: "wrap",
                          alignItems: "center",
                          marginBottom: "12px",
                        }}
                      >
                        <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                          Quick Presets:
                        </span>
                        <button
                          type="button"
                          className="badge-swagat"
                          style={{
                            border: "1px solid #CBD5E1",
                            backgroundColor: "#FFFFFF",
                            cursor: "pointer",
                            fontSize: "11px",
                            padding: "4px 8px",
                          }}
                          onClick={() =>
                            handleAddAdditionalCharge(
                              "Manual to Motor Conversion Labour",
                            )
                          }
                        >
                          + Labour Conversion
                        </button>
                        <button
                          type="button"
                          className="badge-swagat"
                          style={{
                            border: "1px solid #CBD5E1",
                            backgroundColor: "#FFFFFF",
                            cursor: "pointer",
                            fontSize: "11px",
                            padding: "4px 8px",
                          }}
                          onClick={() =>
                            handleAddAdditionalCharge("Extra Motor Chain")
                          }
                        >
                          + Extra Motor Chain
                        </button>
                        <button
                          type="button"
                          className="badge-swagat"
                          style={{
                            border: "1px solid #CBD5E1",
                            backgroundColor: "#FFFFFF",
                            cursor: "pointer",
                            fontSize: "11px",
                            padding: "4px 8px",
                          }}
                          onClick={() =>
                            handleAddAdditionalCharge("Fabrication Work")
                          }
                        >
                          + Fabrication Work
                        </button>
                        <button
                          type="button"
                          className="badge-swagat"
                          style={{
                            border: "1px solid #CBD5E1",
                            backgroundColor: "#FFFFFF",
                            cursor: "pointer",
                            fontSize: "11px",
                            padding: "4px 8px",
                          }}
                          onClick={() =>
                            handleAddAdditionalCharge("Other Additional Work")
                          }
                        >
                          + Other Additional Work
                        </button>
                      </div>

                      {(!formData.additional_charges ||
                        formData.additional_charges.length === 0) ? (
                        <div
                          style={{
                            fontSize: "12px",
                            color: "var(--text-secondary)",
                            fontStyle: "italic",
                            padding: "10px 14px",
                            backgroundColor: "#FFFFFF",
                            borderRadius: "6px",
                            border: "1px dashed #CBD5E1",
                          }}
                        >
                          No additional charges added. Click "+ Add Additional Charge" or a preset button above to add conversion labour, extra chain, or fabrication work.
                        </div>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                          }}
                        >
                          {formData.additional_charges.map((chg, idx) => (
                            <div
                              key={chg.id || idx}
                              style={{
                                display: "grid",
                                gridTemplateColumns: "2fr 1fr auto",
                                gap: "10px",
                                alignItems: "center",
                                padding: "10px 12px",
                                backgroundColor: "#FFFFFF",
                                borderRadius: "6px",
                                border: "1px solid #CBD5E1",
                              }}
                            >
                              <div>
                                <label
                                  style={{
                                    fontSize: "11px",
                                    color: "var(--text-secondary)",
                                    display: "block",
                                    marginBottom: "2px",
                                  }}
                                >
                                  Description
                                </label>
                                <input
                                  type="text"
                                  className="form-control-swagat"
                                  style={{ fontSize: "13px", height: "34px" }}
                                  placeholder="e.g. Fabrication Work"
                                  value={chg.description || ""}
                                  onChange={(e) =>
                                    handleAdditionalChargeChange(
                                      idx,
                                      "description",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                              <div>
                                <label
                                  style={{
                                    fontSize: "11px",
                                    color: "var(--text-secondary)",
                                    display: "block",
                                    marginBottom: "2px",
                                  }}
                                >
                                  Amount (₹)
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  className="form-control-swagat"
                                  style={{ fontSize: "13px", height: "34px" }}
                                  placeholder="0.00"
                                  value={chg.amount || ""}
                                  onWheel={(e) => e.target.blur()}
                                  onChange={(e) =>
                                    handleAdditionalChargeChange(
                                      idx,
                                      "amount",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                              <div style={{ paddingTop: "14px" }}>
                                <button
                                  type="button"
                                  className="btn-icon-action danger"
                                  title="Remove Charge"
                                  onClick={() => handleRemoveAdditionalCharge(idx)}
                                >
                                  <FiTrash2 />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Transportation & GST Toggle Inputs — Positioned BELOW Additional Charges */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "16px",
                        marginBottom: "16px",
                      }}
                    >
                      {/* Transportation */}
                      <div>
                        <label className="form-label-swagat">
                          Transportation Charges (₹)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="form-control-swagat"
                          placeholder="e.g. 1500"
                          value={formData.transportation_charges}
                          onWheel={(e) => e.target.blur()}
                          onKeyDown={(e) =>
                            (e.key === "ArrowUp" || e.key === "ArrowDown") &&
                            e.preventDefault()
                          }
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              transportation_charges: e.target.value,
                            })
                          }
                        />
                      </div>

                      {/* GST Toggle */}
                      <div>
                        <label className="form-label-swagat">
                          GST Applicable
                        </label>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "16px",
                            paddingTop: "8px",
                          }}
                        >
                          <label
                            style={{
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <input
                              type="radio"
                              name="gst_app"
                              checked={formData.gst_applicable === true}
                              onChange={() =>
                                setFormData({
                                  ...formData,
                                  gst_applicable: true,
                                })
                              }
                            />
                            <span>Yes (18%)</span>
                          </label>
                          <label
                            style={{
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <input
                              type="radio"
                              name="gst_app"
                              checked={formData.gst_applicable === false}
                              onChange={() =>
                                setFormData({
                                  ...formData,
                                  gst_applicable: false,
                                })
                              }
                            />
                            <span>No GST</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Summary Calculation Card (Explicit 6 Columns) */}
                    <div
                      style={{
                        backgroundColor: "#FFFFFF",
                        padding: "14px 18px",
                        borderRadius: "6px",
                        border: "1px solid #CBD5E1",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "12px",
                          textAlign: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        {/* Column 1: Shutter Price */}
                        <div style={{ flex: 1, minWidth: "120px" }}>
                          <div
                            style={{
                              fontSize: "11px",
                              color: "var(--text-secondary)",
                            }}
                          >
                            Shutter Price
                          </div>
                          <div style={{ fontWeight: 700, fontSize: "14px", color: "#1E293B" }}>
                            ₹{(summaryPreview.shutterBasicTotal + summaryPreview.giTopCoverTotal).toFixed(2)}
                          </div>
                        </div>

                        {/* Column 2: Additional Charges */}
                        <div style={{ flex: 1, minWidth: "120px" }}>
                          <div
                            style={{
                              fontSize: "11px",
                              color: "var(--text-secondary)",
                            }}
                          >
                            Additional Charges
                          </div>
                          <div style={{ fontWeight: 700, fontSize: "14px", color: "#7C3AED" }}>
                            +₹{summaryPreview.addlTotal.toFixed(2)}
                          </div>
                        </div>

                        {/* Column 3: Transportation */}
                        <div style={{ flex: 1, minWidth: "110px" }}>
                          <div
                            style={{
                              fontSize: "11px",
                              color: "var(--text-secondary)",
                            }}
                          >
                            Transportation
                          </div>
                          <div style={{ fontWeight: 700, fontSize: "14px", color: "#0284C7" }}>
                            +₹{summaryPreview.transportation.toFixed(2)}
                          </div>
                        </div>

                        {/* Column 4: Total Basic (GST Base) */}
                        <div style={{ flex: 1, minWidth: "130px" }}>
                          <div
                            style={{
                              fontSize: "11px",
                              color: "var(--text-secondary)",
                            }}
                          >
                            Total Basic (GST Base)
                          </div>
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: "14px",
                              color: "var(--primary)",
                            }}
                          >
                            ₹{summaryPreview.totalBasic.toFixed(2)}
                          </div>
                        </div>

                        {/* Column 5: GST Amount */}
                        <div style={{ flex: 1, minWidth: "120px" }}>
                          <div
                            style={{
                              fontSize: "11px",
                              color: "var(--text-secondary)",
                            }}
                          >
                            GST Amount ({formData.gst_applicable ? "18%" : "0%"})
                          </div>
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: "14px",
                              color: formData.gst_applicable
                                ? "#D97706"
                                : "#64748B",
                            }}
                          >
                            ₹{summaryPreview.gstAmount.toFixed(2)}
                          </div>
                        </div>

                        {/* Column 6: Final Total */}
                        <div style={{ flex: 1, minWidth: "135px" }}>
                          <div
                            style={{
                              fontSize: "11px",
                              color: "var(--text-secondary)",
                            }}
                          >
                            Final Total (Incl. GST)
                          </div>
                          <div
                            style={{
                              fontWeight: 800,
                              fontSize: "17px",
                              color: "var(--success)",
                            }}
                          >
                            ₹{summaryPreview.finalTotal.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {/* Final Total Formula Calculation Banner (Highlighted Blue) */}
                      <div
                        style={{
                          marginTop: "14px",
                          padding: "12px 16px",
                          backgroundColor: "#EFF6FF",
                          border: "1px solid #60A5FA",
                          borderRadius: "6px",
                          fontSize: "12px",
                          color: "#1E3A8A",
                          fontWeight: 600,
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontWeight: 700,
                            color: "#1D4ED8",
                            fontSize: "12px",
                          }}
                        >
                          <span>📘 Formula Calculation Sequence:</span>
                          <span style={{ color: "#1E40AF", fontWeight: 800 }}>
                            Final Total: ₹{summaryPreview.finalTotal.toFixed(2)}
                          </span>
                        </div>
                        <div style={{ fontSize: "11px", color: "#1E40AF", lineHeight: 1.6 }}>
                          <strong>1. Shutter Price:</strong> Billed Shutters & Cover = <strong>₹{(summaryPreview.shutterBasicTotal + summaryPreview.giTopCoverTotal).toFixed(2)}</strong>
                          <br />
                          <strong>2. Add Charges & Transport:</strong> Shutter Price (₹{(summaryPreview.shutterBasicTotal + summaryPreview.giTopCoverTotal).toFixed(2)})
                          {summaryPreview.addlTotal > 0 ? ` + Additional Charges (₹${summaryPreview.addlTotal.toFixed(2)})` : ` + Additional Charges (₹0.00)`}
                          {summaryPreview.transportation > 0 ? ` + Transport (₹${summaryPreview.transportation.toFixed(2)})` : ` + Transport (₹0.00)`}
                          {` = `}<strong>Total Basic (GST Base): ₹{summaryPreview.totalBasic.toFixed(2)}</strong>
                          <br />
                          <strong>3. Apply GST & Final Total:</strong> {formData.gst_applicable ? `GST 18% on Total Basic (₹${summaryPreview.totalBasic.toFixed(2)}) = ₹${summaryPreview.gstAmount.toFixed(2)}` : `No GST (₹0.00)`} ➔ <strong>Final Billed Total = ₹{summaryPreview.finalTotal.toFixed(2)}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
                    : selectedQuotation
                      ? "Save Quotation Changes"
                      : "Create Quotation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW QUOTATION DETAIL MODAL */}
      {isViewOpen && selectedQuotation && (
        <div className="modal-overlay">
          <div className="modal-content-swagat modal-xl">
            <div className="modal-header-swagat">
              <div>
                <h3>Quotation #{selectedQuotation.quotationNo}</h3>
                <span
                  style={{ fontSize: "12px", color: "var(--text-secondary)" }}
                >
                  Generated on{" "}
                  {new Date(selectedQuotation.quotationDate).toLocaleDateString(
                    "en-IN",
                  )}
                </span>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setIsViewOpen(false)}
              >
                <FiX />
              </button>
            </div>

            <div
              className="modal-body-swagat"
              style={{ maxHeight: "75vh", overflowY: "auto" }}
            >
              {/* Customer & Industry Details Card */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "16px",
                  backgroundColor: "#F8FAFC",
                  padding: "16px",
                  borderRadius: "8px",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "var(--text-secondary)",
                      textTransform: "uppercase",
                    }}
                  >
                    Customer
                  </div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "14px",
                      color: "var(--primary-dark)",
                    }}
                  >
                    {selectedQuotation.customer?.customerName}
                  </div>
                  <div style={{ fontSize: "12px", color: "#475569" }}>
                    📱 {selectedQuotation.customer?.mobileNumber}
                  </div>
                  <div style={{ fontSize: "12px", color: "#475569" }}>
                    📍 {selectedQuotation.customer?.address}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "var(--text-secondary)",
                      textTransform: "uppercase",
                    }}
                  >
                    Industry / Company
                  </div>
                  <div style={{ fontWeight: 600, fontSize: "14px" }}>
                    {selectedQuotation.industry?.industryName || "N/A"}
                  </div>
                  {selectedQuotation.industry?.gstNo && (
                    <div style={{ fontSize: "12px", color: "#475569" }}>
                      GST: {selectedQuotation.industry?.gstNo}
                    </div>
                  )}
                </div>

                <div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "var(--text-secondary)",
                      textTransform: "uppercase",
                    }}
                  >
                    Site Location
                  </div>
                  <div style={{ fontWeight: 600, fontSize: "14px" }}>
                    {selectedQuotation.site?.siteName || "N/A"}
                  </div>
                  <div style={{ fontSize: "12px", color: "#475569" }}>
                    {selectedQuotation.site?.siteAddress || selectedQuotation.siteAddress || "N/A"}
                  </div>
                </div>
              </div>

              {/* Quotation Shutter Items Table (Matches Edit Page Table Exactly) */}
              <h4
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  marginBottom: "10px",
                  color: "var(--primary-dark)",
                }}
              >
                Quotation Shutter Items ({selectedQuotation.items ? selectedQuotation.items.length : 0})
              </h4>
              <div
                style={{
                  border: "1px solid #CBD5E1",
                  borderRadius: "6px",
                  overflowX: "auto",
                  marginBottom: "20px",
                }}
              >
                <table className="erp-table" style={{ fontSize: "12px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#F1F5F9" }}>
                      <th style={{ width: "35px" }}>Sr</th>
                      <th style={{ minWidth: "120px" }}>Shutter Name</th>
                      <th>Height (in)</th>
                      <th>Width (in)</th>
                      <th>Type</th>
                      <th>Fitting</th>
                      <th>Over H × W</th>
                      <th>Shutter Sqft</th>
                      <th>GI Cover R.Ft</th>
                      <th>Rate/Sqft</th>
                      <th>GI Cover Rate</th>
                      <th style={{ backgroundColor: "#F8FAFC", color: "var(--primary-dark)" }}>Basic Total (No Cover)</th>
                      <th style={{ backgroundColor: "#F8FAFC", color: "#0284C7" }}>GI Cover Total</th>
                      <th style={{ backgroundColor: "#ECFDF5", color: "var(--success)", fontWeight: 800 }}>Shutter Price (Basic + Cover)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedQuotation.items &&
                      selectedQuotation.items.map((item, idx) => {
                        const hFt = item.heightFt
                          ? Number(item.heightFt)
                          : Number((item.heightInches / 12).toFixed(2));
                        const wFt = item.widthFt
                          ? Number(item.widthFt)
                          : Number((item.widthInches / 12).toFixed(2));
                        const rate = Number(item.ratePerSqft || 0);
                        const giRate = Number(item.giTopCoverRatePerSqft || 0);
                        const sqft = Number(item.totalSqft || 0);
                        const coverRft = Number(item.coverSize || 0);
                        const type = item.shutterType || "Manual";
                        const gear = type === "Gear" ? Number(item.gearPrice || 0) : 0;
                        const motor = type === "Motorised" ? Number(item.motorPrice || 0) : 0;
                        const overH = item.overHeight ? Number(item.overHeight) : 0;
                        const overW = item.overWidth ? Number(item.overWidth) : 0;

                        const itemShutterBasic = item.shutterBasic !== undefined ? Number(item.shutterBasic) : (sqft * rate + gear + motor);
                        const itemGiCoverBasic = item.giTopCoverBasic !== undefined ? Number(item.giTopCoverBasic) : (coverRft * giRate);
                        const itemBasicTotal = item.basicTotal !== undefined ? Number(item.basicTotal) : (itemShutterBasic + itemGiCoverBasic);

                        return (
                          <tr key={item.id || idx}>
                            <td style={{ fontWeight: 700 }}>{item.srNo || idx + 1}</td>
                            <td style={{ fontWeight: 600 }}>
                              {item.shutterNameNo || item.shutter_name_no || `Shutter ${idx + 1}`}
                            </td>
                            <td>
                              {Number(item.heightInches || 0)}"
                              <div style={{ fontSize: "10px", color: "var(--text-secondary)" }}>
                                ({hFt}')
                              </div>
                            </td>
                            <td>
                              {Number(item.widthInches || 0)}"
                              <div style={{ fontSize: "10px", color: "var(--text-secondary)" }}>
                                ({wFt}')
                              </div>
                            </td>
                            <td>
                              <span className={`badge-swagat badge-${type.toLowerCase()}`}>
                                {type}
                              </span>
                            </td>
                            <td>{item.fittingType || "A Type"}</td>
                            <td style={{ fontWeight: 600 }}>
                              {overH}' × {overW}'
                            </td>
                            <td style={{ fontWeight: 700, color: "var(--primary)" }}>
                              {sqft}
                            </td>
                            <td style={{ fontWeight: 600, color: "#0284C7" }}>
                              {coverRft}'
                            </td>
                            <td>₹{rate.toFixed(2)}</td>
                            <td>₹{giRate.toFixed(2)}</td>
                            <td style={{ fontWeight: 600, color: "#334155" }}>
                              ₹{itemShutterBasic.toFixed(2)}
                            </td>
                            <td style={{ fontWeight: 600, color: "#0284C7" }}>
                              ₹{itemGiCoverBasic.toFixed(2)}
                            </td>
                            <td style={{ fontWeight: 800, color: "var(--success)", fontSize: "13px" }}>
                              ₹{itemBasicTotal.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    {/* Items Table Summary Row */}
                    <tr style={{ backgroundColor: "#F8FAFC", fontWeight: 700 }}>
                      <td colSpan="11" style={{ textAlign: "right", color: "var(--primary-dark)" }}>
                        Quotation Shutter Items Total:
                      </td>
                      <td style={{ color: "#334155", fontWeight: 700 }}>
                        ₹{Number(selectedQuotation.shutterBasicTotal || 0).toFixed(2)}
                      </td>
                      <td style={{ color: "#0284C7", fontWeight: 700 }}>
                        ₹{Number(selectedQuotation.giTopCoverTotal || 0).toFixed(2)}
                      </td>
                      <td style={{ color: "var(--success)", fontWeight: 800, fontSize: "14px" }}>
                        ₹
                        {(
                          Number(selectedQuotation.shutterBasicTotal || 0) +
                          Number(selectedQuotation.giTopCoverTotal || 0)
                        ).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Quotation Financial Recalculation Engine Box (Matches Edit Page Exactly) */}
              <h4
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  marginBottom: "12px",
                  color: "var(--primary-dark)",
                }}
              >
                Quotation Financial Recalculation Engine
              </h4>

              {/* Additional Charges Section (Optional) — Positioned FIRST */}
              {selectedQuotation.additionalCharges &&
                selectedQuotation.additionalCharges.some(
                  (c) => Number(c.amount) > 0,
                ) ? (
                <div style={{ marginBottom: "16px" }}>
                  <div
                    style={{
                      border: "1px solid #CBD5E1",
                      borderRadius: "6px",
                      overflow: "hidden",
                    }}
                  >
                    <table className="erp-table" style={{ fontSize: "12px" }}>
                      <thead>
                        <tr style={{ backgroundColor: "#F1F5F9" }}>
                          <th style={{ width: "40px" }}>#</th>
                          <th>Description</th>
                          <th style={{ textAlign: "right" }}>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedQuotation.additionalCharges
                          .filter((c) => Number(c.amount) > 0)
                          .map((c, idx) => (
                            <tr key={c.id || idx}>
                              <td>{idx + 1}</td>
                              <td style={{ fontWeight: 600 }}>{c.description}</td>
                              <td
                                style={{
                                  textAlign: "right",
                                  fontWeight: 700,
                                  color: "#7C3AED",
                                }}
                              >
                                +₹{Number(c.amount).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        <tr style={{ backgroundColor: "#F8FAFC", fontWeight: 700 }}>
                          <td
                            colSpan="2"
                            style={{
                              textAlign: "right",
                              color: "var(--text-secondary)",
                            }}
                          >
                            Total Additional Charges:
                          </td>
                          <td
                            style={{
                              textAlign: "right",
                              color: "#7C3AED",
                              fontSize: "13px",
                            }}
                          >
                            +₹
                            {Number(
                              selectedQuotation.additionalChargesTotal || 0,
                            ).toFixed(2)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    fontStyle: "italic",
                    padding: "10px 14px",
                    backgroundColor: "#F8FAFC",
                    borderRadius: "6px",
                    border: "1px dashed #CBD5E1",
                    marginBottom: "16px",
                  }}
                >
                  No additional charges added to this quotation.
                </div>
              )}

              {/* Transportation Charges & GST Display Box — Positioned BELOW Additional Charges */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                  marginBottom: "16px",
                  backgroundColor: "#F8FAFC",
                  padding: "14px 16px",
                  borderRadius: "8px",
                  border: "1px solid #E2E8F0",
                }}
              >
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "4px" }}>
                    Transportation Charges
                  </div>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "#0284C7" }}>
                    ₹{Number(selectedQuotation.transportationCharges || 0).toFixed(2)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "4px" }}>
                    GST Status
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: selectedQuotation.gstApplicable ? "#D97706" : "#64748B" }}>
                    {selectedQuotation.gstApplicable ? "✓ Yes (18% GST Applicable)" : "✕ No GST"}
                  </div>
                </div>
              </div>

              {/* Discount Section (Only if discountAmount > 0) */}
              {Number(selectedQuotation.discountAmount) > 0 && (
                <div
                  style={{
                    marginBottom: "16px",
                    padding: "12px 16px",
                    backgroundColor: "#FEF2F2",
                    border: "1px solid #FCA5A5",
                    borderRadius: "6px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div
                      style={{ fontSize: "12px", fontWeight: 700, color: "#991B1B" }}
                    >
                      Discount / Financial Adjustment Applied
                    </div>
                    <div style={{ fontSize: "13px", color: "#7F1D1D" }}>
                      Reason: {selectedQuotation.discountReason || "Discount Applied"}
                    </div>
                  </div>
                  <div
                    style={{ fontSize: "15px", fontWeight: 800, color: "#DC2626" }}
                  >
                    -₹{Number(selectedQuotation.discountAmount).toFixed(2)}
                  </div>
                </div>
              )}

              {/* Financial Summary Card (Explicit 6 Columns) */}
              {(() => {
                const viewShutterPrice =
                  Number(selectedQuotation.shutterBasicTotal || 0) +
                  Number(selectedQuotation.giTopCoverTotal || 0);
                const viewAddlTotal = Number(selectedQuotation.additionalChargesTotal || 0);
                const viewTransport = Number(selectedQuotation.transportationCharges || 0);
                const viewDiscount = Number(selectedQuotation.discountAmount || 0);
                const viewTotalBasic = Number(
                  selectedQuotation.totalBasic ||
                    viewShutterPrice + viewAddlTotal + viewTransport - viewDiscount,
                );
                const viewGstAmount = Number(selectedQuotation.gstAmount || 0);
                const viewFinalTotal = Number(selectedQuotation.finalTotal || 0);

                return (
                  <div
                    style={{
                      backgroundColor: "#FFFFFF",
                      padding: "14px 18px",
                      borderRadius: "6px",
                      border: "1px solid #CBD5E1",
                      marginBottom: "20px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "12px",
                        textAlign: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      {/* Column 1: Shutter Price */}
                      <div style={{ flex: 1, minWidth: "120px" }}>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "var(--text-secondary)",
                          }}
                        >
                          Shutter Price
                        </div>
                        <div style={{ fontWeight: 700, fontSize: "14px", color: "#1E293B" }}>
                          ₹{viewShutterPrice.toFixed(2)}
                        </div>
                      </div>

                      {/* Column 2: Additional Charges */}
                      <div style={{ flex: 1, minWidth: "120px" }}>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "var(--text-secondary)",
                          }}
                        >
                          Additional Charges
                        </div>
                        <div style={{ fontWeight: 700, fontSize: "14px", color: "#7C3AED" }}>
                          +₹{viewAddlTotal.toFixed(2)}
                        </div>
                      </div>

                      {/* Column 3: Transportation */}
                      <div style={{ flex: 1, minWidth: "110px" }}>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "var(--text-secondary)",
                          }}
                        >
                          Transportation
                        </div>
                        <div style={{ fontWeight: 700, fontSize: "14px", color: "#0284C7" }}>
                          +₹{viewTransport.toFixed(2)}
                        </div>
                      </div>

                      {/* Column 4: Total Basic (GST Base) */}
                      <div style={{ flex: 1, minWidth: "130px" }}>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "var(--text-secondary)",
                          }}
                        >
                          Total Basic (GST Base)
                        </div>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: "14px",
                            color: "var(--primary)",
                          }}
                        >
                          ₹{viewTotalBasic.toFixed(2)}
                        </div>
                      </div>

                      {/* Column 5: GST Amount */}
                      <div style={{ flex: 1, minWidth: "120px" }}>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "var(--text-secondary)",
                          }}
                        >
                          GST Amount ({selectedQuotation.gstApplicable ? "18%" : "0%"})
                        </div>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: "14px",
                            color: selectedQuotation.gstApplicable ? "#D97706" : "#64748B",
                          }}
                        >
                          ₹{viewGstAmount.toFixed(2)}
                        </div>
                      </div>

                      {/* Column 6: Final Total */}
                      <div style={{ flex: 1, minWidth: "135px" }}>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "var(--text-secondary)",
                          }}
                        >
                          Final Total (Incl. GST)
                        </div>
                        <div
                          style={{
                            fontWeight: 800,
                            fontSize: "17px",
                            color: "var(--success)",
                          }}
                        >
                          ₹{viewFinalTotal.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Formula Calculation Banner (Highlighted Blue) */}
                    <div
                      style={{
                        marginTop: "14px",
                        padding: "12px 16px",
                        backgroundColor: "#EFF6FF",
                        border: "1px solid #60A5FA",
                        borderRadius: "6px",
                        fontSize: "12px",
                        color: "#1E3A8A",
                        fontWeight: 600,
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontWeight: 700,
                          color: "#1D4ED8",
                          fontSize: "12px",
                        }}
                      >
                        <span>📘 Formula Calculation Sequence:</span>
                        <span style={{ color: "#1E40AF", fontWeight: 800 }}>
                          Final Total: ₹{viewFinalTotal.toFixed(2)}
                        </span>
                      </div>
                      <div style={{ fontSize: "11px", color: "#1E40AF", lineHeight: 1.6 }}>
                        <strong>1. Shutter Price:</strong> Billed Shutters & Cover = <strong>₹{viewShutterPrice.toFixed(2)}</strong>
                        <br />
                        <strong>2. Add Charges & Transport:</strong> Shutter Price (₹{viewShutterPrice.toFixed(2)})
                        {viewAddlTotal > 0 ? ` + Additional Charges (₹${viewAddlTotal.toFixed(2)})` : ` + Additional Charges (₹0.00)`}
                        {viewTransport > 0 ? ` + Transport (₹${viewTransport.toFixed(2)})` : ` + Transport (₹0.00)`}
                        {` = `}<strong>Total Basic (GST Base): ₹{viewTotalBasic.toFixed(2)}</strong>
                        <br />
                        <strong>3. Apply GST & Final Total:</strong> {selectedQuotation.gstApplicable ? `GST 18% on Total Basic (₹${viewTotalBasic.toFixed(2)}) = ₹${viewGstAmount.toFixed(2)}` : `No GST (₹0.00)`} ➔ <strong>Final Billed Total = ₹{viewFinalTotal.toFixed(2)}</strong>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="modal-footer-swagat">
              <button
                type="button"
                className="btn-accent-swagat"
                onClick={() => openPDFModal(selectedQuotation)}
              >
                <FiPrinter /> Print / Save PDF
              </button>
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

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteOpen && selectedQuotation && (
        <ConfirmModal
          isOpen={isDeleteOpen}
          title="Delete Quotation"
          message={`Are you sure you want to delete Quotation #${selectedQuotation.quotationNo}?`}
          onConfirm={handleDeleteQuotation}
          onCancel={() => setIsDeleteOpen(false)}
        />
      )}

      {/* QUOTATION PDF MODAL */}
      {isPDFOpen && pdfQuotationId && (
        <QuotationPDFModal
          quotationId={pdfQuotationId}
          onClose={() => {
            setIsPDFOpen(false);
            setPdfQuotationId(null);
          }}
        />
      )}


      {/* ADD CUSTOM SHUTTER MODAL DIALOG */}
      {isCustomShutterModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 1200 }}>
          <div className="modal-content-swagat modal-lg">
            <div className="modal-header-swagat">
              <h3>
                <FiPlus style={{ color: "var(--primary)" }} /> Add Custom
                Shutter to Quotation
              </h3>
              <button
                className="modal-close-btn"
                onClick={() => setIsCustomShutterModalOpen(false)}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleAddCustomShutterSubmit}>
              <div
                className="modal-body-swagat"
                style={{ maxHeight: "75vh", overflowY: "auto" }}
              >
                {/* Shutter Name */}
                <div style={{ marginBottom: "16px" }}>
                  <label className="form-label-swagat">
                    Shutter Name / Number{" "}
                    <span style={{ color: "var(--danger)" }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control-swagat"
                    placeholder="e.g. Main Entrance Shutter"
                    value={customShutterForm.shutter_name_no}
                    onChange={(e) =>
                      setCustomShutterForm({
                        ...customShutterForm,
                        shutter_name_no: e.target.value,
                      })
                    }
                  />
                  {customShutterErrors.shutter_name_no && (
                    <span style={{ fontSize: "12px", color: "var(--danger)" }}>
                      {customShutterErrors.shutter_name_no}
                    </span>
                  )}
                </div>

                {/* Dimensions (H x W) */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                    marginBottom: "16px",
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
                      className="form-control-swagat"
                      placeholder="e.g. 120"
                      value={customShutterForm.height_inches}
                      onWheel={(e) => e.target.blur()}
                      onKeyDown={(e) =>
                        (e.key === "ArrowUp" || e.key === "ArrowDown") &&
                        e.preventDefault()
                      }
                      onChange={(e) =>
                        setCustomShutterForm({
                          ...customShutterForm,
                          height_inches: e.target.value,
                        })
                      }
                    />
                    {customShutterForm.height_inches && (
                      <span
                        style={{
                          fontSize: "11px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        ={" "}
                        {(
                          parseFloat(customShutterForm.height_inches) / 12
                        ).toFixed(2)}{" "}
                        Feet
                      </span>
                    )}
                    {customShutterErrors.height_inches && (
                      <span
                        style={{
                          fontSize: "12px",
                          color: "var(--danger)",
                          display: "block",
                        }}
                      >
                        {customShutterErrors.height_inches}
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
                      className="form-control-swagat"
                      placeholder="e.g. 96"
                      value={customShutterForm.width_inches}
                      onWheel={(e) => e.target.blur()}
                      onKeyDown={(e) =>
                        (e.key === "ArrowUp" || e.key === "ArrowDown") &&
                        e.preventDefault()
                      }
                      onChange={(e) =>
                        setCustomShutterForm({
                          ...customShutterForm,
                          width_inches: e.target.value,
                        })
                      }
                    />
                    {customShutterForm.width_inches && (
                      <span
                        style={{
                          fontSize: "11px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        ={" "}
                        {(
                          parseFloat(customShutterForm.width_inches) / 12
                        ).toFixed(2)}{" "}
                        Feet
                      </span>
                    )}
                    {customShutterErrors.width_inches && (
                      <span
                        style={{
                          fontSize: "12px",
                          color: "var(--danger)",
                          display: "block",
                        }}
                      >
                        {customShutterErrors.width_inches}
                      </span>
                    )}
                  </div>
                </div>

                {/* Shutter Type */}
                <div style={{ marginBottom: "16px" }}>
                  <label className="form-label-swagat">Shutter Type</label>
                  <div
                    style={{ display: "flex", gap: "20px", paddingTop: "6px" }}
                  >
                    {["Manual", "Gear", "Motorised"].map((t) => (
                      <label
                        key={t}
                        style={{
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <input
                          type="radio"
                          name="custom_shutter_type"
                          value={t}
                          checked={customShutterForm.shutter_type === t}
                          onChange={(e) =>
                            setCustomShutterForm({
                              ...customShutterForm,
                              shutter_type: e.target.value,
                            })
                          }
                        />
                        <span>{t}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Dynamic Gear / Motor Price Input */}
                {customShutterForm.shutter_type === "Gear" && (
                  <div
                    style={{
                      backgroundColor: "#FEF3C7",
                      padding: "14px",
                      borderRadius: "6px",
                      border: "1px solid #FDE68A",
                      marginBottom: "16px",
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
                      value={customShutterForm.gear_price}
                      onWheel={(e) => e.target.blur()}
                      onKeyDown={(e) =>
                        (e.key === "ArrowUp" || e.key === "ArrowDown") &&
                        e.preventDefault()
                      }
                      onChange={(e) =>
                        setCustomShutterForm({
                          ...customShutterForm,
                          gear_price: e.target.value,
                        })
                      }
                    />
                    {customShutterErrors.gear_price && (
                      <span
                        style={{ fontSize: "12px", color: "var(--danger)" }}
                      >
                        {customShutterErrors.gear_price}
                      </span>
                    )}
                  </div>
                )}

                {customShutterForm.shutter_type === "Motorised" && (
                  <div
                    style={{
                      backgroundColor: "#DBEAFE",
                      padding: "14px",
                      borderRadius: "6px",
                      border: "1px solid #BFDBFE",
                      marginBottom: "16px",
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
                      value={customShutterForm.motor_price}
                      onWheel={(e) => e.target.blur()}
                      onKeyDown={(e) =>
                        (e.key === "ArrowUp" || e.key === "ArrowDown") &&
                        e.preventDefault()
                      }
                      onChange={(e) =>
                        setCustomShutterForm({
                          ...customShutterForm,
                          motor_price: e.target.value,
                        })
                      }
                    />
                    {customShutterErrors.motor_price && (
                      <span
                        style={{ fontSize: "12px", color: "var(--danger)" }}
                      >
                        {customShutterErrors.motor_price}
                      </span>
                    )}
                  </div>
                )}

                {/* Fitting Type */}
                <div style={{ marginBottom: "16px" }}>
                  <label className="form-label-swagat">Fitting Type</label>
                  <div
                    style={{ display: "flex", gap: "20px", paddingTop: "6px" }}
                  >
                    {["A Type", "B Type"].map((ft) => (
                      <label
                        key={ft}
                        style={{
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <input
                          type="radio"
                          name="custom_fitting_type"
                          value={ft}
                          checked={customShutterForm.fitting_type === ft}
                          onChange={(e) =>
                            setCustomShutterForm({
                              ...customShutterForm,
                              fitting_type: e.target.value,
                            })
                          }
                        />
                        <span>{ft}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rates */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                    marginBottom: "16px",
                  }}
                >
                  <div>
                    <label className="form-label-swagat">
                      Rate per sq. ft (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-control-swagat"
                      placeholder="e.g. 250"
                      value={customShutterForm.rate_per_sqft}
                      onWheel={(e) => e.target.blur()}
                      onKeyDown={(e) =>
                        (e.key === "ArrowUp" || e.key === "ArrowDown") &&
                        e.preventDefault()
                      }
                      onChange={(e) =>
                        setCustomShutterForm({
                          ...customShutterForm,
                          rate_per_sqft: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="form-label-swagat">
                      GI Top Cover Rate / R.Ft (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-control-swagat"
                      placeholder="e.g. 80"
                      value={customShutterForm.gi_top_cover_rate_per_sqft}
                      onWheel={(e) => e.target.blur()}
                      onKeyDown={(e) =>
                        (e.key === "ArrowUp" || e.key === "ArrowDown") &&
                        e.preventDefault()
                      }
                      onChange={(e) =>
                        setCustomShutterForm({
                          ...customShutterForm,
                          gi_top_cover_rate_per_sqft: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Live Preview Card */}
                {customPreview && (
                  <div className="calc-preview-box">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: "13px",
                          color: "var(--primary-dark)",
                        }}
                      >
                        Live Calculation Preview
                      </span>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Height: {customPreview.hFt}' | Width:{" "}
                        {customPreview.wFt}'
                      </span>
                    </div>
                    <div className="calc-preview-grid">
                      <div className="calc-preview-item">
                        <div className="label">Over Height (Feet)</div>
                        <div className="value">{customPreview.overH}'</div>
                      </div>
                      <div className="calc-preview-item">
                        <div className="label">Over Width (Feet)</div>
                        <div className="value">{customPreview.overW}'</div>
                      </div>
                      <div className="calc-preview-item">
                        <div className="label">Total sq. ft</div>
                        <div className="value">
                          {customPreview.totalSqft} sq.ft
                        </div>
                      </div>
                      <div className="calc-preview-item">
                        <div className="label">GI Top Cover in sq. ft</div>
                        <div className="value">{customPreview.coverSize}'</div>
                      </div>
                      <div className="calc-preview-item">
                        <div className="label">Shutter Basic</div>
                        <div className="value">
                          ₹{customPreview.shutterBasic}
                        </div>
                      </div>
                      <div className="calc-preview-item">
                        <div className="label">GI Top Cover Basic</div>
                        <div className="value">
                          ₹{customPreview.giCoverBasic}
                        </div>
                      </div>
                      <div className="calc-preview-item">
                        <div className="label">Basic Total</div>
                        <div
                          className="value"
                          style={{ color: "var(--success)", fontWeight: 700 }}
                        >
                          ₹{customPreview.basicTotal}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer-swagat">
                <button
                  type="button"
                  className="btn-outline-swagat"
                  onClick={() => setIsCustomShutterModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary-swagat">
                  Add Shutter to Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SHUTTER ITEM MODAL DIALOG */}
      {isEditShutterModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 1200 }}>
          <div className="modal-content-swagat modal-lg">
            <div className="modal-header-swagat">
              <h3>
                <FiEdit2 style={{ color: "var(--primary)" }} /> Edit Shutter Item Details
              </h3>
              <button
                className="modal-close-btn"
                onClick={() => setIsEditShutterModalOpen(false)}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSaveEditShutterSubmit}>
              <div
                className="modal-body-swagat"
                style={{ maxHeight: "75vh", overflowY: "auto" }}
              >
                {/* Shutter Name */}
                <div style={{ marginBottom: "16px" }}>
                  <label className="form-label-swagat">
                    Shutter Name / Number{" "}
                    <span style={{ color: "var(--danger)" }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control-swagat"
                    placeholder="e.g. Main Entrance Shutter"
                    value={editShutterForm.shutter_name_no}
                    onChange={(e) =>
                      setEditShutterForm({
                        ...editShutterForm,
                        shutter_name_no: e.target.value,
                      })
                    }
                  />
                  {editShutterErrors.shutter_name_no && (
                    <span style={{ fontSize: "12px", color: "var(--danger)" }}>
                      {editShutterErrors.shutter_name_no}
                    </span>
                  )}
                </div>

                {/* Dimensions (H x W) */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                    marginBottom: "16px",
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
                      className="form-control-swagat"
                      placeholder="e.g. 120"
                      value={editShutterForm.height_inches}
                      onWheel={(e) => e.target.blur()}
                      onKeyDown={(e) =>
                        (e.key === "ArrowUp" || e.key === "ArrowDown") &&
                        e.preventDefault()
                      }
                      onChange={(e) =>
                        setEditShutterForm({
                          ...editShutterForm,
                          height_inches: e.target.value,
                        })
                      }
                    />
                    {editShutterForm.height_inches && (
                      <span
                        style={{
                          fontSize: "11px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        ={" "}
                        {(
                          parseFloat(editShutterForm.height_inches) / 12
                        ).toFixed(2)}{" "}
                        Feet
                      </span>
                    )}
                    {editShutterErrors.height_inches && (
                      <span
                        style={{
                          fontSize: "12px",
                          color: "var(--danger)",
                          display: "block",
                        }}
                      >
                        {editShutterErrors.height_inches}
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
                      className="form-control-swagat"
                      placeholder="e.g. 96"
                      value={editShutterForm.width_inches}
                      onWheel={(e) => e.target.blur()}
                      onKeyDown={(e) =>
                        (e.key === "ArrowUp" || e.key === "ArrowDown") &&
                        e.preventDefault()
                      }
                      onChange={(e) =>
                        setEditShutterForm({
                          ...editShutterForm,
                          width_inches: e.target.value,
                        })
                      }
                    />
                    {editShutterForm.width_inches && (
                      <span
                        style={{
                          fontSize: "11px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        ={" "}
                        {(
                          parseFloat(editShutterForm.width_inches) / 12
                        ).toFixed(2)}{" "}
                        Feet
                      </span>
                    )}
                    {editShutterErrors.width_inches && (
                      <span
                        style={{
                          fontSize: "12px",
                          color: "var(--danger)",
                          display: "block",
                        }}
                      >
                        {editShutterErrors.width_inches}
                      </span>
                    )}
                  </div>
                </div>

                {/* Shutter Type */}
                <div style={{ marginBottom: "16px" }}>
                  <label className="form-label-swagat">Shutter Type</label>
                  <div
                    style={{ display: "flex", gap: "20px", paddingTop: "6px" }}
                  >
                    {["Manual", "Gear", "Motorised"].map((t) => (
                      <label
                        key={t}
                        style={{
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <input
                          type="radio"
                          name="edit_shutter_type"
                          value={t}
                          checked={editShutterForm.shutter_type === t}
                          onChange={(e) =>
                            setEditShutterForm({
                              ...editShutterForm,
                              shutter_type: e.target.value,
                            })
                          }
                        />
                        <span>{t}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Dynamic Gear / Motor Price Input */}
                {editShutterForm.shutter_type === "Gear" && (
                  <div
                    style={{
                      backgroundColor: "#FEF3C7",
                      padding: "14px",
                      borderRadius: "6px",
                      border: "1px solid #FDE68A",
                      marginBottom: "16px",
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
                      value={editShutterForm.gear_price}
                      onWheel={(e) => e.target.blur()}
                      onKeyDown={(e) =>
                        (e.key === "ArrowUp" || e.key === "ArrowDown") &&
                        e.preventDefault()
                      }
                      onChange={(e) =>
                        setEditShutterForm({
                          ...editShutterForm,
                          gear_price: e.target.value,
                        })
                      }
                    />
                    {editShutterErrors.gear_price && (
                      <span
                        style={{ fontSize: "12px", color: "var(--danger)" }}
                      >
                        {editShutterErrors.gear_price}
                      </span>
                    )}
                  </div>
                )}

                {editShutterForm.shutter_type === "Motorised" && (
                  <div
                    style={{
                      backgroundColor: "#DBEAFE",
                      padding: "14px",
                      borderRadius: "6px",
                      border: "1px solid #BFDBFE",
                      marginBottom: "16px",
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
                      value={editShutterForm.motor_price}
                      onWheel={(e) => e.target.blur()}
                      onKeyDown={(e) =>
                        (e.key === "ArrowUp" || e.key === "ArrowDown") &&
                        e.preventDefault()
                      }
                      onChange={(e) =>
                        setEditShutterForm({
                          ...editShutterForm,
                          motor_price: e.target.value,
                        })
                      }
                    />
                    {editShutterErrors.motor_price && (
                      <span
                        style={{ fontSize: "12px", color: "var(--danger)" }}
                      >
                        {editShutterErrors.motor_price}
                      </span>
                    )}
                  </div>
                )}

                {/* Fitting Type */}
                <div style={{ marginBottom: "16px" }}>
                  <label className="form-label-swagat">Fitting Type</label>
                  <div
                    style={{ display: "flex", gap: "20px", paddingTop: "6px" }}
                  >
                    {["A Type", "B Type"].map((ft) => (
                      <label
                        key={ft}
                        style={{
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <input
                          type="radio"
                          name="edit_fitting_type"
                          value={ft}
                          checked={editShutterForm.fitting_type === ft}
                          onChange={(e) =>
                            setEditShutterForm({
                              ...editShutterForm,
                              fitting_type: e.target.value,
                            })
                          }
                        />
                        <span>{ft}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rates */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                    marginBottom: "16px",
                  }}
                >
                  <div>
                    <label className="form-label-swagat">
                      Rate per sq. ft (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-control-swagat"
                      placeholder="e.g. 250"
                      value={editShutterForm.rate_per_sqft}
                      onWheel={(e) => e.target.blur()}
                      onKeyDown={(e) =>
                        (e.key === "ArrowUp" || e.key === "ArrowDown") &&
                        e.preventDefault()
                      }
                      onChange={(e) =>
                        setEditShutterForm({
                          ...editShutterForm,
                          rate_per_sqft: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="form-label-swagat">
                      GI Top Cover Rate / R.Ft (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-control-swagat"
                      placeholder="e.g. 80"
                      value={editShutterForm.gi_top_cover_rate_per_sqft}
                      onWheel={(e) => e.target.blur()}
                      onKeyDown={(e) =>
                        (e.key === "ArrowUp" || e.key === "ArrowDown") &&
                        e.preventDefault()
                      }
                      onChange={(e) =>
                        setEditShutterForm({
                          ...editShutterForm,
                          gi_top_cover_rate_per_sqft: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Live Preview Card */}
                {editPreview && (
                  <div className="calc-preview-box">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: "13px",
                          color: "var(--primary-dark)",
                        }}
                      >
                        Recalculated Live Preview
                      </span>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Height: {editPreview.hFt}' | Width:{" "}
                        {editPreview.wFt}'
                      </span>
                    </div>
                    <div className="calc-preview-grid">
                      <div className="calc-preview-item">
                        <div className="label">Over Height (Feet)</div>
                        <div className="value">{editPreview.overH}'</div>
                      </div>
                      <div className="calc-preview-item">
                        <div className="label">Over Width (Feet)</div>
                        <div className="value">{editPreview.overW}'</div>
                      </div>
                      <div className="calc-preview-item">
                        <div className="label">Total sq. ft</div>
                        <div className="value">
                          {editPreview.totalSqft} sq.ft
                        </div>
                      </div>
                      <div className="calc-preview-item">
                        <div className="label">GI Top Cover in sq. ft</div>
                        <div className="value">{editPreview.coverSize}'</div>
                      </div>
                      <div className="calc-preview-item">
                        <div className="label">Shutter Basic</div>
                        <div className="value">
                          ₹{editPreview.shutterBasic}
                        </div>
                      </div>
                      <div className="calc-preview-item">
                        <div className="label">GI Top Cover Basic</div>
                        <div className="value">
                          ₹{editPreview.giCoverBasic}
                        </div>
                      </div>
                      <div className="calc-preview-item">
                        <div className="label">Basic Total</div>
                        <div
                          className="value"
                          style={{ color: "var(--success)", fontWeight: 700 }}
                        >
                          ₹{editPreview.basicTotal}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer-swagat">
                <button
                  type="button"
                  className="btn-outline-swagat"
                  onClick={() => setIsEditShutterModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary-swagat">
                  Save Shutter Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

const fs = require("fs");
const path = require("path");
const { prisma } = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");

const UPLOADS_DIR = path.join(__dirname, "../../uploads/employees");

/**
 * Helper: Ensure uploads directory exists
 */
function ensureUploadsDirExists() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

/**
 * Helper: Delete photo file safely from filesystem
 */
function removePhotoFile(photoUrl) {
  if (!photoUrl || typeof photoUrl !== "string") return;
  try {
    const filename = path.basename(photoUrl);
    const targetPath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
    }
  } catch (e) {
    console.warn("Could not delete employee photo file:", e.message);
  }
}

/**
 * Helper: Validate and save base64 image file
 */
function saveBase64Photo(base64Data, employeeIdentifier) {
  if (!base64Data || typeof base64Data !== "string") {
    throw new Error("Invalid photo data provided");
  }

  // Validate format (data:image/jpeg;base64,....)
  const matches = base64Data.match(/^data:(image\/(jpeg|jpg|png|webp));base64,(.+)$/i);
  if (!matches) {
    throw new Error("Invalid image format. Supported formats are JPG, JPEG, PNG, and WEBP.");
  }

  const mimeType = matches[1].toLowerCase();
  const extensionMap = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  const ext = extensionMap[mimeType] || "jpg";
  const imageBuffer = Buffer.from(matches[3], "base64");

  // Size limit: 5MB (5 * 1024 * 1024 bytes)
  const MAX_SIZE = 5 * 1024 * 1024;
  if (imageBuffer.length > MAX_SIZE) {
    throw new Error("Photo file size exceeds maximum limit of 5MB.");
  }

  if (imageBuffer.length === 0) {
    throw new Error("Photo file is empty or corrupted.");
  }

  ensureUploadsDirExists();
  const safeCode = String(employeeIdentifier).replace(/[^a-zA-Z0-9_-]/g, "_");
  const uniqueFilename = `emp_${safeCode}_${Date.now()}.${ext}`;
  const filePath = path.join(UPLOADS_DIR, uniqueFilename);

  fs.writeFileSync(filePath, imageBuffer);
  return `/uploads/employees/${uniqueFilename}`;
}

/**
 * Validation helper for Employee Master records
 */
function validateEmployeeData(data, isUpdate = false) {
  const errors = [];
  const fullName = data.fullName !== undefined ? data.fullName : data.full_name;
  const employeeCode = data.employeeCode !== undefined ? data.employeeCode : data.employee_code;
  const mobileNumber = data.mobileNumber !== undefined ? data.mobileNumber : data.mobile_number;
  const email = data.email;
  const emergencyContact = data.emergencyContact !== undefined ? data.emergencyContact : data.emergency_contact;
  const joiningDate = data.joiningDate !== undefined ? data.joiningDate : data.joining_date;

  // Full Name validation
  if (!isUpdate || fullName !== undefined) {
    if (!fullName || typeof fullName !== "string" || fullName.trim() === "") {
      errors.push({ field: "fullName", message: "Full Name is required" });
    }
  }

  // Employee Code validation (auto-generated if omitted)
  if (employeeCode !== undefined && employeeCode !== null && String(employeeCode).trim() !== "") {
    const codeClean = String(employeeCode).trim();
    if (!/^[A-Za-z0-9_-]+$/.test(codeClean)) {
      errors.push({
        field: "employeeCode",
        message: "Employee Code can only contain letters, numbers, hyphens, and underscores",
      });
    }
  }

  // Mobile Number validation (10 digits)
  if (!isUpdate || mobileNumber !== undefined) {
    if (!mobileNumber || typeof mobileNumber !== "string") {
      errors.push({ field: "mobileNumber", message: "Mobile number is required" });
    } else {
      const cleaned = mobileNumber.trim();
      if (!/^\d{10}$/.test(cleaned)) {
        errors.push({ field: "mobileNumber", message: "Mobile number must be exactly 10 digits" });
      }
    }
  }

  // Email validation (optional)
  if (email !== undefined && email !== null && String(email).trim() !== "") {
    const emailClean = String(email).trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailClean)) {
      errors.push({ field: "email", message: "Please enter a valid email address" });
    }
  }

  // Emergency Contact validation (optional, 10 digits if provided)
  if (emergencyContact !== undefined && emergencyContact !== null && String(emergencyContact).trim() !== "") {
    const ecClean = String(emergencyContact).trim();
    if (!/^\d{10}$/.test(ecClean)) {
      errors.push({
        field: "emergencyContact",
        message: "Emergency contact number must be exactly 10 digits",
      });
    }
  }

  // Joining Date validation (optional)
  if (joiningDate !== undefined && joiningDate !== null && String(joiningDate).trim() !== "") {
    const parsedDate = new Date(joiningDate);
    if (isNaN(parsedDate.getTime())) {
      errors.push({ field: "joiningDate", message: "Please provide a valid joining date" });
    }
  }

  return errors;
}

/**
 * GET /api/employees
 * List employees with search, department, and status filters, plus KPI summary
 */
async function getEmployees(req, res, next) {
  try {
    const { search, status, department } = req.query;

    const where = {};

    // Status filter: active, inactive, or all
    if (status === "active") {
      where.isActive = true;
    } else if (status === "inactive") {
      where.isActive = false;
    }

    // Department filter
    if (department && department.trim() !== "") {
      where.department = { contains: department.trim(), mode: "insensitive" };
    }

    // Text search on code, name, mobile, city, department
    if (search && search.trim() !== "") {
      const term = search.trim();
      where.OR = [
        { employeeCode: { contains: term, mode: "insensitive" } },
        { fullName: { contains: term, mode: "insensitive" } },
        { mobileNumber: { contains: term, mode: "insensitive" } },
        { department: { contains: term, mode: "insensitive" } },
        { city: { contains: term, mode: "insensitive" } },
      ];
    }

    const [employees, totalCount, activeCount, inactiveCount] = await Promise.all([
      prisma.employee.findMany({
        where,
        orderBy: [{ isActive: "desc" }, { employeeCode: "asc" }],
      }),
      prisma.employee.count(),
      prisma.employee.count({ where: { isActive: true } }),
      prisma.employee.count({ where: { isActive: false } }),
    ]);

    return successResponse(
      res,
      {
        employees,
        summary: {
          total: totalCount,
          active: activeCount,
          inactive: inactiveCount,
        },
      },
      "Employees retrieved successfully"
    );
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/employees/next-code
 * Auto-generate the next recommended Employee Code (e.g., EMP-001, EMP-002)
 */
async function getNextEmployeeCode(req, res, next) {
  try {
    const allEmployees = await prisma.employee.findMany({
      select: { employeeCode: true },
    });

    let maxNumber = 0;
    const regex = /^EMP-(\d+)$/i;

    allEmployees.forEach((emp) => {
      const match = emp.employeeCode.match(regex);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
      }
    });

    const nextNumber = maxNumber + 1;
    const nextCode = `EMP-${String(nextNumber).padStart(3, "0")}`;

    return successResponse(res, { nextCode }, "Next employee code generated");
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/employees/:id
 * Retrieve a single employee's full details
 */
async function getEmployeeById(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(res, "Invalid employee ID", 400);
    }

    const employee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      return errorResponse(res, "Employee not found", 404);
    }

    return successResponse(res, employee, "Employee retrieved successfully");
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/employees
 * Create a new employee record (with optional profile photo)
 */
async function createEmployee(req, res, next) {
  try {
    const errors = validateEmployeeData(req.body, false);
    if (errors.length > 0) {
      return errorResponse(res, "Validation failed", 400, errors);
    }

    let employeeCode = (req.body.employeeCode || req.body.employee_code || "").trim().toUpperCase();
    if (!employeeCode) {
      const allEmployees = await prisma.employee.findMany({
        select: { employeeCode: true },
      });
      let maxNumber = 0;
      const regex = /^EMP-(\d+)$/i;
      allEmployees.forEach((emp) => {
        const match = emp.employeeCode.match(regex);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxNumber) {
            maxNumber = num;
          }
        }
      });
      employeeCode = `EMP-${String(maxNumber + 1).padStart(3, "0")}`;
    }

    const fullName = (req.body.fullName || req.body.full_name).trim();
    const mobileNumber = (req.body.mobileNumber || req.body.mobile_number).trim();
    const email = req.body.email ? req.body.email.trim() : null;
    const department = req.body.department ? req.body.department.trim() : null;
    const address = req.body.address ? req.body.address.trim() : null;
    const city = req.body.city ? req.body.city.trim() : null;
    const emergencyContact = (req.body.emergencyContact || req.body.emergency_contact || "").trim() || null;
    const remark = req.body.remark ? req.body.remark.trim() : null;
    const isActive = req.body.isActive !== undefined ? Boolean(req.body.isActive) : true;

    let joiningDate = null;
    const rawJoiningDate = req.body.joiningDate !== undefined ? req.body.joiningDate : req.body.joining_date;
    if (rawJoiningDate) {
      joiningDate = new Date(rawJoiningDate);
    }

    // Process photo if provided
    let photoUrl = null;
    const rawPhoto = req.body.photo || req.body.photoUrl || req.body.photo_url;
    if (rawPhoto && typeof rawPhoto === "string" && rawPhoto.startsWith("data:image/")) {
      try {
        photoUrl = saveBase64Photo(rawPhoto, employeeCode);
      } catch (err) {
        return errorResponse(res, err.message, 400, [{ field: "photo", message: err.message }]);
      }
    } else if (rawPhoto && typeof rawPhoto === "string" && !rawPhoto.startsWith("data:")) {
      photoUrl = rawPhoto;
    }

    // Check unique employee code
    const existingCode = await prisma.employee.findUnique({
      where: { employeeCode },
    });

    if (existingCode) {
      if (photoUrl && photoUrl.startsWith("/uploads/")) {
        removePhotoFile(photoUrl);
      }
      return errorResponse(
        res,
        `Employee Code '${employeeCode}' is already registered. Please use a unique Code.`,
        400,
        [{ field: "employeeCode", message: `Employee Code '${employeeCode}' is already in use` }]
      );
    }

    const baseSalary = req.body.baseSalary !== undefined ? Math.max(0, parseFloat(req.body.baseSalary) || 0) : 0;
    const salaryType = (req.body.salaryType || "MONTHLY").trim().toUpperCase();
    let overtimeRate = req.body.overtimeRate !== undefined && req.body.overtimeRate !== "" ? Math.max(0, parseFloat(req.body.overtimeRate) || 0) : 0;
    if (overtimeRate <= 0 && baseSalary > 0) {
      overtimeRate = salaryType === "DAILY" ? baseSalary / 8 : baseSalary / 240;
    }
    overtimeRate = Math.round(overtimeRate * 100) / 100;

    const employee = await prisma.employee.create({
      data: {
        employeeCode,
        fullName,
        mobileNumber,
        email,
        department,
        joiningDate,
        address,
        city,
        emergencyContact,
        photoUrl,
        baseSalary,
        salaryType,
        overtimeRate,
        isActive,
        remark,
      },
    });

    return successResponse(res, employee, "Employee registered successfully", 201);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/employees/:id
 * Update an existing employee record
 */
async function updateEmployee(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(res, "Invalid employee ID", 400);
    }

    const existing = await prisma.employee.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, "Employee not found", 404);
    }

    const errors = validateEmployeeData(req.body, true);
    if (errors.length > 0) {
      return errorResponse(res, "Validation failed", 400, errors);
    }

    const updateData = {};

    if (req.body.fullName !== undefined || req.body.full_name !== undefined) {
      updateData.fullName = (req.body.fullName || req.body.full_name).trim();
    }

    if (req.body.employeeCode !== undefined || req.body.employee_code !== undefined) {
      const code = (req.body.employeeCode || req.body.employee_code).trim().toUpperCase();
      if (code !== existing.employeeCode) {
        const duplicate = await prisma.employee.findUnique({
          where: { employeeCode: code },
        });
        if (duplicate && duplicate.id !== id) {
          return errorResponse(
            res,
            `Employee Code '${code}' is already registered. Please use a unique Code.`,
            400,
            [{ field: "employeeCode", message: `Employee Code '${code}' is already in use` }]
          );
        }
      }
      updateData.employeeCode = code;
    }

    if (req.body.mobileNumber !== undefined || req.body.mobile_number !== undefined) {
      updateData.mobileNumber = (req.body.mobileNumber || req.body.mobile_number).trim();
    }

    if (req.body.email !== undefined) {
      updateData.email = req.body.email ? req.body.email.trim() : null;
    }

    if (req.body.department !== undefined) {
      updateData.department = req.body.department ? req.body.department.trim() : null;
    }

    if (req.body.address !== undefined) {
      updateData.address = req.body.address ? req.body.address.trim() : null;
    }

    if (req.body.city !== undefined) {
      updateData.city = req.body.city ? req.body.city.trim() : null;
    }

    if (req.body.emergencyContact !== undefined || req.body.emergency_contact !== undefined) {
      const ec = (req.body.emergencyContact || req.body.emergency_contact || "").trim();
      updateData.emergencyContact = ec || null;
    }

    if (req.body.joiningDate !== undefined || req.body.joining_date !== undefined) {
      const rawDate = req.body.joiningDate !== undefined ? req.body.joiningDate : req.body.joining_date;
      updateData.joiningDate = rawDate ? new Date(rawDate) : null;
    }

    if (req.body.baseSalary !== undefined) {
      updateData.baseSalary = Math.max(0, parseFloat(req.body.baseSalary) || 0);
    }

    if (req.body.salaryType !== undefined) {
      updateData.salaryType = String(req.body.salaryType).trim().toUpperCase();
    }

    const effSalary = updateData.baseSalary !== undefined ? updateData.baseSalary : parseFloat(existing.baseSalary || 0);
    const effType = updateData.salaryType !== undefined ? updateData.salaryType : (existing.salaryType || "MONTHLY");

    if (req.body.overtimeRate !== undefined && req.body.overtimeRate !== "" && req.body.overtimeRate !== null) {
      const parsedOt = Math.max(0, parseFloat(req.body.overtimeRate) || 0);
      if (parsedOt > 0) {
        updateData.overtimeRate = Math.round(parsedOt * 100) / 100;
      } else if (effSalary > 0) {
        updateData.overtimeRate = Math.round((effType === "DAILY" ? effSalary / 8 : effSalary / 240) * 100) / 100;
      } else {
        updateData.overtimeRate = 0;
      }
    } else if (req.body.baseSalary !== undefined || req.body.salaryType !== undefined) {
      const currentOt = parseFloat(existing.overtimeRate || 0);
      if (currentOt <= 0 && effSalary > 0) {
        updateData.overtimeRate = Math.round((effType === "DAILY" ? effSalary / 8 : effSalary / 240) * 100) / 100;
      }
    }

    if (req.body.isActive !== undefined) {
      updateData.isActive = Boolean(req.body.isActive);
    }

    if (req.body.remark !== undefined) {
      updateData.remark = req.body.remark ? req.body.remark.trim() : null;
    }

    // Photo update / removal handling
    if (req.body.removePhoto || req.body.photoUrl === null || req.body.photo_url === null) {
      if (existing.photoUrl) {
        removePhotoFile(existing.photoUrl);
      }
      updateData.photoUrl = null;
    } else {
      const rawPhoto = req.body.photo || req.body.photoUrl || req.body.photo_url;
      if (rawPhoto && typeof rawPhoto === "string" && rawPhoto.startsWith("data:image/")) {
        try {
          if (existing.photoUrl) {
            removePhotoFile(existing.photoUrl);
          }
          const targetCode = updateData.employeeCode || existing.employeeCode;
          updateData.photoUrl = saveBase64Photo(rawPhoto, targetCode);
        } catch (err) {
          return errorResponse(res, err.message, 400, [{ field: "photo", message: err.message }]);
        }
      }
    }

    const updated = await prisma.employee.update({
      where: { id },
      data: updateData,
    });

    return successResponse(res, updated, "Employee details updated successfully");
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/employees/:id/photo
 * Dedicated photo upload endpoint
 */
async function uploadEmployeePhoto(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(res, "Invalid employee ID", 400);
    }

    const existing = await prisma.employee.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, "Employee not found", 404);
    }

    const rawPhoto = req.body.image || req.body.photo || req.body.photoUrl;
    if (!rawPhoto || typeof rawPhoto !== "string") {
      return errorResponse(res, "Please select an image file to upload", 400, [
        { field: "photo", message: "Photo data is required" },
      ]);
    }

    let newPhotoUrl;
    try {
      if (existing.photoUrl) {
        removePhotoFile(existing.photoUrl);
      }
      newPhotoUrl = saveBase64Photo(rawPhoto, existing.employeeCode);
    } catch (err) {
      return errorResponse(res, err.message, 400, [{ field: "photo", message: err.message }]);
    }

    const updated = await prisma.employee.update({
      where: { id },
      data: { photoUrl: newPhotoUrl },
    });

    return successResponse(res, updated, "Employee profile photo uploaded successfully");
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/employees/:id/photo
 * Remove employee profile photo
 */
async function deleteEmployeePhoto(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(res, "Invalid employee ID", 400);
    }

    const existing = await prisma.employee.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, "Employee not found", 404);
    }

    if (existing.photoUrl) {
      removePhotoFile(existing.photoUrl);
    }

    const updated = await prisma.employee.update({
      where: { id },
      data: { photoUrl: null },
    });

    return successResponse(res, updated, "Employee photo removed successfully");
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/employees/:id/status
 * Toggle or set employee active/inactive status
 */
async function toggleEmployeeStatus(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(res, "Invalid employee ID", 400);
    }

    const existing = await prisma.employee.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, "Employee not found", 404);
    }

    const newStatus =
      req.body.isActive !== undefined ? Boolean(req.body.isActive) : !existing.isActive;

    const updated = await prisma.employee.update({
      where: { id },
      data: { isActive: newStatus },
    });

    const actionText = newStatus ? "activated" : "deactivated";
    return successResponse(res, updated, `Employee successfully ${actionText}`);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/employees/:id
 * Delete employee record
 */
async function deleteEmployee(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return errorResponse(res, "Invalid employee ID", 400);
    }

    const existing = await prisma.employee.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, "Employee not found", 404);
    }

    if (existing.photoUrl) {
      removePhotoFile(existing.photoUrl);
    }

    await prisma.employee.delete({ where: { id } });

    return successResponse(res, null, "Employee record deleted successfully");
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getEmployees,
  getNextEmployeeCode,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  uploadEmployeePhoto,
  deleteEmployeePhoto,
  toggleEmployeeStatus,
  deleteEmployee,
};

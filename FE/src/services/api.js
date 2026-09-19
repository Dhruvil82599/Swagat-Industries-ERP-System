/**
 * Swagat ERP API Service Client
 */

const BASE_URL = "/api";

function getAuthHeaders() {
  const token = localStorage.getItem("swagat_erp_token");
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) {
      // Clear token on 401 Unauthorized if token was present
      const currentToken = localStorage.getItem("swagat_erp_token");
      if (currentToken) {
        localStorage.removeItem("swagat_erp_token");
        localStorage.removeItem("swagat_erp_user");
        // Dispatch custom event so AuthContext can handle redirect without full refresh
        window.dispatchEvent(new Event("swagat_auth_expired"));
      }
    }
    const errorMsg = data.message || "An error occurred during the request";
    const error = new Error(errorMsg);
    error.status = response.status;
    error.errors = data.errors || [];
    throw error;
  }
  return data.data;
}

export const authAPI = {
  login: (credentials) =>
    fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    }).then(handleResponse),

  getMe: () =>
    fetch(`${BASE_URL}/auth/me`, {
      method: "GET",
      headers: getAuthHeaders(),
    }).then(handleResponse),

  logout: () =>
    fetch(`${BASE_URL}/auth/logout`, {
      method: "POST",
      headers: getAuthHeaders(),
    }).then(handleResponse),

  changePassword: (data) =>
    fetch(`${BASE_URL}/auth/change-password`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),
};

export const api = {
  // Customers
  getCustomers: (search = "") => {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    return fetch(`${BASE_URL}/customers${query}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse);
  },
  getCustomerById: (id) =>
    fetch(`${BASE_URL}/customers/${id}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),
  createCustomer: (data) =>
    fetch(`${BASE_URL}/customers`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),
  updateCustomer: (id, data) =>
    fetch(`${BASE_URL}/customers/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),
  deleteCustomer: (id) =>
    fetch(`${BASE_URL}/customers/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // Industries
  getIndustries: (customerId = "", search = "") => {
    const params = new URLSearchParams();
    if (customerId) params.append("customerId", customerId);
    if (search) params.append("search", search);
    const query = params.toString() ? `?${params.toString()}` : "";
    return fetch(`${BASE_URL}/industries${query}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse);
  },
  getIndustryById: (id) =>
    fetch(`${BASE_URL}/industries/${id}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),
  createIndustry: (data) =>
    fetch(`${BASE_URL}/industries`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),
  updateIndustry: (id, data) =>
    fetch(`${BASE_URL}/industries/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),
  deleteIndustry: (id) =>
    fetch(`${BASE_URL}/industries/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // Sites
  getSites: (industryId = "", search = "") => {
    const params = new URLSearchParams();
    if (industryId) params.append("industryId", industryId);
    if (search) params.append("search", search);
    const query = params.toString() ? `?${params.toString()}` : "";
    return fetch(`${BASE_URL}/sites${query}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse);
  },
  getSiteById: (id) =>
    fetch(`${BASE_URL}/sites/${id}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),
  createSite: (data) =>
    fetch(`${BASE_URL}/sites`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),
  updateSite: (id, data) =>
    fetch(`${BASE_URL}/sites/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),
  deleteSite: (id) =>
    fetch(`${BASE_URL}/sites/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // Shutters
  getShutters: (siteId = "", search = "") => {
    const params = new URLSearchParams();
    if (siteId) params.append("siteId", siteId);
    if (search) params.append("search", search);
    const query = params.toString() ? `?${params.toString()}` : "";
    return fetch(`${BASE_URL}/shutters${query}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse);
  },
  getShutterById: (id) =>
    fetch(`${BASE_URL}/shutters/${id}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),
  createShutter: (data) =>
    fetch(`${BASE_URL}/shutters`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),
  updateShutter: (id, data) =>
    fetch(`${BASE_URL}/shutters/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),
  deleteShutter: (id) =>
    fetch(`${BASE_URL}/shutters/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // Quotations
  getQuotations: (
    search = "",
    customerId = "",
    industryId = "",
    siteId = "",
    startDate = "",
    endDate = "",
  ) => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (customerId) params.append("customerId", customerId);
    if (industryId) params.append("industryId", industryId);
    if (siteId) params.append("siteId", siteId);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    const query = params.toString() ? `?${params.toString()}` : "";
    return fetch(`${BASE_URL}/quotations${query}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse);
  },
  getQuotationById: (id) =>
    fetch(`${BASE_URL}/quotations/${id}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),
  createQuotation: (data) =>
    fetch(`${BASE_URL}/quotations`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),
  updateQuotation: (id, data) =>
    fetch(`${BASE_URL}/quotations/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),
  deleteQuotation: (id) =>
    fetch(`${BASE_URL}/quotations/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // Payments
  getPayments: (quotationId = "") => {
    const query = quotationId ? `?quotationId=${quotationId}` : "";
    return fetch(`${BASE_URL}/payments${query}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse);
  },
  getPaymentById: (id) =>
    fetch(`${BASE_URL}/payments/${id}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),
  createPayment: (data) =>
    fetch(`${BASE_URL}/payments`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),
  updatePayment: (id, data) =>
    fetch(`${BASE_URL}/payments/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),
  deletePayment: (id) =>
    fetch(`${BASE_URL}/payments/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // Company Settings
  getCompanySettings: () =>
    fetch(`${BASE_URL}/company-settings`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),
  updateCompanySettings: (data) =>
    fetch(`${BASE_URL}/company-settings`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  // Quotation Terms
  getQuotationTerms: () =>
    fetch(`${BASE_URL}/quotation-terms`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),
  createQuotationTerm: (data) =>
    fetch(`${BASE_URL}/quotation-terms`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),
  updateQuotationTerm: (id, data) =>
    fetch(`${BASE_URL}/quotation-terms/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),
  deleteQuotationTerm: (id) =>
    fetch(`${BASE_URL}/quotation-terms/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // Dashboard
  getDashboardStats: () =>
    fetch(`${BASE_URL}/dashboard`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  // Health Check (Public)
  checkHealth: () => fetch(`${BASE_URL}/health`).then(handleResponse),
};

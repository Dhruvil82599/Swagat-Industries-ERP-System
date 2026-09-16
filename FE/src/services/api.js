/**
 * Swagat ERP API Service Client
 */

const BASE_URL = "/api";

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data.message || "An error occurred during the request";
    const error = new Error(errorMsg);
    error.status = response.status;
    error.errors = data.errors || [];
    throw error;
  }
  return data.data;
}

export const api = {
  // Customers
  getCustomers: (search = "") => {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    return fetch(`${BASE_URL}/customers${query}`).then(handleResponse);
  },
  getCustomerById: (id) =>
    fetch(`${BASE_URL}/customers/${id}`).then(handleResponse),
  createCustomer: (data) =>
    fetch(`${BASE_URL}/customers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handleResponse),
  updateCustomer: (id, data) =>
    fetch(`${BASE_URL}/customers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handleResponse),
  deleteCustomer: (id) =>
    fetch(`${BASE_URL}/customers/${id}`, {
      method: "DELETE",
    }).then(handleResponse),

  // Industries
  getIndustries: (customerId = "", search = "") => {
    const params = new URLSearchParams();
    if (customerId) params.append("customerId", customerId);
    if (search) params.append("search", search);
    const query = params.toString() ? `?${params.toString()}` : "";
    return fetch(`${BASE_URL}/industries${query}`).then(handleResponse);
  },
  getIndustryById: (id) =>
    fetch(`${BASE_URL}/industries/${id}`).then(handleResponse),
  createIndustry: (data) =>
    fetch(`${BASE_URL}/industries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handleResponse),
  updateIndustry: (id, data) =>
    fetch(`${BASE_URL}/industries/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handleResponse),
  deleteIndustry: (id) =>
    fetch(`${BASE_URL}/industries/${id}`, {
      method: "DELETE",
    }).then(handleResponse),

  // Sites
  getSites: (industryId = "", search = "") => {
    const params = new URLSearchParams();
    if (industryId) params.append("industryId", industryId);
    if (search) params.append("search", search);
    const query = params.toString() ? `?${params.toString()}` : "";
    return fetch(`${BASE_URL}/sites${query}`).then(handleResponse);
  },
  getSiteById: (id) => fetch(`${BASE_URL}/sites/${id}`).then(handleResponse),
  createSite: (data) =>
    fetch(`${BASE_URL}/sites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handleResponse),
  updateSite: (id, data) =>
    fetch(`${BASE_URL}/sites/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handleResponse),
  deleteSite: (id) =>
    fetch(`${BASE_URL}/sites/${id}`, {
      method: "DELETE",
    }).then(handleResponse),

  // Shutters
  getShutters: (siteId = "", search = "") => {
    const params = new URLSearchParams();
    if (siteId) params.append("siteId", siteId);
    if (search) params.append("search", search);
    const query = params.toString() ? `?${params.toString()}` : "";
    return fetch(`${BASE_URL}/shutters${query}`).then(handleResponse);
  },
  getShutterById: (id) =>
    fetch(`${BASE_URL}/shutters/${id}`).then(handleResponse),
  createShutter: (data) =>
    fetch(`${BASE_URL}/shutters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handleResponse),
  updateShutter: (id, data) =>
    fetch(`${BASE_URL}/shutters/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handleResponse),
  deleteShutter: (id) =>
    fetch(`${BASE_URL}/shutters/${id}`, {
      method: "DELETE",
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
    return fetch(`${BASE_URL}/quotations${query}`).then(handleResponse);
  },
  getQuotationById: (id) =>
    fetch(`${BASE_URL}/quotations/${id}`).then(handleResponse),
  createQuotation: (data) =>
    fetch(`${BASE_URL}/quotations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handleResponse),
  updateQuotation: (id, data) =>
    fetch(`${BASE_URL}/quotations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handleResponse),
  deleteQuotation: (id) =>
    fetch(`${BASE_URL}/quotations/${id}`, {
      method: "DELETE",
    }).then(handleResponse),

  // Health
  checkHealth: () => fetch(`${BASE_URL}/health`).then(handleResponse),
};

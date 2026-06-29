import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "/api";

function getToken() {
  return localStorage.getItem("cureka_token");
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await axios({
      url: `${BASE}${path}`,
      method,
      headers,
      data: body,
    });
    return res.data;
  } catch (error) {
    if (error.response) {
      const err = new Error(error.response.data?.error || `Request failed (${error.response.status})`);
      err.status = error.response.status;
      throw err;
    }
    throw error;
  }
}

export const api = {
  login: (email, password) => request("/auth/login", { method: "POST", body: { email, password }, auth: false }),
  me: () => request("/auth/me"),

  getQueue: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/customers/queue${qs ? `?${qs}` : ""}`);
  },
  listCustomers: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/customers${qs ? `?${qs}` : ""}`);
  },
  getDueCallbacks: () => request("/customers/callbacks/due"),
  getCustomer: (id) => request(`/customers/${id}`),
  createCustomer: (payload) => request("/customers", { method: "POST", body: payload }),
  bulkImport: (rows) => request("/customers/bulk", { method: "POST", body: { rows } }),
  updateCustomer: (id, payload) => request(`/customers/${id}`, { method: "PATCH", body: payload }),
  deleteCustomer: (id) => request(`/customers/${id}`, { method: "DELETE" }),
  logCall: (id, payload) => request(`/customers/${id}/calls`, { method: "POST", body: payload }),

  getLeaderboard: (range = "today") => request(`/admin/leaderboard?range=${range}`),
  getOverview: () => request("/admin/overview"),
  listAgents: () => request("/admin/agents"),
  createAgent: (payload) => request("/admin/agents", { method: "POST", body: payload }),
  updateAgent: (id, payload) => request(`/admin/agents/${id}`, { method: "PATCH", body: payload }),

  addTag: (customerId, tag, tag_type) => request(`/customers/${customerId}/tags`, { method: "POST", body: { tag, tag_type } }),
  removeTag: (customerId, tagId) => request(`/customers/${customerId}/tags/${tagId}`, { method: "DELETE" }),

  getInsightsAttention: () => request("/insights/attention"),
  getInsightsAgents: (range = "7d") => request(`/insights/agents?range=${range}`),
  getInsightsConversion: (range = "7d") => request(`/insights/conversion?range=${range}`),
};

export { getToken };

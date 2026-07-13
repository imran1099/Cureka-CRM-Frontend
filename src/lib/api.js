import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "/api";

function getToken() {
  return localStorage.getItem("cureka_token");
}

function getBrandId() {
  return localStorage.getItem("cureka_selected_brand");
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let url = `${BASE}${path}`;
  let finalBody = body;

  const brandId = getBrandId();
  if (brandId && auth) {
    // Exclude brand APIs from auto-injection
    if (!path.startsWith("/brands")) {
      if (method === "GET" || method === "DELETE") {
        const char = url.includes("?") ? "&" : "?";
        url += `${char}brand_id=${encodeURIComponent(brandId)}`;
      } else {
        if (!finalBody) finalBody = {};
        if (typeof finalBody === 'object' && !Array.isArray(finalBody) && !finalBody.brand_id) {
          finalBody.brand_id = brandId;
        } else if (Array.isArray(finalBody)) {
          // If bulk import, handle carefully or let the route handle it
        }
      }
    }
  }

  try {
    const res = await axios({
      url,
      method,
      headers,
      data: finalBody,
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
  // Auth
  login: (email, password) => request("/auth/login", { method: "POST", body: { email, password }, auth: false }),
  logout: () => request("/auth/logout", { method: "POST" }),
  me: () => request("/auth/me"),
  changePassword: (payload) => request("/auth/change-password", { method: "POST", body: payload }),

  // IAM: Users
  iam: {
    listUsers: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/users${qs ? `?${qs}` : ""}`);
    },
    getUser: (id) => request(`/users/${id}`),
    getTeam: (id) => request(`/users/${id}/team`),
    createUser: (payload) => request("/users", { method: "POST", body: payload }),
    updateUser: (id, payload) => request(`/users/${id}`, { method: "PATCH", body: payload }),
    updateProfile: (payload) => request("/users/me", { method: "PATCH", body: payload }),
    updateStatus: (id, status) => request(`/users/${id}/status`, { method: "PATCH", body: { status } }),
    resetPassword: (id, payload) => request(`/users/${id}/reset-password`, { method: "POST", body: payload }),
  },

  // IAM: Roles & Permissions
  roles: {
    listRoles: () => request("/roles"),
    getRole: (id) => request(`/roles/${id}`),
    getPermissionsMatrix: (id) => request(`/roles/${id}/permissions`),
    setPermissionsMatrix: (id, permission_ids) => request(`/roles/${id}/permissions`, { method: "PUT", body: { permission_ids } }),
    createRole: (payload) => request("/roles", { method: "POST", body: payload }),
    updateRole: (id, payload) => request(`/roles/${id}`, { method: "PATCH", body: payload }),
    deleteRole: (id) => request(`/roles/${id}`, { method: "DELETE" }),
  },

  permissions: {
    list: () => request("/permissions"),
  },

  // IAM: Departments
  departments: {
    list: () => request("/departments"),
    get: (id) => request(`/departments/${id}`),
    create: (payload) => request("/departments", { method: "POST", body: payload }),
    update: (id, payload) => request(`/departments/${id}`, { method: "PATCH", body: payload }),
    delete: (id) => request(`/departments/${id}`, { method: "DELETE" }),
  },

  // IAM: Sessions
  sessions: {
    list: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/sessions${qs ? `?${qs}` : ""}`);
    },
    terminate: (id) => request(`/sessions/${id}`, { method: "DELETE" }),
    terminateAllForUser: (userId) => request(`/sessions/user/${userId}`, { method: "DELETE" }),
  },

  // IAM: Audit & Logs
  audit: {
    listLogs: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/audit${qs ? `?${qs}` : ""}`);
    },
    listLoginHistory: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/audit/login-history${qs ? `?${qs}` : ""}`);
    },
  },

  // IAM: Notifications
  notifications: {
    list: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/notifications${qs ? `?${qs}` : ""}`);
    },
    markRead: (id) => request(`/notifications/${id}/read`, { method: "PATCH" }),
    markAllRead: () => request("/notifications/read-all", { method: "PATCH" }),
    dismiss: (id) => request(`/notifications/${id}`, { method: "DELETE" }),
  },

  // Brands
  listBrands: () => request("/brands"),
  createBrand: (payload) => request("/brands", { method: "POST", body: payload }),
  updateBrand: (id, payload) => request(`/brands/${id}`, { method: "PATCH", body: payload }),
  deleteBrand: (id) => request(`/brands/${id}`, { method: "DELETE" }),

  // Customers
  getQueue: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/customers/queue${qs ? `?${qs}` : ""}`);
  },
  listCustomers: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/customers${qs ? `?${qs}` : ""}`);
  },
  searchCustomers: (q) => request(`/customers?q=${encodeURIComponent(q)}`),
  getDueCallbacks: () => request("/customers/callbacks/due"),
  getCustomer: (id) => request(`/customers/${id}`),
  getCustomer360: (id) => request(`/customers/${id}/360`),
  getCustomerTimeline: (id) => request(`/customers/${id}/timeline`),
  addCustomerNote: (id, payload) => request(`/customers/${id}/notes`, { method: "POST", body: payload }),
  createFollowup: (id, payload) => request(`/customers/${id}/followups`, { method: "POST", body: payload }),
  manageAddress: (id, payload) => request(`/customers/${id}/addresses`, { method: "POST", body: payload }),
  createCustomer: (payload) => request("/customers", { method: "POST", body: payload }),
  bulkImport: (rows) => request("/customers/bulk", { method: "POST", body: { rows } }),
  updateCustomer: (id, payload) => request(`/customers/${id}`, { method: "PATCH", body: payload }),
  deleteCustomer: (id) => request(`/customers/${id}`, { method: "DELETE" }),
  logCall: (id, payload) => request(`/customers/${id}/calls`, { method: "POST", body: payload }),

  addTag: (customerId, tag, tag_type) => request(`/customers/${customerId}/tags`, { method: "POST", body: { tag, tag_type } }),
  removeTag: (customerId, tagId) => request(`/customers/${customerId}/tags/${tagId}`, { method: "DELETE" }),

  // Tickets
  tickets: {
    list: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/tickets${qs ? `?${qs}` : ""}`);
    },
    get: (id) => request(`/tickets/${id}`),
    create: (payload) => request("/tickets", { method: "POST", body: payload }),
    update: (id, payload) => request(`/tickets/${id}`, { method: "PATCH", body: payload }),
    addComment: (id, payload) => request(`/tickets/${id}/comments`, { method: "POST", body: payload }),
    getCategories: () => request("/tickets/config/categories"),
    createCategory: (payload) => request("/tickets/config/categories", { method: "POST", body: payload }),
    getSlaRules: () => request("/tickets/config/sla"),
    createSlaRule: (payload) => request("/tickets/config/sla", { method: "POST", body: payload }),
  },

  // Calls
  calls: {
    getQueue: () => request("/calls/queue"),
    logCall: (payload) => request("/calls", { method: "POST", body: payload }),
    getScript: (category) => request(`/calls/scripts/${category}`),
    saveScript: (payload) => request("/calls/scripts", { method: "POST", body: payload }),
    getAnalytics: () => request("/calls/analytics"),
  },

  // Customer Success Command Center
  cscc: {
    getQueues: () => request("/cscc/queues"),
    getMyWorkspace: () => request("/cscc/my-workspace"),
    getTasks: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/cscc/tasks${qs ? `?${qs}` : ""}`);
    },
    createTask: (payload) => request("/cscc/tasks", { method: "POST", body: payload }),
    updateTask: (id, payload) => request(`/cscc/tasks/${id}`, { method: "PATCH", body: payload }),
    scheduleFollowup: (id, payload) => request(`/cscc/tasks/${id}/followup`, { method: "POST", body: payload }),
    getAnalytics: () => request("/cscc/analytics"),
    getCampaigns: () => request("/cscc/campaigns"),
    createCampaign: (payload) => request("/cscc/campaigns", { method: "POST", body: payload }),
  },

  // Sales CRM & Revenue Engine
  cre: {
    getStages: () => request("/cre/stages"),
    createStage: (payload) => request("/cre/stages", { method: "POST", body: payload }),
    getPipeline: () => request("/cre/pipeline"),
    getOpportunities: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/cre/opportunities${qs ? `?${qs}` : ""}`);
    },
    createOpportunity: (payload) => request("/cre/opportunities", { method: "POST", body: payload }),
    getOpportunity: (id) => request(`/cre/opportunities/${id}`),
    updateOpportunity: (id, payload) => request(`/cre/opportunities/${id}`, { method: "PATCH", body: payload }),
    addActivity: (id, payload) => request(`/cre/opportunities/${id}/activities`, { method: "POST", body: payload }),
    scheduleFollowup: (id, payload) => request(`/cre/opportunities/${id}/followups`, { method: "POST", body: payload }),
    getAnalytics: () => request("/cre/analytics"),
    getCampaigns: () => request("/cre/campaigns"),
    createCampaign: (payload) => request("/cre/campaigns", { method: "POST", body: payload }),
    updateCampaign: (id, payload) => request(`/cre/campaigns/${id}`, { method: "PATCH", body: payload }),
    deleteCampaign: (id) => request(`/cre/campaigns/${id}`, { method: "DELETE" }),
    getRecommendations: (customerId, limit = 5) => request(`/cre/recommendations/${customerId}?limit=${limit}`),
    getAIForecast: () => request("/cre/ai-forecast"),
  },

  // Admin / Insights
  getLeaderboard: (range = "today") => request(`/admin/leaderboard?range=${range}`),
  getOverview: () => request("/admin/overview"),
  listAgents: () => request("/admin/agents"),
  createAgent: (payload) => request("/admin/agents", { method: "POST", body: payload }),
  updateAgent: (id, payload) => request(`/admin/agents/${id}`, { method: "PATCH", body: payload }),

  getInsightsAttention: () => request("/insights/attention"),
  getInsightsAgents: (range = "7d") => request(`/insights/agents?range=${range}`),
  getInsightsConversion: (range = "7d") => request(`/insights/conversion?range=${range}`),

  // Customer Journey Intelligence Timeline
  timeline: {
    getEvents: (customerId, params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/timeline/${customerId}${qs ? `?${qs}` : ""}`);
    },
    addNote: (customerId, payload) => request(`/timeline/${customerId}/note`, { method: "POST", body: payload }),
    getMilestones: (customerId) => request(`/timeline/${customerId}/milestones`),
    getInsights: (customerId) => request(`/timeline/${customerId}/insights`),
    getAnalytics: (customerId) => request(`/timeline/${customerId}/analytics`),
    getEventTypes: () => request("/timeline/event-types/all"),
  },

  // Intelligent Follow-up & Workflow Automation Engine
  followups: {
    getCategories: () => request("/followups/categories"),
    getDashboardToday: () => request("/followups/dashboard/today"),
    getStats: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/followups/dashboard/stats${qs ? `?${qs}` : ""}`);
    },
    list: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/followups${qs ? `?${qs}` : ""}`);
    },
    get: (id) => request(`/followups/${id}`),
    create: (payload) => request("/followups", { method: "POST", body: payload }),
    update: (id, payload) => request(`/followups/${id}`, { method: "PATCH", body: payload }),
    cancel: (id) => request(`/followups/${id}`, { method: "DELETE" }),
    getRules: () => request("/followups/rules/list"),
    createRule: (payload) => request("/followups/rules/create", { method: "POST", body: payload }),
    updateRule: (id, payload) => request(`/followups/rules/${id}`, { method: "PATCH", body: payload }),
    deleteRule: (id) => request(`/followups/rules/${id}`, { method: "DELETE" }),
  },
  
  // Workflow Automation Engine
  workflowRules: {
    list: () => request("/followups/workflow-rules"),
    create: (payload) => request("/followups/workflow-rules", { method: "POST", body: payload }),
    update: (id, payload) => request(`/followups/workflow-rules/${id}`, { method: "PATCH", body: payload }),
    delete: (id) => request(`/followups/workflow-rules/${id}`, { method: "DELETE" }),
  },
  
  // Shopify Integration Layer
  shopify: {
    getStores: (brandId) => request(`/shopify/stores${brandId ? `?brand_id=${brandId}` : ''}`),
    connectStore: (payload) => request("/shopify/stores", { method: "POST", body: payload }),
    startBulkImport: (payload) => request("/shopify/sync/bulk", { method: "POST", body: payload }),
    getSyncStatus: (storeId, logId) => request(`/shopify/sync/status/${storeId}/${logId}`),
    getLogs: (storeId) => request(`/shopify/logs/${storeId}`),
  },

  // Enterprise Knowledge & Learning Hub
  knowledge: {
    getCategories: (brandId) => request(`/knowledge/categories${brandId ? `?brand_id=${brandId}` : ''}`),
    createCategory: (payload) => request("/knowledge/categories", { method: "POST", body: payload }),
    
    getArticles: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/knowledge/articles${qs ? `?${qs}` : ''}`);
    },
    getArticle: (id) => request(`/knowledge/articles/${id}`),
    createArticle: (payload) => request("/knowledge/articles", { method: "POST", body: payload }),
    
    submitForReview: (id) => request(`/knowledge/articles/${id}/submit`, { method: "POST" }),
    publishArticle: (id) => request(`/knowledge/articles/${id}/publish`, { method: "POST" }),
    markAsRead: (id) => request(`/knowledge/articles/${id}/read`, { method: "POST" }),
    
    getRecommendations: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/knowledge/recommend${qs ? `?${qs}` : ''}`);
    }
  },

  // Enterprise Business Intelligence & Command Center (BICC)
  bi: {
    getDashboard: () => request("/bi/dashboard"),
    getWidgetData: (payload) => request("/bi/widgets/data", { method: "POST", body: payload }),
    getInsights: (payload) => request("/bi/insights", { method: "POST", body: payload }),
  },

  // Reports, Analytics & Decision Intelligence Platform (RADIP)
  radip: {
    getReports: () => request("/radip/reports"),
    executeReport: (id, payload) => request(`/radip/execute/${id}`, { method: "POST", body: payload }),
    previewBuilder: (payload) => request("/radip/build/preview", { method: "POST", body: payload }),
    saveCustomReport: (payload) => request("/radip/reports", { method: "POST", body: payload }),
    exportReport: (id, payload) => request(`/radip/export/${id}`, { method: "POST", body: payload }),
    scheduleReport: (payload) => request("/radip/schedules", { method: "POST", body: payload }),
  },

  // Performance Intelligence & KPI Framework (PIKF)
  pikf: {
    getMyScore: () => request("/pikf/my-score"),
    getLeaderboards: (brandId) => request(`/pikf/leaderboards${brandId ? `?brandId=${brandId}` : ''}`),
    getDefinitions: () => request("/pikf/definitions"),
    getTeamPerformance: () => request("/pikf/team-performance"),
    setTarget: (payload) => request("/pikf/targets", { method: "POST", body: payload }),
    awardManualBadge: (payload) => request("/pikf/badges/manual", { method: "POST", body: payload }),
  },

  // Business Automation & Workflow Orchestration Engine (BAWOE)
  bawoe: {
    getWorkflows: () => request("/bawoe/workflows"),
    getWorkflow: (id) => request(`/bawoe/workflows/${id}`),
    saveWorkflow: (payload) => request("/bawoe/workflows", { method: "POST", body: payload }),
    getExecutions: () => request("/bawoe/executions"),
    getLogs: (executionId) => request(`/bawoe/executions/${executionId}/logs`),
    testTrigger: (payload) => request("/bawoe/test", { method: "POST", body: payload })
  },

  // Unified Notification & Communication Center (UNCC)
  uncc: {
    getNotifications: () => request("/uncc"),
    markAsRead: (id) => request(`/uncc/${id}/read`, { method: "PUT" }),
    executeQuickAction: (id, payload) => request(`/uncc/${id}/action`, { method: "POST", body: payload })
  }
};

export { getToken };
export default api;

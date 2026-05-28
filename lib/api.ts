import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  adminLogin: (email: string, password: string) =>
    api.post("/auth/admin/login", { email, password }),
  sendOtp: (mobile: string) => api.post("/auth/send-otp", { mobile }),
  verifyOtp: (mobile: string, otp: string) =>
    api.post("/auth/verify-otp", { mobile, otp }),
};

// ── Dashboard Stats ───────────────────────────────────────────────────────────
export const dashboardApi = {
  getStats: () => api.get("/dashboard/stats"),
};

// ── Gram Panchayat ────────────────────────────────────────────────────────────
export const gramPanchayatApi = {
  getAll: (params?: { district?: string; state?: string }) =>
    api.get("/gram-panchayat", { params }),
  getOne: (id: string) => api.get(`/gram-panchayat/${id}`),
  search: (q: string) => api.get("/gram-panchayat/search", { params: { q } }),
  create: (data: any) => api.post("/gram-panchayat", data),
  update: (id: string, data: any) => api.patch(`/gram-panchayat/${id}`, data),
};

// ── Farmers ───────────────────────────────────────────────────────────────────
export const farmersApi = {
  getAll: (params?: { page?: number; limit?: number; category?: string; state?: string }) =>
    api.get("/farmers", { params }),
  getOne: (id: string) => api.get(`/farmers/${id}`),
  search: (q: string) => api.get("/farmers/search", { params: { q } }),
  create: (data: any) => api.post("/farmers", data),
  update: (id: string, data: any) => api.patch(`/farmers/${id}`, data),
  delete: (id: string) => api.delete(`/farmers/${id}`),
};

// ── Instances (Farm Plots) ────────────────────────────────────────────────────
export const instancesApi = {
  getAll: (params?: { farmerId?: string; page?: number; limit?: number }) =>
    api.get("/instances", { params }),
  getOne: (id: string) => api.get(`/instances/${id}`),
  getAllGeoJson: () => api.get("/instances/map/all"),
  create: (data: any) => api.post("/instances", data),
  update: (id: string, data: any) => api.patch(`/instances/${id}`, data),
};

// ── Planting Units (Trees) ────────────────────────────────────────────────────
export const treesApi = {
  getByInstance: (instanceId: string) =>
    api.get(`/planting-units/instance/${instanceId}`),
  getOne: (id: string) => api.get(`/planting-units/${id}`),
  create: (data: any) => api.post("/planting-units", data),
  bulkCreate: (instanceId: string, units: any[]) =>
    api.post("/planting-units/bulk", { instanceId, units }),
  update: (id: string, data: any) => api.patch(`/planting-units/${id}`, data),
  markLost: (id: string, lossDate: string) =>
    api.patch(`/planting-units/${id}/loss`, { lossDate }),
};

// ── Species ───────────────────────────────────────────────────────────────────
export const speciesApi = {
  getAll: () => api.get("/species"),
  getOne: (id: string) => api.get(`/species/${id}`),
  create: (data: any) => api.post("/species", data),
  update: (id: string, data: any) => api.patch(`/species/${id}`, data),
};

// ── Masters / Dropdowns ───────────────────────────────────────────────────────
export const mastersApi = {
  getDropdowns: () => api.get("/masters/dropdowns"),
  getTribes: (state?: string, pvtgOnly?: boolean) =>
    api.get("/masters/tribes", { params: { state, pvtgOnly } }),
  searchTribes: (q: string) => api.get("/masters/tribes/search", { params: { q } }),
  getIpccConstants: () => api.get("/masters/ipcc-constants"),
};

// ── Monitoring Periods ────────────────────────────────────────────────────────
export const monitoringApi = {
  getAll: (params?: { instanceId?: string; status?: string }) =>
    api.get("/monitoring", { params }),
  getOne: (id: string) => api.get(`/monitoring/${id}`),
  getPending: () => api.get("/monitoring/pending-verification"),
  create: (data: any) => api.post("/monitoring", data),
  updateStatus: (id: string, status: string, comments?: string) =>
    api.patch(`/monitoring/${id}/status`, { status, adminComments: comments }),
};

// ── Carbon Calculations ───────────────────────────────────────────────────────
export const calculationsApi = {
  run: (instanceId: string, periodId: string) =>
    api.post(`/calculations/run/${instanceId}/${periodId}`),
  getByInstance: (instanceId: string) =>
    api.get(`/calculations/instance/${instanceId}`),
  getSummary: () => api.get("/calculations/summary"),
};

// ── Legacy APIs ───────────────────────────────────────────────────────────────
export const projectsApi = {
  getAll: () => api.get("/projects"),
  getOne: (id: string) => api.get(`/projects/${id}`),
  create: (data: any) => api.post("/projects", data),
  update: (id: string, data: any) => api.patch(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
};
export const partnersApi = { getAll: () => api.get("/partners") };
export const reportsApi = { getAll: () => api.get("/reports") };
export const teamsApi = {
  getAll: () => api.get("/teams"),
  addMember: (data: any) => api.post("/teams", data),
  update: (id: string, data: any) => api.patch(`/teams/${id}`, data),
  remove: (id: string) => api.delete(`/teams/${id}`),
};
export const usersApi = {
  getAll: () => api.get("/users"),
  update: (id: string, data: any) => api.patch(`/users/${id}`, data),
};

import axios from "axios";
import { withBasePath } from "@/lib/utils";

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
      window.location.href = withBasePath("/login");
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  adminLogin: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
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
  getSummary: (id: string) => api.get(`/gram-panchayat/${id}/summary`),
  downloadReport: (id: string) =>
    api.get(`/gram-panchayat/${id}/report.xlsx`, { responseType: "blob" }),
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
  getSummary: (id: string) => api.get(`/instances/${id}/summary`),
  downloadReport: (id: string) =>
    api.get(`/instances/${id}/report.xlsx`, { responseType: "blob" }),
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
  markLost: (id: string, lossDate: string, status?: "DEAD" | "LOST", reason?: string) =>
    api.patch(`/planting-units/${id}/loss`, { lossDate, status, reason }),
  restoreAlive: (id: string) => api.patch(`/planting-units/${id}/restore`),
  replace: (id: string, data: any) => api.post(`/planting-units/${id}/replace`, data),
  getHistory: (id: string) => api.get(`/planting-units/${id}/history`),
  export: (params?: { species?: string; instanceId?: string }) =>
    api.get("/planting-units/export", { params, responseType: "blob" }),
  getMapPoints: () => api.get("/planting-units/map/all"),
};

// ── Tree Measurements (Monitoring Visits) ───────────────────────────────────
export const treeMeasurementsApi = {
  getRecent: () => api.get("/tree-measurements"),
  getByTree: (plantingUnitId: string) => api.get(`/tree-measurements/tree/${plantingUnitId}`),
  create: (data: any) => api.post("/tree-measurements", data),
};

// ── Kyari Beds ────────────────────────────────────────────────────────────────
export const kyariBedsApi = {
  getByInstance: (instanceId: string) => api.get(`/kyari-beds/instance/${instanceId}`),
  create: (data: any) => api.post("/kyari-beds", data),
  bulkCreate: (instanceId: string, beds: any[]) =>
    api.post("/kyari-beds/bulk", { instanceId, beds }),
  update: (id: string, data: any) => api.patch(`/kyari-beds/${id}`, data),
  delete: (id: string) => api.delete(`/kyari-beds/${id}`),
};

// ── Crop Areas ────────────────────────────────────────────────────────────────
export const cropAreasApi = {
  getByInstance: (instanceId: string) => api.get(`/crop-areas/instance/${instanceId}`),
  create: (data: any) => api.post("/crop-areas", data),
  bulkCreate: (instanceId: string, areas: any[]) =>
    api.post("/crop-areas/bulk", { instanceId, areas }),
  update: (id: string, data: any) => api.patch(`/crop-areas/${id}`, data),
  delete: (id: string) => api.delete(`/crop-areas/${id}`),
};

// ── Tree Photos (Tree Gallery) ───────────────────────────────────────────────
export const treePhotosApi = {
  getAll: (params?: {
    instanceId?: string;
    speciesId?: string;
    plantingUnitId?: string;
    page?: number;
    limit?: number;
  }) => api.get("/tree-photos", { params }),
  getByTree: (plantingUnitId: string) => api.get(`/tree-photos/tree/${plantingUnitId}`),
  upload: (formData: FormData) =>
    api.post("/tree-photos", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id: string, data: any) => api.patch(`/tree-photos/${id}`, data),
  delete: (id: string) => api.delete(`/tree-photos/${id}`),
};

// ── Farmer Photos ─────────────────────────────────────────────────────────────
export const farmerPhotosApi = {
  getByFarmer: (farmerId: string) => api.get(`/farmer-photos/farmer/${farmerId}`),
  upload: (formData: FormData) =>
    api.post("/farmer-photos", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// ── Locations (State / District / Village) ───────────────────────────────────
export const locationsApi = {
  getStates: () => api.get("/locations/states"),
  getDistricts: (state?: string) => api.get("/locations/districts", { params: { state } }),
  getVillages: (district?: string) => api.get("/locations/villages", { params: { district } }),
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

// ── Monitoring Checklist ──────────────────────────────────────────────────────
export const monitoringChecklistApi = {
  getForPeriod: (periodId: string) => api.get(`/monitoring-checklist/period/${periodId}`),
  updateItem: (id: string, data: { completed?: boolean; remarks?: string }) =>
    api.patch(`/monitoring-checklist/${id}`, data),
  bulkUpdate: (periodId: string, items: { id: string; completed: boolean; remarks?: string }[]) =>
    api.patch(`/monitoring-checklist/period/${periodId}/bulk`, { items }),
};

// ── Carbon Calculations ───────────────────────────────────────────────────────
export const calculationsApi = {
  preview: (instanceId: string) => api.get(`/calculations/preview/${instanceId}`),
  run: (instanceId: string, periodId: string) =>
    api.post(`/calculations/run/${instanceId}/${periodId}`),
  getByInstance: (instanceId: string) =>
    api.get(`/calculations/instance/${instanceId}`),
  getSummary: () => api.get("/calculations/summary"),
  getDetails: (id: string) => api.get(`/calculations/${id}/details`),
};

// ── Projects (top of the hierarchy: Project → GP → Farmer → Plot → Tree) ──────
export const projectsApi = {
  getAll: () => api.get("/projects"),
  getOne: (id: string) => api.get(`/projects/${id}`),
  getSummary: (id: string) => api.get(`/projects/${id}/summary`),
  downloadReport: (id: string) =>
    api.get(`/projects/${id}/report.xlsx`, { responseType: "blob" }),
  create: (data: any) => api.post("/projects", data),
  update: (id: string, data: any) => api.patch(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
};

// ── Legacy APIs ───────────────────────────────────────────────────────────────
export const partnersApi = { getAll: () => api.get("/partners") };
export const reportsApi = {
  getAll: (params?: { search?: string; status?: string; projectId?: string }) =>
    api.get("/reports", { params }),
  getOne: (id: string) => api.get(`/reports/${id}`),
  create: (data: any) => api.post("/reports", data),
  update: (id: string, data: any) => api.patch(`/reports/${id}`, data),
  delete: (id: string) => api.delete(`/reports/${id}`),
  uploadFile: (id: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post(`/reports/${id}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
export const teamsApi = {
  getAll: () => api.get("/teams"),
  addMember: (data: any) => api.post("/teams", data),
  update: (id: string, data: any) => api.patch(`/teams/${id}`, data),
  remove: (id: string) => api.delete(`/teams/${id}`),
};
// ── Public (unauthenticated) ────────────────────────────────────────────────
export const publicApi = {
  getSummary: () => api.get("/public/summary"),
};

export const usersApi = {
  getAll: () => api.get("/users"),
  getMe: () => api.get("/users/me"),
  create: (data: any) => api.post("/users", data),
  updateMe: (data: any) => api.patch("/users/me", data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.patch("/users/me/password", data),
  update: (id: string, data: any) => api.patch(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

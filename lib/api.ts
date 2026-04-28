import axios from "axios";

// Backend URL — EC2 server
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://43.204.144.76";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // send cookies for refresh token
});

// ─── Request interceptor — attach access token ───────────────────────────────
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ─── Response interceptor — auto-refresh on 401 ──────────────────────────────
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = data.accessToken;
        localStorage.setItem("accessToken", newToken);
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─── Auth APIs ───────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/me"),
};

// ─── Dashboard APIs ───────────────────────────────────────────────────────────
export const dashboardApi = {
  getStats: () => api.get("/dashboard/stats"),
};

// ─── Farmers APIs ────────────────────────────────────────────────────────────
export const farmersApi = {
  getAll: (params?: { search?: string; status?: string; location?: string }) =>
    api.get("/farmers", { params }),
  getOne: (id: string) => api.get(`/farmers/${id}`),
  create: (data: any) => api.post("/farmers", data),
  update: (id: string, data: any) => api.patch(`/farmers/${id}`, data),
  delete: (id: string) => api.delete(`/farmers/${id}`),
};

// ─── Projects APIs ────────────────────────────────────────────────────────────
export const projectsApi = {
  getAll: (params?: { search?: string; status?: string; type?: string }) =>
    api.get("/projects", { params }),
  getOne: (id: string) => api.get(`/projects/${id}`),
  create: (data: any) => api.post("/projects", data),
  update: (id: string, data: any) => api.patch(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
  assignFarmers: (id: string, farmerIds: string[]) =>
    api.post(`/projects/${id}/farmers`, { farmerIds }),
};

// ─── Partners APIs ────────────────────────────────────────────────────────────
export const partnersApi = {
  getAll: (params?: { search?: string; status?: string }) =>
    api.get("/partners", { params }),
  getOne: (id: string) => api.get(`/partners/${id}`),
  create: (data: any) => api.post("/partners", data),
  update: (id: string, data: any) => api.patch(`/partners/${id}`, data),
  delete: (id: string) => api.delete(`/partners/${id}`),
};

// ─── Reports APIs ─────────────────────────────────────────────────────────────
export const reportsApi = {
  getAll: (params?: { search?: string; status?: string; projectId?: string }) =>
    api.get("/reports", { params }),
  getOne: (id: string) => api.get(`/reports/${id}`),
  create: (data: any) => api.post("/reports", data),
  update: (id: string, data: any) => api.patch(`/reports/${id}`, data),
  delete: (id: string) => api.delete(`/reports/${id}`),
  uploadFile: (id: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post(`/reports/${id}/upload`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

// ─── Teams APIs ───────────────────────────────────────────────────────────────
export const teamsApi = {
  getAll: () => api.get("/teams"),
  addMember: (data: any) => api.post("/teams", data),
  update: (id: string, data: any) => api.patch(`/teams/${id}`, data),
  remove: (id: string) => api.delete(`/teams/${id}`),
};

// ─── Users APIs ───────────────────────────────────────────────────────────────
export const usersApi = {
  getAll: () => api.get("/users"),
  getOne: (id: string) => api.get(`/users/${id}`),
  create: (data: any) => api.post("/users", data),
  update: (id: string, data: any) => api.patch(`/users/${id}`, data),
  updateMe: (data: any) => api.patch("/users/me", data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

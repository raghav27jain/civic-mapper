import axios from "axios";

const BASE_URL = "http://localhost:5000";

const api = axios.create({
  baseURL: BASE_URL,
});

// Interceptor to inject JWT token automatically from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Submit a new complaint
export const submitComplaint = async (formData) => {
  const response = await api.post("/api/complaints", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Fetch all complaints
export const fetchComplaints = async () => {
  const response = await api.get("/api/complaints");
  return response.data;
};

// Send OTP to citizen phone number
export const sendOTP = async (name, phone) => {
  const response = await api.post("/api/auth/send-otp", { name, phone });
  return response.data;
};

// Verify OTP for citizen login
export const verifyOTP = async (phone, otp) => {
  const response = await api.post("/api/auth/verify-otp", { phone, otp });
  return response.data;
};

// Log in as administrator
export const adminLogin = async (password) => {
  const response = await api.post("/api/auth/admin-login", { password });
  return response.data;
};

// Update status of a complaint (Admin only)
export const updateComplaintStatus = async (id, status) => {
  const response = await api.put(`/api/complaints/${id}/status`, { status });
  return response.data;
};
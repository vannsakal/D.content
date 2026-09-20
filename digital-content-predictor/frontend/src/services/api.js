import axios from 'axios';

const RAW_BASE = import.meta.env.VITE_API_URL || 'https://meateka-backend-rvhb.onrender.com';
const baseURL = RAW_BASE.endsWith('/api') ? RAW_BASE : `${RAW_BASE}/api`;

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sl_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sl_token');
      localStorage.removeItem('sl_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

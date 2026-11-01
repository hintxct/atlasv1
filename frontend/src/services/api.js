import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const isPublicAuth = (url = '') => /\/auth\/(login|register)$/.test(url);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token?.startsWith('demo-') && !isPublicAuth(config.url)) {
      return Promise.reject(new Error('Demo workspace: real API changes are disabled.'));
    }
    if (token && !token.startsWith('demo-') && !isPublicAuth(config.url)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isPublicAuth(error.config?.url) && !localStorage.getItem('token')?.startsWith('demo-')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  logout: () => api.post('/auth/logout'),
};

// Delivery API
export const deliveryAPI = {
  getAll: (params) => api.get('/deliveries', { params }),
  getById: (id) => api.get(`/deliveries/${id}`),
  create: (data) => api.post('/deliveries', data),
  accept: (id) => api.put(`/deliveries/${id}/accept`),
  start: (id) => api.put(`/deliveries/${id}/start`),
  updateLocation: (id, location) => api.put(`/deliveries/${id}/location`, location),
  markDelivered: (id, data) => api.put(`/deliveries/${id}/deliver`, data),
};

// Blockage API
export const blockageAPI = {
  getAll: (params) => api.get('/blockages', { params }),
  report: (data) => api.post('/blockages', data),
  verify: (id) => api.put(`/blockages/${id}/verify`),
  clear: (id) => api.put(`/blockages/${id}/clear`),
  updateStatus: (id, data) => api.put(`/blockages/${id}/status`, data),
  uploadPhotos: (id, formData) => api.post(`/blockages/${id}/photos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// User API
export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  approve: (id) => api.put(`/users/${id}/approve`),
  reject: (id) => api.put(`/users/${id}/reject`),
  suspend: (id) => api.put(`/users/${id}/suspend`),
  getAvailableDrivers: (params) => api.get('/users/drivers/available', { params }),
};

export default api;

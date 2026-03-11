import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

// Furniture API
export const furnitureAPI = {
  getAll: (params) => api.get('/furniture', { params }),
  getById: (id) => api.get(`/furniture/${id}`),
  create: (data) => api.post('/furniture', data),
  update: (id, data) => api.put(`/furniture/${id}`, data),
  delete: (id) => api.delete(`/furniture/${id}`)
};

// Category API
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`)
};

// Booking API
export const bookingAPI = {
  create: (data) => api.post('/bookings', data),
  getAll: () => api.get('/bookings'),
  getUserBookings: () => api.get('/bookings/my-bookings'),
  getById: (id) => api.get(`/bookings/${id}`),
  updateStatus: (id, data) => api.put(`/bookings/${id}/status`, data),
  cancel: (id) => api.put(`/bookings/${id}/cancel`)
};

// User API
export const userAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`)
};

// Wood API
export const woodAPI = {
  getAll: () => api.get('/woods'),
  getById: (id) => api.get(`/woods/${id}`),
  create: (data) => api.post('/woods', data),
  update: (id, data) => api.put(`/woods/${id}`, data),
  delete: (id) => api.delete(`/woods/${id}`)
};

// Door API
export const doorAPI = {
  getAll: (params) => api.get('/doors', { params }),
  getById: (id) => api.get(`/doors/${id}`),
  create: (data) => api.post('/doors', data),
  update: (id, data) => api.put(`/doors/${id}`, data),
  delete: (id) => api.delete(`/doors/${id}`)
};

// Window API
export const windowAPI = {
  getAll: (params) => api.get('/windows', { params }),
  getById: (id) => api.get(`/windows/${id}`),
  create: (data) => api.post('/windows', data),
  update: (id, data) => api.put(`/windows/${id}`, data),
  delete: (id) => api.delete(`/windows/${id}`)
};

// Locker API
export const lockerAPI = {
  getAll: (params) => api.get('/lockers', { params }),
  getById: (id) => api.get(`/lockers/${id}`),
  create: (data) => api.post('/lockers', data),
  update: (id, data) => api.put(`/lockers/${id}`, data),
  delete: (id) => api.delete(`/lockers/${id}`)
};

// Upload API
export const uploadAPI = {
  uploadImage: (category, file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post(`/upload/${category}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadMultiple: (category, files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    return api.post(`/upload/${category}/multiple`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getImages: (category) => api.get(`/upload/${category}`),
  deleteImage: (category, filename) => api.delete(`/upload/${category}/${filename}`)
};

// Order API
export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getAll: (params) => api.get('/orders', { params }),
  getMyOrders: () => api.get('/orders/my-orders'),
  getById: (id) => api.get(`/orders/${id}`),
  track: (orderNumber) => api.get(`/orders/track/${orderNumber}`),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  assignAgent: (id, data) => api.put(`/orders/${id}/assign-agent`, data),
  updatePaymentStatus: (id, data) => api.put(`/orders/${id}/payment-status`, data),
  cancel: (id, data) => api.put(`/orders/${id}/cancel`, data)
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getSalesReport: (params) => api.get('/analytics/sales', { params }),
  getInventoryReport: () => api.get('/analytics/inventory')
};

// Delivery API
export const deliveryAPI = {
  getMyOrders: () => api.get('/delivery/my-orders'),
  getHistory: (params) => api.get('/delivery/history', { params }),
  getStats: () => api.get('/delivery/stats'),
  toggleAvailability: () => api.put('/delivery/toggle-availability'),
  pickupOrder: (id) => api.put(`/delivery/orders/${id}/pickup`),
  updateStatus: (id, data) => api.put(`/delivery/orders/${id}/status`, data),
  confirmDelivery: (id, data) => api.put(`/delivery/orders/${id}/deliver`, data),
  getAvailableAgents: () => api.get('/delivery/agents')
};

// Shopkeeper API
export const shopkeeperAPI = {
  getDashboard: () => api.get('/shopkeeper/dashboard'),
  getOrders: () => api.get('/shopkeeper/orders'),
  getInventory: () => api.get('/shopkeeper/inventory'),
  getLowStock: (threshold) => api.get('/shopkeeper/low-stock', { params: { threshold } }),
  confirmOrder: (id) => api.put(`/shopkeeper/orders/${id}/confirm`),
  startProcessing: (id) => api.put(`/shopkeeper/orders/${id}/process`),
  markReady: (id) => api.put(`/shopkeeper/orders/${id}/ready`),
  updateStock: (data) => api.put('/shopkeeper/stock', data)
};

// CNC Design API
export const cncAPI = {
  // Design endpoints
  getAllDesigns: (params) => api.get('/cnc/designs', { params }),
  getDesignById: (id) => api.get(`/cnc/designs/${id}`),
  getFeaturedDesigns: () => api.get('/cnc/designs/featured'),
  getFilterOptions: () => api.get('/cnc/designs/filters'),
  calculatePrice: (data) => api.post('/cnc/designs/calculate-price', data),
  createDesign: (data) => api.post('/cnc/designs', data),
  updateDesign: (id, data) => api.put(`/cnc/designs/${id}`, data),
  deleteDesign: (id) => api.delete(`/cnc/designs/${id}`),
  toggleStatus: (id) => api.put(`/cnc/designs/${id}/toggle-status`),
  toggleFeatured: (id) => api.put(`/cnc/designs/${id}/toggle-featured`),

  // Manufacturing order endpoints
  createOrder: (data) => api.post('/cnc/orders', data),
  getMyOrders: () => api.get('/cnc/orders/my-orders'),
  getOrderById: (id) => api.get(`/cnc/orders/${id}`),
  trackOrder: (orderNumber) => api.get(`/cnc/orders/track/${orderNumber}`),
  getAllOrders: (params) => api.get('/cnc/orders', { params }),
  updateOrderStatus: (id, data) => api.put(`/cnc/orders/${id}/status`, data),
  assignOperator: (id, data) => api.put(`/cnc/orders/${id}/assign-operator`, data),
  cancelOrder: (id, data) => api.put(`/cnc/orders/${id}/cancel`, data),
  addFeedback: (id, data) => api.put(`/cnc/orders/${id}/feedback`, data),
  getStats: () => api.get('/cnc/stats')
};

export default api;

import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          return api.post('/auth/refresh', { refreshToken })
            .then(response => {
              if (response.data.success) {
                const { token } = response.data.data;
                localStorage.setItem('token', token);
                api.defaults.headers.Authorization = `Bearer ${token}`;
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return api(originalRequest);
              }
            });
        }
      } catch (refreshError) {
        // Refresh token failed, logout user
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/';
      }
    }

    // Handle network errors
    if (!error.response) {
      return Promise.reject({
        success: false,
        message: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR'
      });
    }

    // Handle server errors
    return Promise.reject({
      success: false,
      message: error.response.data?.message || 'An error occurred',
      code: error.response?.status || 'UNKNOWN_ERROR',
      data: error.response.data?.data || null
    });
  }
);

// API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),

  // Address management
  getAddresses: () => api.get('/auth/profile'),
  addAddress: (addressData) => api.post('/auth/addresses', addressData),
  updateAddress: (addressId, addressData) => api.put(`/auth/addresses/${addressId}`, addressData),
  deleteAddress: (addressId) => api.delete(`/auth/addresses/${addressId}`),
};

export const productsAPI = {
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  searchProducts: (params) => api.get('/products/search', { params }),
  getFeaturedProducts: (params) => api.get('/products/featured', { params }),
  getCategories: () => api.get('/products/categories'),
  getBrands: () => api.get('/products/brands'),
  getProductReviews: (id, params) => api.get(`/products/${id}/reviews`, { params }),
  addProductReview: (id, reviewData) => api.post(`/products/${id}/reviews`, reviewData),

  // Admin only
  createProduct: (productData) => api.post('/products', productData),
  updateProduct: (id, productData) => api.put(`/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/products/${id}`),
};

export const buildsAPI = {
  getBuilds: (params) => api.get('/builds', { params }),
  getBuild: (id) => api.get(`/builds/${id}`),
  getPublicBuilds: (params) => api.get('/builds/public', { params }),
  createBuild: (buildData) => api.post('/builds', buildData),
  updateBuild: (id, buildData) => api.put(`/builds/${id}`, buildData),
  deleteBuild: (id) => api.delete(`/builds/${id}`),
  validateBuild: (id) => api.post(`/builds/${id}/validate`),
  likeBuild: (id) => api.post(`/builds/${id}/like`),
  forkBuild: (id, data) => api.post(`/builds/${id}/fork`, data),
};

export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (itemData) => api.post('/cart/add', itemData),
  updateCartItem: (itemId, itemData) => api.put(`/cart/update`, { itemId, ...itemData }),
  removeFromCart: (itemId) => api.delete(`/cart/${itemId}`),
  clearCart: () => api.post('/cart/clear'),
};

export const ordersAPI = {
  getOrders: (params) => api.get('/orders', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  createOrder: (orderData) => api.post('/orders', orderData),
  cancelOrder: (id) => api.post(`/orders/${id}/cancel`),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),
  getOrders: (params) => api.get('/admin/orders', { params }),
  updateOrderStatus: (id, statusData) => api.put(`/admin/orders/${id}/status`, statusData),
  bulkProductOperation: (operationData) => api.post('/admin/products/bulk', operationData),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
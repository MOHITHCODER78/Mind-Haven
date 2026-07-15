import axios from 'axios';

const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const api = axios.create({
  baseURL: base.endsWith('/api') ? base : `${base}/api`,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mindhaven_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newToken = response.data.token;
        localStorage.setItem('mindhaven_token', newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      // eslint-disable-next-line no-unused-vars
      } catch (_refreshError) {
        localStorage.removeItem('mindhaven_token');
        window.location.assign('/login');
      }
    }

    return Promise.reject(error);
  }
);

export default api;

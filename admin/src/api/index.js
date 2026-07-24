import axios from 'axios';
import { ElMessage } from 'element-plus';
const api = axios.create({
    baseURL: '/api',
    timeout: 10000,
});
// Request interceptor: attach JWT token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
// Response interceptor: handle 401
api.interceptors.response.use((response) => response, (error) => {
    if (error.response?.status === 401) {
        localStorage.removeItem('admin_token');
        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
    }
    const message = error.response?.data?.error || 'Request failed';
    ElMessage.error(message);
    return Promise.reject(error);
});
export default api;

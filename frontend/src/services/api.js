import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10s timeout
});

// Queue to hold requests while refreshing token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle Network Errors
        if (!error.response) {
            toast.error('Network Error: Please check your internet connection.');
            return Promise.reject(error);
        }

        // Handle 401 (Unauthorized) & Token Refresh
        if (error.response.status === 401 && !originalRequest._retry) {

            // Prevent infinite loops if refresh token itself fails
            if (originalRequest.url.includes('/refresh-token')) {
                localStorage.clear();
                window.location.href = '/login';
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers['Authorization'] = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Call refresh token endpoint (assumes cookie contains refresh token)
                // Note: using axios instance directly to avoid interceptors loop if needed, but here route is different.
                const { data } = await api.get('/users/refresh-token');

                const newToken = data.token;
                localStorage.setItem('token', newToken);

                api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

                processQueue(null, newToken);
                return api(originalRequest);
            } catch (err) {
                processQueue(err, null);
                localStorage.clear();
                window.location.href = '/login';
                toast.error('Session expired. Please login again.');
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        // Handle 403 (Forbidden)
        if (error.response.status === 403) {
            toast.error('You do not have permission to perform this action.');
        }

        // Handle 404 (Not Found)
        if (error.response.status === 404) {
            // Optional: Don't toast on 404 if the UI handles it gracefully (like empty states)
            // But for actions like "Delete item", a 404 is an error.
            if (originalRequest.method !== 'GET') {
                toast.error('Resource not found.');
            }
        }

        // Handle 500 (Server Error)
        if (error.response.status >= 500) {
            toast.error('Server error. Please try again later.');
        }

        // Pass through specific error messages from backend
        const message = error.response?.data?.message || 'Something went wrong';
        // You might want to toast specific errors here or let component handle it.
        // For global handling:
        if (error.response.status !== 401 && error.response.status !== 404) {
            // Avoid double toast if we handled status above, but often backend sends detailed message.
            // We can chose to not toast here and let useQuery/useMutation onError handle it, 
            // but for a simple app, global toast is convenient.
            // toast.error(message); 
        }

        return Promise.reject(error);
    }
);

export default api;

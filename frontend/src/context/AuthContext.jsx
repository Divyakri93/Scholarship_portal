import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const res = await api.get('/users/me');
                console.log("Auth Check Success, User:", res.data.data.user);
                setUser(res.data.data.user);
            } catch (err) {
                console.error("Auth check failed", err);
                localStorage.removeItem('token');
                setUser(null);
            }
        } else {
            console.log("No token found");
        }
        setLoading(false);
    };

    const login = async (email, password) => {
        try {
            const res = await api.post('/users/login', { email, password });
            const { token, data } = res.data;

            localStorage.setItem('token', token);
            setUser(data.user);
            toast.success('Logged in successfully!');
            return true;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
            return false;
        }
    };

    const register = async (userData) => {
        try {
            const res = await api.post('/users/register', userData);
            const { token, data } = res.data;

            localStorage.setItem('token', token);
            setUser(data.user);
            toast.success('Registration successful!');
            return true;
        } catch (err) {
            // Error handled in component for field-specific errors, or generic here
            console.error(err);
            throw err;
        }
    };

    const logout = async () => {
        try {
            await api.post('/users/logout'); // Clears cookie
        } catch (err) {
            console.log('Logout API error', err);
        }
        localStorage.removeItem('token');
        setUser(null);
        toast.info('Logged out');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuthStatus }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

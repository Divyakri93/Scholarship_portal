import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
// import notificationSound from '../assets/notification.mp3'; // Removed

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const audioRef = useRef(null);

    // Initialize audio
    useEffect(() => {
        // Simple distinct beep sound (Data URI) to avoid asset 404s
        const beep = "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU";
        audioRef.current = new Audio(beep); // Placeholder or real URL
    }, []);

    // Initial Fetch
    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data.data.notifications);
            setUnreadCount(res.data.data.notifications.filter(n => !n.isRead).length);
        } catch (err) {
            console.error("Fetch notifs failed", err);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();

            // Connect Socket
            const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
                withCredentials: true
            });

            newSocket.on('connect', () => {
                // Join user-specific room
                newSocket.emit('join', user._id);
                console.log('Socket connected');
            });

            newSocket.on('notification', (newNotification) => {
                // Add to list
                setNotifications(prev => [newNotification, ...prev]);
                setUnreadCount(prev => prev + 1);

                // Toast
                toast.info(`New Notification: ${newNotification.title}`);

                // Sound
                if (audioRef.current) {
                    audioRef.current.play().catch(e => console.log('Audio play blocked', e));
                }

                // Browser Notification
                if (Notification.permission === 'granted') {
                    new Notification(newNotification.title, { body: newNotification.message });
                }
            });

            setSocket(newSocket);

            return () => newSocket.close();
        } else {
            if (socket) socket.close();
        }
    }, [user]);

    // Request Browser Permission
    useEffect(() => {
        if ('Notification' in window && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
    }, []);

    const markAsRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error(err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.patch('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <SocketContext.Provider value={{ socket, notifications, unreadCount, markAsRead, markAllAsRead }}>
            {children}
        </SocketContext.Provider>
    );
};

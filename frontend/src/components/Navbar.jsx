import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { LogOut, User, LayoutDashboard, Settings } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [profileOpen, setProfileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null; // Or render public navbar

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center gap-2 group">
                        <div className="bg-primary-600 text-white p-1.5 rounded-lg font-bold text-xl group-hover:bg-primary-700 transition">SP</div>
                        <span className="font-heading font-bold text-gray-900 text-lg hidden sm:block">ScholarPortal</span>
                    </Link>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-4">
                        <NotificationBell />

                        {/* User Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setProfileOpen(!profileOpen)}
                                className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded-lg transition"
                            >
                                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                                    {user?.name ? user.name.charAt(0) : 'U'}
                                </div>
                                <span className="text-sm font-medium text-gray-700 hidden md:block">{user?.name?.split(' ')[0] || 'User'}</span>
                            </button>

                            {profileOpen && (
                                <>
                                    <div className="fixed inset-0 z-30" onClick={() => setProfileOpen(false)}></div>
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-40">
                                        <div className="px-4 py-3 border-b border-gray-50">
                                            <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                        </div>

                                        {user.role === 'admin' ? (
                                            <Link to="/admin/dashboard" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                                <LayoutDashboard size={16} className="mr-2" /> Admin Dashboard
                                            </Link>
                                        ) : (
                                            <Link to="/dashboard" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                                <LayoutDashboard size={16} className="mr-2" /> Dashboard
                                            </Link>
                                        )}
                                        <Link to="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                            <User size={16} className="mr-2" /> Profile
                                        </Link>

                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                                        >
                                            <LogOut size={16} className="mr-2" /> Sign Out
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;

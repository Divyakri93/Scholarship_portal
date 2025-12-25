import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { LogOut, User, LayoutDashboard, Settings, BookOpen, FileText, Menu, X, ChevronDown, Shield, Home } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [profileOpen, setProfileOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const NavLink = ({ to, icon: Icon, children }) => {
        const isActive = location.pathname === to;
        return (
            <Link
                to={to}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                        ? 'bg-primary-50 text-primary-700 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
            >
                {Icon && <Icon size={18} className={isActive ? 'text-primary-600' : 'text-gray-400'} />}
                {children}
            </Link>
        );
    };

    return (
        <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 border-b border-gray-200/50 shadow-sm supports-[backdrop-filter]:bg-white/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo Area */}
                    <div className="flex items-center gap-8">
                        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
                            <div className="relative">
                                <div className="bg-gradient-to-tr from-primary-600 to-indigo-600 text-white p-2 rounded-xl font-bold text-xl shadow-lg shadow-primary-500/30 group-hover:shadow-primary-500/40 transition-all duration-300 transform group-hover:scale-105">
                                    <BookOpen size={20} className="stroke-[3px]" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-heading font-bold text-gray-900 text-lg leading-tight tracking-tight group-hover:text-primary-600 transition-colors">
                                    ScholarPortal
                                </span>
                                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                                    {user ? (user.role === 'admin' ? 'Admin Console' : 'Student Hub') : 'Gateway to Success'}
                                </span>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-1">
                            {user ? (
                                user.role === 'admin' ? (
                                    <>
                                        <NavLink to="/admin/dashboard" icon={LayoutDashboard}>Dashboard</NavLink>
                                        <NavLink to="/admin/scholarships" icon={BookOpen}>Scholarships</NavLink>
                                        <NavLink to="/admin/applications" icon={FileText}>Reviews</NavLink>
                                    </>
                                ) : (
                                    <>
                                        <NavLink to="/dashboard" icon={LayoutDashboard}>Dashboard</NavLink>
                                        <NavLink to="/scholarships" icon={BookOpen}>Find Scholarships</NavLink>
                                        <NavLink to="/applications" icon={FileText}>My Applications</NavLink>
                                    </>
                                )
                            ) : (
                                <>
                                    <NavLink to="/" icon={Home}>Home</NavLink>
                                    <NavLink to="/scholarships" icon={BookOpen}>Browse Scholarships</NavLink>
                                </>
                            )}
                        </nav>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-3 sm:gap-5">
                        {user ? (
                            <>
                                <NotificationBell />
                                <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

                                {/* Profile Dropdown */}
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setProfileOpen(!profileOpen)}
                                        className="flex items-center gap-3 group p-1.5 rounded-full hover:bg-gray-100/50 transition-all border border-transparent hover:border-gray-200"
                                    >
                                        <div className="flex flex-col items-end hidden sm:flex">
                                            <span className="text-sm font-bold text-gray-800 leading-none">{user.name?.split(' ')[0]}</span>
                                            <span className="text-xs text-gray-500 font-medium capitalize">{user.role}</span>
                                        </div>
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-100 to-indigo-100 flex items-center justify-center text-primary-700 font-bold text-sm shadow-inner ring-2 ring-white">
                                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    <AnimatePresence>
                                        {profileOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                transition={{ duration: 0.15, ease: "easeOut" }}
                                                className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden"
                                            >
                                                <div className="px-5 py-4 bg-gray-50/50 border-b border-gray-100">
                                                    <p className="text-sm font-bold text-gray-900">{user.name}</p>
                                                    <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-100 text-primary-700 uppercase tracking-wide border border-primary-200">
                                                            {user.role}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="p-2 space-y-1">
                                                    <Link
                                                        to="/profile"
                                                        className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors group"
                                                        onClick={() => setProfileOpen(false)}
                                                    >
                                                        <div className="p-1.5 rounded-md bg-gray-100 text-gray-500 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors mr-3">
                                                            <User size={16} />
                                                        </div>
                                                        My Profile
                                                    </Link>

                                                    {user.role === 'admin' && (
                                                        <Link
                                                            to="/admin/settings"
                                                            className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors group"
                                                            onClick={() => setProfileOpen(false)}
                                                        >
                                                            <div className="p-1.5 rounded-md bg-gray-100 text-gray-500 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors mr-3">
                                                                <Settings size={16} />
                                                            </div>
                                                            Settings
                                                        </Link>
                                                    )}
                                                </div>

                                                <div className="border-t border-gray-100 mt-1 pt-1 p-2">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full text-left flex items-center px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors group"
                                                    >
                                                        <div className="p-1.5 rounded-md bg-red-100/50 text-red-500 group-hover:bg-red-100 group-hover:text-red-700 transition-colors mr-3">
                                                            <LogOut size={16} />
                                                        </div>
                                                        Sign Out
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login" className="px-4 py-2 text-sm font-bold text-gray-700 hover:text-primary-600 transition-colors">
                                    Log In
                                </Link>
                                <Link to="/register" className="px-4 py-2 text-sm font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-700 shadow-md shadow-primary-500/30 transition-all hover:-translate-y-0.5">
                                    Get Started
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Button - Visible always */}
                        <button
                            className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-gray-100 bg-white shadow-lg overflow-hidden"
                    >
                        <div className="px-4 pt-2 pb-6 space-y-2">
                            {user ? (
                                <>
                                    {user.role === 'admin' ? (
                                        <>
                                            <NavLink to="/admin/dashboard" icon={LayoutDashboard}>Dashboard</NavLink>
                                            <NavLink to="/admin/scholarships" icon={BookOpen}>Manage Scholarships</NavLink>
                                            <NavLink to="/admin/applications" icon={FileText}>Review Applications</NavLink>
                                        </>
                                    ) : (
                                        <>
                                            <NavLink to="/dashboard" icon={LayoutDashboard}>Dashboard</NavLink>
                                            <NavLink to="/scholarships" icon={BookOpen}>Find Scholarships</NavLink>
                                            <NavLink to="/applications" icon={FileText}>My Applications</NavLink>
                                        </>
                                    )}
                                    <div className="border-t border-gray-100 my-2 pt-2">
                                        <NavLink to="/profile" icon={User}>My Profile</NavLink>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut size={18} />
                                            Sign Out
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <NavLink to="/" icon={Home}>Home</NavLink>
                                    <NavLink to="/scholarships" icon={BookOpen}>Browse Scholarships</NavLink>
                                    <div className="border-t border-gray-100 my-2 pt-4 flex flex-col gap-3">
                                        <Link to="/login" className="w-full text-center px-4 py-2 text-sm font-bold text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50">
                                            Log In
                                        </Link>
                                        <Link to="/register" className="w-full text-center px-4 py-2 text-sm font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-700 shadow-md">
                                            Sign Up Now
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Navbar;

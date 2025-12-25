import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import {
    FileText, CheckCircle, XCircle, Clock, Search, ArrowRight
} from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { format } from 'date-fns';
import PageTransition from '../components/common/PageTransition';
import { CardSkeleton } from '../components/common/Loading';
import studentHero from '../assets/student_dashboard_hero.png';

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
    <div className="card p-6 border-l-4" style={{ borderLeftColor: color || '#3b82f6' }}>
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
            </div>
            <div className={`p-2 rounded-lg bg-gray-50 text-gray-700`}>
                <Icon size={20} />
            </div>
        </div>
        {subtext && <p className="text-xs text-gray-400 mt-2">{subtext}</p>}
    </div>
);

const StatusBadge = ({ status }) => {
    const styles = {
        received: 'bg-blue-100 text-blue-800',
        under_review: 'bg-yellow-100 text-yellow-800',
        approved: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
        draft: 'bg-gray-100 text-gray-800',
        interview: 'bg-purple-100 text-purple-800'
    };
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${styles[status] || styles.draft}`}>
            {status ? status.replace('_', ' ') : 'Unknown'}
        </span>
    );
};

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
    const [recentApps, setRecentApps] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    // Redirect Admin to Admin Dashboard
    if (user?.role === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
    }

    // Redirect Provider to Admin Dashboard
    if (user?.role === 'provider') {
        return <Navigate to="/admin/dashboard" replace />;
    }

    useEffect(() => {
        if (user?.role === 'student') {
            fetchStudentData();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchStudentData = async () => {
        try {
            const [appsRes, recRes] = await Promise.all([
                api.get('/applications/my-applications'),
                api.get('/scholarships/my/eligible')
            ]);

            const apps = appsRes.data.data.applications;
            setRecentApps(apps.slice(0, 5));
            setRecommendations(recRes.data.data.scholarships || []);

            // Calculate Stats
            const statsCount = { total: apps.length, pending: 0, approved: 0, rejected: 0 };
            apps.forEach(app => {
                if (app.status === 'approved') statsCount.approved++;
                else if (app.status === 'rejected') statsCount.rejected++;
                else statsCount.pending++;
            });
            setStats(statsCount);

        } catch (err) {
            console.error("Dashboard fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const chartData = [
        { name: 'Pending', value: stats.pending, color: '#f59e0b' },
        { name: 'Approved', value: stats.approved, color: '#10b981' },
        { name: 'Rejected', value: stats.rejected, color: '#ef4444' },
    ];

    if (loading) return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>)}
            </div>
            <CardSkeleton />
        </div>
    );

    return (
        <PageTransition>
            <div className="min-h-screen bg-gray-50 pb-12">
                {/* Hero Section */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="flex-1 space-y-4">
                                <h1 className="text-4xl font-heading font-extrabold text-gray-900 tracking-tight">
                                    Welcome back, <br />
                                    <span className="text-primary">{user?.name?.split(' ')[0] || 'Student'}!</span>
                                </h1>
                                <p className="text-lg text-gray-500 max-w-xl">
                                    Track your applications, discover new opportunities, and achieve your academic goals.
                                </p>
                                <div className="flex gap-4 pt-2">
                                    <Link to="/scholarships" className="btn btn-primary shadow-lg shadow-blue-500/30">
                                        Browse Scholarships
                                    </Link>
                                    <Link to="/profile" className="px-6 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium transition">
                                        View Profile
                                    </Link>
                                </div>
                            </div>
                            <div className="flex-1 flex justify-center md:justify-end">
                                <img
                                    src={studentHero}
                                    alt="Student Dashboard"
                                    className="w-full max-w-md drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                    {/* Stats Grid - Floating effect */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 -mt-16 relative z-10">
                        <StatCard title="Total Applications" value={stats.total} icon={FileText} color="#3b82f6" subtext="+2 this month" />
                        <StatCard title="Pending Review" value={stats.pending} icon={Clock} color="#f59e0b" subtext="Waiting for decision" />
                        <StatCard title="Approved" value={stats.approved} icon={CheckCircle} color="#10b981" subtext="Scholarships awarded" />
                        <StatCard title="Rejected" value={stats.rejected} icon={XCircle} color="#ef4444" subtext="Better luck next time" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Left Col: Chart & Recent Apps */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* Chart */}
                            <div className="card p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-lg font-bold mb-6 text-gray-800 flex items-center gap-2">
                                    <FileText className="text-primary" size={20} />
                                    Application Activity
                                </h3>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 10 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="name" type="category" width={70} tick={{ fontSize: 12, fill: '#6b7280' }} />
                                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                                            <Bar dataKey="value" barSize={24} radius={[0, 4, 4, 0]}>
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Recent Table */}
                            <div className="card overflow-hidden border border-gray-100 shadow-sm">
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                    <h3 className="text-lg font-bold text-gray-800">Recent Applications</h3>
                                    <Link to="/applications" className="text-primary-600 text-sm hover:underline font-medium flex items-center gap-1">
                                        View All <ArrowRight size={14} />
                                    </Link>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                                            <tr>
                                                <th className="px-6 py-4">Scholarship</th>
                                                <th className="px-6 py-4">Applied On</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {recentApps.length === 0 ? (
                                                <tr><td colSpan="4" className="text-center py-12 text-gray-500">
                                                    <p>No applications yet.</p>
                                                    <Link to="/scholarships" className="text-primary hover:underline text-sm">Start applying now</Link>
                                                </td></tr>
                                            ) : (
                                                recentApps.map(app => (
                                                    <tr key={app._id} className="hover:bg-gray-50/80 transition-colors group">
                                                        <td className="px-6 py-4 font-medium text-gray-900">{app.scholarship?.title || 'Unknown Scholarship'}</td>
                                                        <td className="px-6 py-4 text-gray-500 text-sm">{format(new Date(app.createdAt), 'MMM dd, yyyy')}</td>
                                                        <td className="px-6 py-4"><StatusBadge status={app.status} /></td>
                                                        <td className="px-6 py-4 text-right">
                                                            <Link to={`/applications/${app._id}`} className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-400 hover:bg-primary hover:text-white transition-all">
                                                                <ArrowRight size={16} />
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Right Col: Recommendations */}
                        <div className="space-y-8">
                            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-1 rounded-2xl shadow-xl">
                                <div className="bg-gray-900/10 h-full w-full rounded-xl p-6 text-white relative overflow-hidden backdrop-blur-sm">
                                    {/* Decorative Circles */}
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>

                                    <h3 className="text-xl font-heading font-bold mb-2 relative z-10">Recommended for You</h3>
                                    <p className="text-indigo-100 text-sm mb-6 relative z-10 border-b border-white/10 pb-4">
                                        Opportunities matching your profile
                                    </p>

                                    <div className="space-y-4 relative z-10">
                                        {recommendations.length === 0 ? (
                                            <p className="text-sm opacity-80 bg-white/5 p-4 rounded-lg text-center">
                                                Update your profile to get personalized recommendations.
                                            </p>
                                        ) : recommendations.slice(0, 3).map(sch => (
                                            <Link to={`/scholarships/${sch._id}`} key={sch._id} className="block bg-white/10 p-4 rounded-xl border border-white/5 hover:bg-white/20 transition-all hover:scale-[1.02] group">
                                                <h4 className="font-semibold text-sm truncate pr-2 text-white group-hover:text-indigo-100">{sch.title}</h4>
                                                <div className="flex justify-between items-center mt-3 text-xs text-indigo-200">
                                                    <span className="font-bold bg-white/20 px-2 py-1 rounded text-white">${sch.amount}</span>
                                                    <span>Deadline: {format(new Date(sch.deadline), 'MMM dd')}</span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>

                                    <Link to="/scholarships" className="block text-center mt-8 py-3 bg-white text-indigo-700 rounded-xl text-sm font-bold hover:bg-indigo-50 transition shadow-lg relative z-10">
                                        Explore All Scholarships
                                    </Link>
                                </div>
                            </div>

                            {/* Quick Tips or Info */}
                            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                                <h4 className="font-bold text-blue-900 mb-2">Did you know?</h4>
                                <p className="text-sm text-blue-700">
                                    Completing your profile increases your chances of finding relevant scholarships by 60%.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default Dashboard;

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
            <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto space-y-8">

                    {/* Welcome Section */}
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-3xl font-heading font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0] || 'Student'}!</h1>
                            <p className="text-gray-500 mt-1">Here is what's happening with your applications today.</p>
                        </div>
                        <Link to="/scholarships" className="btn btn-primary flex items-center gap-2">
                            <Search size={18} /> Find Scholarships
                        </Link>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard title="Total Applications" value={stats.total} icon={FileText} color="#3b82f6" subtext="+2 this month" />
                        <StatCard title="Pending Review" value={stats.pending} icon={Clock} color="#f59e0b" subtext="Waiting for decision" />
                        <StatCard title="Approved" value={stats.approved} icon={CheckCircle} color="#10b981" subtext="Scholarships awarded" />
                        <StatCard title="Rejected" value={stats.rejected} icon={XCircle} color="#ef4444" subtext="Better luck next time" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Left Col: Chart & Recent Apps */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* Chart */}
                            <div className="card p-6">
                                <h3 className="text-lg font-bold mb-6 text-gray-800">Application Status Overview</h3>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 10 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="name" type="category" width={70} tick={{ fontSize: 12 }} />
                                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                            <Bar dataKey="value" barSize={32} radius={[0, 4, 4, 0]}>
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Recent Table */}
                            <div className="card overflow-hidden">
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-gray-800">Recent Applications</h3>
                                    <Link to="/applications" className="text-primary-600 text-sm hover:underline font-medium">View All</Link>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase font-semibold">
                                            <tr>
                                                <th className="px-6 py-4">Scholarship</th>
                                                <th className="px-6 py-4">Date</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {recentApps.length === 0 ? (
                                                <tr><td colSpan="4" className="text-center py-8 text-gray-500">No applications yet. Start applying!</td></tr>
                                            ) : (
                                                recentApps.map(app => (
                                                    <tr key={app._id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-6 py-4 font-medium text-gray-900">{app.scholarship?.title || 'Unknown Scholarship'}</td>
                                                        <td className="px-6 py-4 text-gray-500 text-sm">{format(new Date(app.createdAt), 'MMM dd, yyyy')}</td>
                                                        <td className="px-6 py-4"><StatusBadge status={app.status} /></td>
                                                        <td className="px-6 py-4">
                                                            <Link to={`/applications/${app._id}`} className="text-gray-400 hover:text-primary-600 transition">
                                                                <ArrowRight size={18} />
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
                            <div className="bg-gradient-to-br from-primary-600 to-primary-800 p-6 rounded-xl shadow-lg text-white relative overflow-hidden">
                                {/* Decorative Circle */}
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

                                <h3 className="text-lg font-heading font-bold mb-1 relative z-10">Recommended for You</h3>
                                <p className="text-primary-100 text-sm mb-6 relative z-10">Based on your academic profile</p>

                                <div className="space-y-3 relative z-10">
                                    {recommendations.length === 0 ? (
                                        <p className="text-sm opacity-80 bg-white/10 p-4 rounded-lg">Update your profile to get matched with up to 50+ scholarships.</p>
                                    ) : recommendations.slice(0, 3).map(sch => (
                                        <Link to={`/scholarships/${sch._id}`} key={sch._id} className="block bg-white/10 p-4 rounded-lg backdrop-blur-sm border border-white/10 hover:bg-white/20 transition group">
                                            <h4 className="font-semibold text-sm truncate pr-4">{sch.title}</h4>
                                            <div className="flex justify-between items-center mt-2 text-xs text-primary-100 group-hover:text-white">
                                                <span className="font-bold">${sch.amount}</span>
                                                <span>Deadline: {format(new Date(sch.deadline), 'MMM dd')}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>

                                <Link to="/scholarships" className="block text-center mt-6 py-2.5 bg-white text-primary-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition shadow-sm relative z-10">
                                    View All Opportunities
                                </Link>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default Dashboard;

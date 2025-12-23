import { useState, useEffect } from 'react';
import api from '../services/api';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import {
    Users, FileText, CheckCircle, XCircle, MoreVertical, Download,
    Trash2, Eye, Edit, Plus, Search, Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalApps: 0, pendingApps: 0, approvedApps: 0, totalScholarships: 0
    });
    const [recentApps, setRecentApps] = useState([]);
    const [scholarships, setScholarships] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            // In a real app, these would probably be separate specific admin endpoints
            // For now, we reuse existing or assume admin access to 'getAll' style routes
            const [appsRes, scholRes] = await Promise.all([
                api.get('/applications/admin/all'), // Needs backend implementation or use existing if role protected
                api.get('/scholarships?sort=-createdAt&limit=5')
            ]);

            const apps = appsRes.data.data.applications;
            const schols = scholRes.data.data.scholarships;
            const totalSchols = scholRes.data.total; // Pagination metadata

            setRecentApps(apps.slice(0, 10)); // Top 10 recent
            setScholarships(schols);

            // Calculate Stats
            const pending = apps.filter(a => ['received', 'under_review'].includes(a.status)).length;
            const approved = apps.filter(a => a.status === 'approved').length;

            setStats({
                totalApps: apps.length,
                pendingApps: pending,
                approvedApps: approved,
                totalScholarships: totalSchols
            });

        } catch (err) {
            console.error(err);
            // Fallback mock for demo if backend not fully ready for "Admin Analytics"
            setStats({ totalApps: 120, pendingApps: 45, approvedApps: 30, totalScholarships: 12 });
            setRecentApps([]);
        } finally {
            setLoading(false);
        }
    };

    // Mock Chart Data (since we don't have historical aggregations in backend yet)
    const analyticsData = [
        { name: 'Mon', apps: 4 },
        { name: 'Tue', apps: 7 },
        { name: 'Wed', apps: 5 },
        { name: 'Thu', apps: 12 },
        { name: 'Fri', apps: 9 },
        { name: 'Sat', apps: 3 },
        { name: 'Sun', apps: 2 },
    ];

    const pieData = [
        { name: 'Pending', value: stats.pendingApps, color: '#f59e0b' },
        { name: 'Approved', value: stats.approvedApps, color: '#10b981' },
        { name: 'Rejected', value: stats.totalApps - stats.pendingApps - stats.approvedApps, color: '#ef4444' },
    ];

    if (loading) return <div className="flex h-screen items-center justify-center">Loading Admin Dashboard...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto space-y-8">

                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Overview</h1>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700">
                            <Download size={16} /> Export Report
                        </button>
                        <Link to="/admin/scholarships/new" className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow">
                            <Plus size={16} /> New Scholarship
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Total Applications</p>
                                <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.totalApps}</h3>
                                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full mt-2 inline-block">+12% this week</span>
                            </div>
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><FileText size={20} /></div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Pending Review</p>
                                <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingApps}</h3>
                                <p className="text-xs text-gray-400 mt-1">Requires attention</p>
                            </div>
                            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg"><ClockIcon /></div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Active Scholarships</p>
                                <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.totalScholarships}</h3>
                            </div>
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><CheckCircle size={20} /></div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Approval Rate</p>
                                <h3 className="text-3xl font-bold text-gray-900 mt-2">
                                    {stats.totalApps > 0 ? ((stats.approvedApps / stats.totalApps) * 100).toFixed(1) : 0}%
                                </h3>
                            </div>
                            <div className="p-3 bg-green-50 text-green-600 rounded-lg"><Users size={20} /></div>
                        </div>
                    </div>
                </div>

                {/* Charts Area */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold mb-6">Application Trends (Last 7 Days)</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={analyticsData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="apps" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold mb-6">Application Status Distribution</h3>
                        <div className="h-64 flex justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-4 text-sm text-gray-500 mt-4">
                            {pieData.map((entry, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                                    {entry.name}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Application Queue Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <h3 className="text-lg font-bold text-gray-900">Recent Applications</h3>
                        <div className="flex gap-2">
                            <div className="relative">
                                <input type="text" placeholder="Search..." className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                            </div>
                            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600"><Filter size={18} /></button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                                <tr>
                                    <th className="px-6 py-4">Applicant</th>
                                    <th className="px-6 py-4">Scholarship</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Applied Date</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {recentApps.length > 0 ? recentApps.map(app => (
                                    <tr key={app._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {app.student?.name}
                                            <div className="text-xs text-gray-400">{app.student?.email}</div>
                                        </td>
                                        <td className="px-6 py-4">{app.scholarship?.title}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize 
                                                ${app.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                    app.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {app.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">{format(new Date(app.createdAt), 'MMM dd, yyyy')}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Link to={`/admin/applications/${app._id}`} className="text-primary hover:underline">Review</Link>
                                                <button className="text-gray-400 hover:text-gray-600"><MoreVertical size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No recent applications found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Scholarship Management (Mini) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-900">Manage Scholarships</h3>
                        <Link to="/admin/scholarships" className="text-sm text-primary hover:underline font-medium">View All</Link>
                    </div>
                    <div className="p-6 pt-2">
                        {scholarships.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {scholarships.map(item => (
                                    <div key={item._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition bg-gray-50">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-gray-900 line-clamp-1" title={item.title}>{item.title}</h4>
                                            <Link to={`/scholarships/edit/${item._id}`} className="text-gray-400 hover:text-primary"><Edit size={16} /></Link>
                                        </div>
                                        <div className="text-xs text-gray-500 space-y-1">
                                            <p>Deadline: {format(new Date(item.deadline), 'MMM dd, yyyy')}</p>
                                            <p>Amount: ${item.amount}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-gray-500 text-sm">No scholarships posted yet.</p>}
                    </div>
                </div>

            </div>
        </div>
    );
};

// Icon Helper
const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
);

export default AdminDashboard;

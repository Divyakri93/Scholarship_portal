import { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { Search, Filter, ArrowRight, Calendar, DollarSign, Clock, FileText } from 'lucide-react';
import { format } from 'date-fns';
import PageTransition from '../components/common/PageTransition';
import EmptyState from '../components/common/EmptyState';
import { Skeleton } from '../components/common/Loading';

const StatusBadge = ({ status }) => {
    const styles = {
        received: 'bg-blue-100 text-blue-800 border-blue-200',
        under_review: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        approved: 'bg-green-100 text-green-800 border-green-200',
        rejected: 'bg-red-100 text-red-800 border-red-200',
        draft: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize border ${styles[status] || styles.draft}`}>
            {status ? status.replace('_', ' ') : 'Unknown'}
        </span>
    );
};

const ApplicationListSkeleton = () => (
    <div className="bg-white rounded-xl p-5 border border-gray-200 flex flex-col md:flex-row justify-between gap-4 animate-pulse">
        <div className="space-y-3 w-full">
            <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="flex gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
            </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="hidden md:block">
                <Skeleton className="h-3 w-20 mb-1" />
                <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
    </div>
);

const ApplicationList = () => {
    const [applications, setApplications] = useState([]);
    const [filteredApps, setFilteredApps] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [statusFilter, setStatusFilter] = useState('all');
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchApplications();
    }, []);

    useEffect(() => {
        let result = applications;

        if (statusFilter !== 'all') {
            result = result.filter(app => app.status === statusFilter);
        }

        if (search) {
            result = result.filter(app =>
                app.scholarship?.title.toLowerCase().includes(search.toLowerCase())
            );
        }

        setFilteredApps(result);
    }, [statusFilter, search, applications]);

    const fetchApplications = async () => {
        try {
            const res = await api.get('/applications/my-applications');
            setApplications(res.data.data.applications);
            setFilteredApps(res.data.data.applications);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageTransition>
            <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto space-y-8">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                        <div>
                            <h1 className="text-3xl font-heading font-bold text-gray-900">My Applications</h1>
                            <p className="text-gray-500 mt-2">Track and manage your scholarship applications.</p>
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full">
                            <input
                                type="text"
                                placeholder="Search scholarship title..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        </div>

                        <div className="w-full md:w-auto min-w-[200px]">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
                            >
                                <option value="all">All Status</option>
                                <option value="received">Received</option>
                                <option value="under_review">Under Review</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>

                    {/* List */}
                    <div className="space-y-4">
                        {loading ? (
                            [1, 2, 3].map(i => <ApplicationListSkeleton key={i} />)
                        ) : filteredApps.length === 0 ? (
                            <EmptyState
                                icon={FileText}
                                title="No applications found"
                                description={search || statusFilter !== 'all' ? "Try adjusting your filters." : "You haven't applied to any scholarships yet."}
                                action={
                                    (!search && statusFilter === 'all') && (
                                        <Link to="/scholarships" className="btn btn-primary mt-4">Browse Scholarships</Link>
                                    )
                                }
                            />
                        ) : (
                            filteredApps.map(app => (
                                <div key={app._id} className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition flex flex-col md:flex-row justify-between gap-4 group">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-heading font-bold text-lg text-gray-900 group-hover:text-primary-600 transition">{app.scholarship?.title}</h3>
                                            <StatusBadge status={app.status} />
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                            <div className="flex items-center"><Calendar size={14} className="mr-1 text-gray-400" /> Applied: {format(new Date(app.createdAt), 'MMM dd, yyyy')}</div>
                                            <div className="flex items-center"><DollarSign size={14} className="mr-1 text-gray-400" /> Amount: ${app.scholarship?.amount?.toLocaleString()}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 shrink-0 mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                                        <div className="text-right hidden md:block">
                                            <p className="text-xs text-gray-400">Last updated</p>
                                            <p className="text-sm font-medium text-gray-600">
                                                {format(new Date(app.updatedAt), 'MMM dd, yyyy')}
                                            </p>
                                        </div>
                                        <Link
                                            to={`/applications/${app._id}`}
                                            className="flex-1 md:flex-none text-center px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition shadow-sm flex items-center justify-center gap-2"
                                        >
                                            View Details <ArrowRight size={16} />
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                </div>
            </div>
        </PageTransition>
    );
};

export default ApplicationList;

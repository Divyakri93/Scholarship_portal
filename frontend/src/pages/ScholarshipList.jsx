import { useState, useEffect } from 'react';
import api from '../services/api';
import ScholarshipCard, { ScholarshipSkeleton } from '../components/ScholarshipCard';
import PageTransition from '../components/common/PageTransition';
import EmptyState from '../components/common/EmptyState';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, MapPin, DollarSign, BookOpen, X, LayoutGrid, List } from 'lucide-react';

const ScholarshipList = () => {
    const [scholarships, setScholarships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const [viewMode, setViewMode] = useState('grid');
    const [showFilters, setShowFilters] = useState(false);

    // Pagination State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const LIMIT = 9;

    // Filter State
    const [filters, setFilters] = useState({
        search: '',
        minAmount: '',
        course: '',
        sort: '-createdAt'
    });

    // Debounced search term state
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    // Effect for immediate fetches (page, sort)
    useEffect(() => {
        fetchScholarships();
    }, [page, filters.sort, debouncedSearchTerm]); // Add debouncedSearchTerm here

    // Effect for debouncing the search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(filters.search);
        }, 500); // 500ms delay

        return () => {
            clearTimeout(timer);
        };
    }, [filters.search]); // Only re-run if filters.search changes

    const fetchScholarships = async () => {
        setLoading(true);
        try {
            let query = `?page=${page}&limit=${LIMIT}&sort=${filters.sort}`;

            if (debouncedSearchTerm) query += `&search=${debouncedSearchTerm}`; // Use debounced term
            if (filters.minAmount) query += `&amount[gte]=${filters.minAmount}`;
            if (filters.course) query += `&eligibility.allowedCourses=${filters.course}`; // Assuming simple match support or user filtered manually

            const res = await api.get(`/scholarships${query}`);
            setScholarships(res.data.data.scholarships);
            setTotalPages(Math.ceil(res.data.total / LIMIT));
        } catch (err) {
            console.error("Failed to fetch scholarships", err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const applyFilters = (e) => {
        e.preventDefault();
        setPage(1);
        // For filters other than search, we want immediate application.
        // The useEffect for page/sort/debouncedSearchTerm will handle the fetch.
        // If minAmount or course change, we need to trigger a fetch.
        // Since they are part of `filters` state, and `debouncedSearchTerm` also depends on `filters.search`,
        // we need to ensure `fetchScholarships` is called when these change.
        // A simple way is to make `fetchScholarships` depend on `filters.minAmount` and `filters.course` as well,
        // but that would re-fetch on every keystroke for minAmount.
        // The current setup means `applyFilters` button explicitly triggers a fetch.
        // For search, it's debounced. For minAmount/course, it's applied on button click.
        // This is a reasonable separation.
        fetchScholarships(); // Explicitly call for immediate filters like minAmount/course
        if (window.innerWidth < 768) setShowFilters(false);
    };

    const clearFilters = () => {
        setFilters({ search: '', minAmount: '', course: '', sort: '-createdAt' });
        setPage(1);
        // Force immediate refetch logic or let effect handle it if dependency changes.
        // Since sort resets to default, it might trigger effect. If it was already default, we must manually fetch.
        setTimeout(() => fetchScholarships(), 0);
    };

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-heading font-bold text-gray-900">Find Scholarships</h1>
                        <p className="text-gray-500 mt-2">Discover financial aid opportunities tailored for you.</p>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Mobile Filter Toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="md:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium"
                        >
                            <Filter size={18} /> Filters
                        </button>

                        {/* View Toggle */}
                        <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-md transition ${viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <LayoutGrid size={20} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-md transition ${viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <List size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-start">

                    {/* Sidebar Filters */}
                    <aside className={`w-full md:w-64 flex-shrink-0 space-y-8 ${showFilters ? 'block' : 'hidden md:block'}`}>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-24">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                                    <SlidersHorizontal size={18} /> Filters
                                </h2>
                                <button onClick={clearFilters} className="text-xs text-red-500 hover:underline">Clear</button>
                            </div>

                            <form onSubmit={applyFilters} className="space-y-6">
                                {/* Search */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-2">Search</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="search"
                                            placeholder="Keywords..."
                                            value={filters.search}
                                            onChange={handleFilterChange}
                                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-sm"
                                        />
                                        <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                                    </div>
                                </div>

                                {/* Min Amount */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-2">Min Amount ($)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="minAmount"
                                            placeholder="e.g. 1000"
                                            value={filters.minAmount}
                                            onChange={handleFilterChange}
                                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-sm"
                                        />
                                        <DollarSign size={16} className="absolute left-3 top-2.5 text-gray-400" />
                                    </div>
                                </div>

                                {/* Sort */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-2">Sort By</label>
                                    <select
                                        name="sort"
                                        value={filters.sort}
                                        onChange={handleFilterChange}
                                        className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-primary focus:border-primary"
                                    >
                                        <option value="-createdAt">Newest First</option>
                                        <option value="deadline">Approaching Deadline</option>
                                        <option value="-amount">Highest Amount</option>
                                    </select>
                                </div>

                                <button type="submit" className="w-full btn btn-primary">
                                    Apply Filters
                                </button>
                            </form>
                        </div>
                    </aside>

                    {/* Search Results */}
                    <div className="flex-1 w-full">
                        {loading ? (
                            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                                {[1, 2, 3, 4, 5, 6].map(i => <ScholarshipSkeleton key={i} viewMode={viewMode} />)}
                            </div>
                        ) : (
                            <>
                                {scholarships.length > 0 ? (
                                    <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                                        {scholarships.map(scholarship => (
                                            <ScholarshipCard key={scholarship._id} scholarship={scholarship} viewMode={viewMode} />
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        title="No Scholarships Found"
                                        description="Try adjusting your search criteria or filters to see more results."
                                        action={
                                            <button
                                                onClick={clearFilters}
                                                className="text-primary font-medium hover:underline mt-2"
                                            >
                                                Clear filters
                                            </button>
                                        }
                                    />
                                )}

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center pt-12">
                                        <div className="flex gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                                            <button
                                                disabled={page === 1}
                                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                                className="px-4 py-2 rounded-md hover:bg-gray-50 disabled:opacity-50 text-sm font-medium"
                                            >
                                                Previous
                                            </button>
                                            <span className="px-4 py-2 text-gray-600 text-sm font-medium flex items-center border-l border-r border-gray-100">
                                                Page {page} of {totalPages}
                                            </span>
                                            <button
                                                disabled={page === totalPages}
                                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                                className="px-4 py-2 rounded-md hover:bg-gray-50 disabled:opacity-50 text-sm font-medium"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScholarshipList;

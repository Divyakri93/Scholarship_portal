import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    Calendar, DollarSign, BookOpen, Clock, Building,
    CheckCircle, AlertCircle, ArrowLeft, FileText
} from 'lucide-react';
import { format, isValid } from 'date-fns';
import { toast } from 'react-toastify';
import EligibilityChecker from '../components/EligibilityChecker';

// Safe Date Formatter
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isValid(date) ? format(date, 'MMM dd, yyyy') : 'Invalid Date';
};

const ScholarshipDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [scholarship, setScholarship] = useState(null);
    const [loading, setLoading] = useState(true);

    console.log("ScholarshipDetails mounting for ID:", id);

    useEffect(() => {
        fetchScholarship();
    }, [id]);

    const fetchScholarship = async () => {
        try {
            const res = await api.get(`/scholarships/${id}`);
            setScholarship(res.data.data.scholarship);
        } catch (err) {
            toast.error('Failed to load scholarship details');
            navigate('/scholarships');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!scholarship) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Scholarship Not Found</h2>
            <p className="text-gray-600 mb-6">The scholarship you are looking for does not exist or has been removed.</p>
            <button onClick={() => navigate('/scholarships')} className="btn btn-primary">
                Back to Scholarships
            </button>
        </div>
    );

    const isExpired = new Date(scholarship.deadline) < new Date();

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
                    <ArrowLeft size={20} className="mr-2" /> Back to List
                </button>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white relative">
                        <div className="relative z-10">
                            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold mb-4 border border-white/20">
                                {scholarship?.provider?.organizationDetails?.name || scholarship?.provider?.name || "Verified Provider"}
                            </span>
                            <h1 className="text-3xl font-bold mb-2">{scholarship?.title}</h1>
                            <p className="text-blue-100 max-w-2xl">{scholarship?.description?.substring(0, 150)}...</p>
                        </div>
                        {/* Abstract Shapes */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                    </div>

                    <div className="p-8">
                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                            <div className="p-4 bg-green-50 rounded-xl border border-green-100 flex items-center">
                                <div className="p-3 bg-green-100 text-green-600 rounded-lg mr-4">
                                    <DollarSign size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Award Amount</p>
                                    <p className="text-xl font-bold text-gray-900">${scholarship.amount.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center">
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg mr-4">
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Deadline</p>
                                    <p className="text-xl font-bold text-gray-900">{formatDate(scholarship.deadline)}</p>
                                </div>
                            </div>

                            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 flex items-center">
                                <div className="p-3 bg-purple-100 text-purple-600 rounded-lg mr-4">
                                    <Building size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Provider</p>
                                    <p className="text-lg font-bold text-gray-900 truncate max-w-[120px]" title={scholarship.provider?.name}>
                                        {scholarship.provider?.name || 'Organization'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            {/* Left Column: Details */}
                            <div className="lg:col-span-2 space-y-8">
                                <section>
                                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                        <FileText className="mr-2 text-primary" size={20} /> Description
                                    </h2>
                                    <div className="prose text-gray-600 leading-relaxed">
                                        {scholarship.description}
                                    </div>
                                </section>

                                <section>
                                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                        <CheckCircle className="mr-2 text-primary" size={20} /> Eligibility Criteria
                                    </h2>
                                    <ul className="space-y-3">
                                        {scholarship.eligibility?.minGPA > 0 && (
                                            <li className="flex items-center text-gray-700">
                                                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                                                Minimum GPA: <span className="font-semibold ml-1">{scholarship.eligibility.minGPA}</span>
                                            </li>
                                        )}
                                        {scholarship.eligibility?.minAge && (
                                            <li className="flex items-center text-gray-700">
                                                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                                                Age Requirement: {scholarship.eligibility.minAge} - {scholarship.eligibility.maxAge || 'No limit'} years
                                            </li>
                                        )}
                                        {scholarship.eligibility?.allowedCourses?.length > 0 && (
                                            <li className="flex items-start text-gray-700">
                                                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></span>
                                                <span>
                                                    Must be studying: <span className="font-semibold">{scholarship.eligibility.allowedCourses.join(', ')}</span>
                                                </span>
                                            </li>
                                        )}
                                        {scholarship.eligibility?.maxIncome && (
                                            <li className="flex items-center text-gray-700">
                                                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                                                Annual Income Limit: ${scholarship.eligibility.maxIncome.toLocaleString()}
                                            </li>
                                        )}
                                    </ul>
                                </section>
                            </div>

                            {/* Right Column: Requirements & Action */}
                            <div className="space-y-6">
                                {/* Eligibility Checker Widget */}
                                {user?.role === 'student' && (
                                    <EligibilityChecker scholarshipId={scholarship._id} />
                                )}

                                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                    <h3 className="font-bold text-gray-900 mb-4">Documents Required</h3>
                                    <ul className="space-y-3">
                                        {scholarship.requiredDocuments?.map((doc, i) => (
                                            <li key={i} className="flex items-center text-sm text-gray-600">
                                                <FileText size={16} className="mr-2 text-gray-400" /> {doc}
                                            </li>
                                        ))}
                                        {(!scholarship.requiredDocuments || scholarship.requiredDocuments.length === 0) && (
                                            <li className="text-sm text-gray-500 italic">No specific documents listed.</li>
                                        )}
                                    </ul>
                                </div>

                                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center">
                                    {isExpired ? (
                                        <button disabled className="w-full py-3 bg-gray-100 text-gray-500 rounded-lg font-semibold cursor-not-allowed">
                                            Application Closed
                                        </button>
                                    ) : user?.role === 'student' ? (
                                        <Link
                                            to={`/application/apply/${scholarship._id}`}
                                            className="w-full block py-3 bg-primary text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30"
                                        >
                                            Apply Now
                                        </Link>
                                    ) : user?.role === 'provider' ? (
                                        <div className="text-sm text-gray-500">Provider View</div>
                                    ) : (
                                        <Link to="/login" className="w-full block py-3 bg-primary text-white rounded-lg font-semibold hover:bg-blue-700 transition">
                                            Login to Apply
                                        </Link>
                                    )}

                                    <p className="text-xs text-gray-400 mt-4">
                                        Applications close on {formatDate(scholarship.deadline)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScholarshipDetail;

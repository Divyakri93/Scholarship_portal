import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
    User, FileText, CheckCircle, XCircle, MessageSquare,
    ArrowLeft, Download, ExternalLink, Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const AdminApplicationReview = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [comment, setComment] = useState('');

    useEffect(() => {
        fetchApplication();
    }, [id]);

    const fetchApplication = async () => {
        try {
            const res = await api.get(`/applications/${id}`);
            setApplication(res.data.data.application);
        } catch (err) {
            toast.error('Failed to fetch application details');
            navigate('/admin/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (status) => {
        if (!window.confirm(`Are you sure you want to mark this application as ${status}?`)) return;

        setProcessing(true);
        try {
            await api.patch(`/applications/${id}/status`, {
                status,
                comment: comment || undefined
            });

            toast.success(`Application marked as ${status}`);
            setComment('');
            fetchApplication(); // Refresh data
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        } finally {
            setProcessing(false);
        }
    };

    const handleDocVerification = async (docId, status, comments = '') => {
        try {
            await api.patch(`/documents/${docId}/verify`, { status, comments });
            toast.success(`Document marked as ${status}`);
            fetchApplication(); // Refresh to update UI icons
        } catch (err) {
            toast.error('Verification failed');
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Reviewer Panel...</div>;
    if (!application) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition">
                    <ArrowLeft size={18} className="mr-2" /> Back to Dashboard
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COL: Application Info & Documents */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Header Box */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 mb-1">{application.scholarship?.title}</h1>
                                    <p className="text-gray-500 text-sm">Submitted on {format(new Date(application.createdAt), 'MMMM dd, yyyy')}</p>
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-sm font-bold capitalize border
                                    ${application.status === 'approved' ? 'bg-green-100 text-green-700 border-green-200' :
                                        application.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                                            'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                    {application.status.replace('_', ' ')}
                                </span>
                            </div>
                        </div>

                        {/* Applicant Profile */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                <User className="mr-2 text-primary" size={20} /> Applicant Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs text-gray-400 uppercase font-semibold">Full Name</label>
                                    <p className="font-medium text-gray-900">{application.student?.name}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 uppercase font-semibold">Email</label>
                                    <p className="font-medium text-gray-900">{application.student?.email}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 uppercase font-semibold">Institution</label>
                                    <p className="font-medium text-gray-900">{application.student?.academicProfile?.currentInstitution || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 uppercase font-semibold">GPA</label>
                                    <p className="font-medium text-gray-900">{application.student?.academicProfile?.gpa || 'N/A'}</p>
                                </div>
                                <div className="col-span-1 md:col-span-2 bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex justify-between items-center">
                                    <div>
                                        <label className="text-xs text-indigo-500 uppercase font-bold">System Score</label>
                                        <p className="text-xs text-indigo-400">Based on merit (60%) & need (40%)</p>
                                    </div>
                                    <div className="text-2xl font-bold text-indigo-700">
                                        {application.score !== undefined ? application.score : 'N/A'}
                                        <span className="text-sm text-indigo-400 font-normal">/100</span>
                                    </div>
                                </div>
                            </div>

                            {/* Custom Answers / Essay */}
                            {application.customAnswers?.length > 0 && (
                                <div className="mt-8 pt-6 border-t border-gray-100">
                                    <h3 className="text-sm font-bold text-gray-800 mb-3">Application Questions</h3>
                                    {application.customAnswers.map((ans, i) => (
                                        <div key={i} className="mb-4">
                                            <p className="text-sm text-gray-500 mb-1">{ans.question || 'Statement of Purpose'}</p>
                                            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-800 leading-relaxed border border-gray-200">
                                                {ans.answer}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Documents */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                <FileText className="mr-2 text-primary" size={20} /> Submitted Documents
                            </h2>
                            <div className="space-y-3">
                                {application.submittedDocuments?.map((doc, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary/50 transition">
                                        <div className="flex items-center">
                                            <div className="bg-white p-2 rounded shadow-sm mr-3">
                                                <FileText className="text-red-500" size={20} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm">{doc.documentType}</p>
                                                <p className="text-xs text-gray-500">{doc.document?.name}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {/* Verification Controls */}
                                            {doc.document?.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleDocVerification(doc.document._id, 'verified')}
                                                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                                                        title="Verify"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const reason = prompt("Enter reason for rejection:");
                                                            if (reason) handleDocVerification(doc.document._id, 'rejected', reason);
                                                        }}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                        title="Reject"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                </>
                                            )}
                                            {doc.document?.status === 'verified' && <CheckCircle size={18} className="text-green-500 my-auto mx-2" title="Verified" />}
                                            {doc.document?.status === 'rejected' && <XCircle size={18} className="text-red-500 my-auto mx-2" title="Rejected" />}

                                            <a
                                                href={doc.document?.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-2 text-gray-500 hover:text-primary hover:bg-white rounded-lg transition"
                                                title="View"
                                            >
                                                <ExternalLink size={18} />
                                            </a>
                                            <a
                                                href={doc.document?.url}
                                                download
                                                className="p-2 text-gray-500 hover:text-primary hover:bg-white rounded-lg transition"
                                                title="Download"
                                            >
                                                <Download size={18} />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COL: Action & Timeline */}
                    <div className="space-y-6">

                        {/* Action Panel */}
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sticky top-24">
                            <h3 className="font-bold text-gray-900 mb-4">Review Action</h3>

                            <div className="mb-4">
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Internal Note / Feedback</label>
                                <textarea
                                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-primary focus:border-primary"
                                    rows={4}
                                    placeholder="Add a comment (visible to student)..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <button
                                    onClick={() => handleStatusUpdate('approved')}
                                    disabled={processing}
                                    className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium text-sm transition"
                                >
                                    {processing ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle className="mr-2" size={16} />}
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate('rejected')}
                                    disabled={processing}
                                    className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium text-sm transition"
                                >
                                    {processing ? <Loader2 className="animate-spin" size={16} /> : <XCircle className="mr-2" size={16} />}
                                    Reject
                                </button>
                            </div>
                            <button
                                onClick={() => handleStatusUpdate('under_review')}
                                disabled={processing}
                                className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 font-medium text-sm transition border border-gray-200"
                            >
                                Mark as Under Review
                            </button>
                        </div>

                        {/* Recent History */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="font-bold text-gray-900 mb-4">History Log</h3>
                            <div className="space-y-4">
                                {application.timeline?.slice().reverse().map((event, i) => (
                                    <div key={i} className="flex gap-3 text-sm relative">
                                        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full mt-1.5 shrink-0"></div>
                                        <div>
                                            <p className="text-gray-900 font-medium">Status: <span className="capitalize">{event.status.replace('_', ' ')}</span></p>
                                            {event.comment && <p className="text-gray-500 italic">"{event.comment}"</p>}
                                            <p className="text-xs text-gray-400 mt-1">{format(new Date(event.date), 'MMM dd, HH:mm')}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminApplicationReview;

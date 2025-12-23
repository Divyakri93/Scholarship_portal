import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
    CheckCircle, Circle, Clock, FileText, ArrowLeft,
    MessageSquare, Calendar, Shield, XCircle, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const STATUS_STEPS = [
    { id: 'received', label: 'Received', icon: Clock },
    { id: 'under_review', label: 'Under Review', icon: Shield },
    { id: 'interview', label: 'Interview', icon: MessageSquare }, // Optional step
    { id: 'decision', label: 'Decision', icon: CheckCircle } // Final step abstract
];

const ApplicationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAppDetails();
    }, [id]);

    const fetchAppDetails = async () => {
        try {
            const res = await api.get(`/applications/${id}`);
            setApplication(res.data.data.application);
        } catch (err) {
            toast.error('Failed to load application');
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!application) return null;

    // Derive current step index
    let currentStepIndex = STATUS_STEPS.findIndex(s => s.id === application.status);
    // Decision handling
    const isApproved = application.status === 'approved';
    const isRejected = application.status === 'rejected';

    if (isApproved || isRejected) {
        currentStepIndex = STATUS_STEPS.length - 1; // Last step
    }
    // Draft fallback
    if (currentStepIndex === -1 && application.status === 'draft') currentStepIndex = -1;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Navigation */}
                <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-gray-900 transition">
                    <ArrowLeft size={18} className="mr-2" /> Back to My Applications
                </button>

                {/* Header Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">{application.scholarship?.title}</h1>
                        <p className="text-gray-500 text-sm">Application ID: #{application._id.slice(-6).toUpperCase()}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-full font-bold text-sm border flex items-center gap-2
                ${isApproved ? 'bg-green-100 text-green-700 border-green-200' : ''}
                ${isRejected ? 'bg-red-100 text-red-700 border-red-200' : ''}
                ${!isApproved && !isRejected ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
            `}>
                        {isApproved && <CheckCircle size={16} />}
                        {isRejected && <XCircle size={16} />}
                        {!isApproved && !isRejected && <Clock size={16} />}
                        {application.status.replace('_', ' ').toUpperCase()}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column: Timeline & Comments */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Timeline Visual */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                            <h2 className="text-lg font-bold text-gray-900 mb-8">Application Timeline</h2>
                            <div className="relative">
                                {/* Connecting Line */}
                                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-100"></div>

                                {/* Steps */}
                                {STATUS_STEPS.map((step, index) => {
                                    const isCompleted = index <= currentStepIndex;
                                    const isCurrent = index === currentStepIndex;

                                    // Special styling for final step if Rejected
                                    let iconColor = isCompleted ? 'bg-green-500 text-white shadow-green-200' : 'bg-white text-gray-300 border-2 border-gray-200';
                                    if (step.id === 'decision' && isRejected) {
                                        iconColor = 'bg-red-500 text-white shadow-red-200';
                                    }

                                    return (
                                        <div key={step.id} className="relative flex items-start mb-10 last:mb-0 group">
                                            <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full shadow-sm transition-all duration-300 ${iconColor}`}>
                                                <step.icon size={20} />
                                            </div>
                                            <div className="ml-6 pt-2">
                                                <h3 className={`text-base font-semibold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                                                    {step.id === 'decision' && isRejected ? 'Rejected' :
                                                        step.id === 'decision' && isApproved ? 'Approved' :
                                                            step.label}
                                                </h3>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {isCurrent && appDescription(step.id)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Detailed Timeline History */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Tracking History</h2>
                            <div className="space-y-6">
                                {application.timeline?.slice().reverse().map((event, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="mt-1">
                                            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{event.comment || `Status changed to ${event.status}`}</p>
                                            <p className="text-xs text-gray-500">{format(new Date(event.date), 'MMM dd, yyyy \u2022 hh:mm a')}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Details & Documents */}
                    <div className="space-y-6">

                        {/* Info Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="font-bold text-gray-900 mb-4">Application Details</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-sm text-gray-500">Submitted On</span>
                                    <span className="text-sm font-medium">{format(new Date(application.createdAt), 'MMM dd, yyyy')}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-sm text-gray-500">Last Updated</span>
                                    <span className="text-sm font-medium">{format(new Date(application.updatedAt), 'MMM dd, yyyy')}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-sm text-gray-500">Est. Decision</span>
                                    <span className="text-sm font-medium text-gray-700">
                                        {format(new Date(application.scholarship.deadline), 'MMM dd')} + 2 weeks
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Submitted Documents Status */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="font-bold text-gray-900 mb-4">Submitted Documents</h3>
                            <div className="space-y-3">
                                {application.submittedDocuments?.map((doc, i) => (
                                    <div key={i} className="flex flex-col sm:flex-row gap-3 p-3 rounded-lg border border-gray-200 hover:border-primary transition group relative">
                                        <div className="flex items-center flex-1">
                                            <FileText className={`mr-3 ${doc.document?.status === 'rejected' ? 'text-red-400' : 'text-gray-400'}`} size={18} />
                                            <div className="overflow-hidden">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-medium text-gray-700 truncate">{doc.documentType}</p>
                                                    {doc.document?.status === 'verified' && <CheckCircle size={14} className="text-green-500" />}
                                                    {doc.document?.status === 'rejected' && <AlertCircle size={14} className="text-red-500" />}
                                                </div>
                                                <p className="text-xs text-gray-400 truncate">{doc.document?.name}</p>
                                                {doc.document?.status === 'rejected' && (
                                                    <p className="text-xs text-red-600 mt-1">Reason: {doc.document?.verificationComments}</p>
                                                )}
                                            </div>
                                        </div>
                                        <a
                                            href={doc.document?.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-sm text-primary hover:underline self-start sm:self-center"
                                        >
                                            View
                                        </a>
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

const appDescription = (status) => {
    switch (status) {
        case 'received': return 'We have received your application and are preparing it for review.';
        case 'under_review': return 'The scholarship committee is currently reviewing your application.';
        case 'interview': return 'You have been selected for an interview step.';
        case 'decision': return 'The final decision has been made on your application.';
        default: return '';
    }
};

export default ApplicationDetail;

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    Upload, X, CheckCircle, FileText, Loader2, AlertTriangle,
    ChevronRight, ChevronLeft, Save, User, BookOpen
} from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
    { id: 1, title: 'Overview' },
    { id: 2, title: 'Personal Info' },
    { id: 3, title: 'Documents' },
    { id: 4, title: 'Essay' },
    { id: 5, title: 'Review' }
];

const ApplicationForm = () => {
    const { scholarshipId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [currentStep, setCurrentStep] = useState(1);
    const [scholarship, setScholarship] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Application Data
    const [docFiles, setDocFiles] = useState({}); // Stores File objects (not serializable for auto-save)
    const [formData, setFormData] = useState({
        statementOfPurpose: '',
        ...user?.academicProfile // Pre-fill
    });

    // Auto-save logic (Local Storage for text fields)
    useEffect(() => {
        const savedData = localStorage.getItem(`draft_${scholarshipId}`);
        if (savedData) {
            const parsed = JSON.parse(savedData);
            setFormData(prev => ({ ...prev, ...parsed }));
            toast.info('Draft info loaded', { autoClose: 2000 });
        }

        const interval = setInterval(() => {
            saveDraft();
        }, 30000); // 30s auto-save

        return () => clearInterval(interval);
    }, [scholarshipId]);

    const saveDraft = useCallback(() => {
        localStorage.setItem(`draft_${scholarshipId}`, JSON.stringify({
            statementOfPurpose: formData.statementOfPurpose
        }));
        // Visual indicator could be added here
        console.log('Auto-saved draft');
    }, [scholarshipId, formData.statementOfPurpose]);

    useEffect(() => {
        fetchData();
    }, [scholarshipId]);

    const fetchData = async () => {
        try {
            const res = await api.get(`/scholarships/${scholarshipId}`);
            setScholarship(res.data.data.scholarship);
        } catch (err) {
            toast.error('Could not load scholarship info');
            navigate('/scholarships');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (reqDocName, e) => {
        const file = e.target.files[0];
        if (file) {
            setDocFiles(prev => ({ ...prev, [reqDocName]: file }));
        }
    };

    const removeFile = (reqDocName) => {
        setDocFiles(prev => {
            const newState = { ...prev };
            delete newState[reqDocName];
            return newState;
        });
    };

    const validateStep = () => {
        if (currentStep === 3) {
            if (scholarship.requiredDocuments) {
                for (let doc of scholarship.requiredDocuments) {
                    if (!docFiles[doc]) {
                        toast.error(`Missing required document: ${doc}`);
                        return false;
                    }
                }
            }
        }
        if (currentStep === 4) {
            if (formData.statementOfPurpose.trim().length < 50) {
                toast.error('Essay is too short (min 50 chars)');
                return false;
            }
        }
        return true;
    };

    const nextStep = () => {
        if (validateStep()) {
            setCurrentStep(p => p + 1);
            saveDraft(); // Save on step change
        }
    };

    const prevStep = () => setCurrentStep(p => p - 1);

    const handleSubmit = async () => {
        if (!window.confirm('Are you sure you want to submit this application? This action cannot be undone.')) return;

        setSubmitting(true);
        try {
            // 1. Create Application
            const createRes = await api.post('/applications', {
                scholarship: scholarshipId,
                customAnswers: [
                    { question: 'Statement of Purpose', answer: formData.statementOfPurpose }
                ]
            });
            const appId = createRes.data.data.application._id;

            // 2. Upload Documents
            const uploadPromises = Object.entries(docFiles).map(async ([docType, file]) => {
                const fd = new FormData();
                fd.append('document', file);
                fd.append('documentType', docType);

                return api.post(`/applications/${appId}/documents`, fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            });

            await Promise.all(uploadPromises);

            localStorage.removeItem(`draft_${scholarshipId}`); // Clear draft
            toast.success('Application Submitted Successfully!');
            navigate('/dashboard');

        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

    const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">

                {/* Progress Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-900">Application for {scholarship.title}</h2>
                        <span className="text-sm text-gray-500">Step {currentStep} of 5</span>
                    </div>
                    {/* Stepper Visuals */}
                    <div className="relative">
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5 }}
                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"
                            />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 font-medium">
                            {STEPS.map(s => (
                                <span key={s.id} className={`${currentStep >= s.id ? 'text-primary' : ''}`}>{s.title}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden min-h-[500px] flex flex-col">
                    <div className="p-8 flex-1">
                        <AnimatePresence mode="wait">

                            {/* STEP 1: Overview */}
                            {currentStep === 1 && (
                                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                    <h3 className="text-2xl font-bold mb-4">Review Requirements</h3>
                                    <div className="prose max-w-none text-gray-600">
                                        <p className="mb-4">Before proceeding, please ensure you meet all eligibility criteria for the <strong>{scholarship.title}</strong> provided by {scholarship.provider?.name}.</p>

                                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 my-6">
                                            <h4 className="font-bold text-blue-900 mb-2">Eligibility Check</h4>
                                            <ul className="list-disc pl-5 space-y-1">
                                                <li>Minimum GPA: {scholarship.eligibility.minGPA}</li>
                                                {scholarship.eligibility.allowedCourses?.length > 0 && <li>Courses: {scholarship.eligibility.allowedCourses.join(', ')}</li>}
                                                {scholarship.eligibility.maxIncome && <li>Income Limit: ${scholarship.eligibility.maxIncome}</li>}
                                            </ul>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-4">Click "Next" to confirm you are eligible.</p>
                                </motion.div>
                            )}

                            {/* STEP 2: Personal Info (Auto-fill) */}
                            {currentStep === 2 && (
                                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                    <h3 className="text-2xl font-bold mb-4 flex items-center"><User className="mr-2" /> Personal & Academic</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                            <input type="text" value={user.name} disabled className="mt-1 block w-full bg-gray-100 border-gray-300 rounded-md shadow-sm px-3 py-2 cursor-not-allowed text-gray-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Email</label>
                                            <input type="text" value={user.email} disabled className="mt-1 block w-full bg-gray-100 border-gray-300 rounded-md shadow-sm px-3 py-2 cursor-not-allowed text-gray-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Current Institution</label>
                                            <input type="text" value={user.academicProfile?.currentInstitution} disabled className="mt-1 block w-full bg-gray-100 border-gray-300 rounded-md shadow-sm px-3 py-2 cursor-not-allowed text-gray-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">GPA</label>
                                            <input type="text" value={user.academicProfile?.gpa} disabled className="mt-1 block w-full bg-gray-100 border-gray-300 rounded-md shadow-sm px-3 py-2 cursor-not-allowed text-gray-500" />
                                        </div>
                                    </div>
                                    <div className="mt-6 p-4 bg-yellow-50 text-yellow-800 text-sm rounded-lg flex items-start">
                                        <AlertTriangle size={16} className="mr-2 mt-0.5" />
                                        <p>Info incorrect? Go to your Profile to update it before applying.</p>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 3: Documents */}
                            {currentStep === 3 && (
                                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                    <h3 className="text-2xl font-bold mb-4 flex items-center"><FileText className="mr-2" /> Upload Documents</h3>
                                    <div className="space-y-6">
                                        {scholarship.requiredDocuments?.map((docName, index) => (
                                            <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                                    {docName} <span className="text-red-500">*</span>
                                                </label>
                                                {!docFiles[docName] ? (
                                                    <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary transition bg-white text-center cursor-pointer group">
                                                        <input
                                                            type="file"
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                            accept=".pdf,.jpg,.jpeg,.png"
                                                            onChange={(e) => handleFileChange(docName, e)}
                                                        />
                                                        <Upload className="mx-auto h-8 w-8 text-gray-400 group-hover:text-primary mb-2" />
                                                        <p className="text-sm text-gray-500 group-hover:text-primary">Drag & drop or Click to Upload</p>
                                                        <p className="text-xs text-gray-400 mt-1">PDF, JPG (Max 5MB)</p>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-between bg-white p-3 rounded border border-green-200 shadow-sm">
                                                        <div className="flex items-center">
                                                            <div className="bg-green-100 p-2 rounded mr-3">
                                                                <FileText className="text-green-600" size={20} />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900">{docFiles[docName].name}</p>
                                                                <p className="text-xs text-gray-500">{(docFiles[docName].size / 1024 / 1024).toFixed(2)} MB</p>
                                                            </div>
                                                        </div>
                                                        <button onClick={() => removeFile(docName)} className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-gray-100"><X size={20} /></button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 4: Essay */}
                            {currentStep === 4 && (
                                <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                    <h3 className="text-2xl font-bold mb-4 flex items-center"><BookOpen className="mr-2" /> Statement of Purpose</h3>
                                    <p className="mb-3 text-sm text-gray-600">Why are you the best candidate for this scholarship? (Min 50 chars)</p>
                                    <textarea
                                        className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="Start typing your essay here..."
                                        value={formData.statementOfPurpose}
                                        onChange={(e) => setFormData({ ...formData, statementOfPurpose: e.target.value })}
                                    />
                                    <div className="flex justify-end mt-2 text-xs text-gray-400">
                                        {formData.statementOfPurpose.length} chars
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 5: Review */}
                            {currentStep === 5 && (
                                <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                    <h3 className="text-2xl font-bold mb-6">Review Application</h3>

                                    <div className="space-y-6">
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h4 className="font-bold text-gray-700 mb-2">Personal Info</h4>
                                            <p className="text-sm">{user.name} ({user.email})</p>
                                            <p className="text-sm">{user.academicProfile?.currentInstitution} - GPA: {user.academicProfile?.gpa}</p>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h4 className="font-bold text-gray-700 mb-2">Documents Ready ({Object.keys(docFiles).length})</h4>
                                            <ul className="text-sm list-disc pl-5">
                                                {Object.keys(docFiles).map(k => <li key={k}>{k}: {docFiles[k].name}</li>)}
                                            </ul>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h4 className="font-bold text-gray-700 mb-2">Statement of Purpose</h4>
                                            <p className="text-sm italic text-gray-600 line-clamp-3">"{formData.statementOfPurpose}"</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>

                    {/* Footer Actions */}
                    <div className="bg-gray-50 p-6 border-t border-gray-200 flex justify-between items-center">
                        <button
                            onClick={prevStep}
                            disabled={currentStep === 1 || submitting}
                            className="flex items-center px-6 py-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            <ChevronLeft size={16} className="mr-2" /> Back
                        </button>

                        <div className="flex gap-3">
                            {currentStep > 1 && currentStep < 5 && (
                                <button onClick={saveDraft} className="flex items-center px-4 py-2 text-gray-600 hover:text-primary transition">
                                    <Save size={16} className="mr-2" /> Save Draft
                                </button>
                            )}

                            {currentStep < 5 ? (
                                <button onClick={nextStep} className="flex items-center px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition shadow-lg">
                                    Next <ChevronRight size={16} className="ml-2" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="flex items-center px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-lg disabled:opacity-70"
                                >
                                    {submitting ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle size={16} className="mr-2" />}
                                    Submit Application
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplicationForm;

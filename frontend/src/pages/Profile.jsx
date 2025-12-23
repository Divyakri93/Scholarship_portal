import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
    User, BookOpen, DollarSign, FileText, Lock, Save, Loader2,
    Upload, X, CheckCircle, AlertTriangle, Shield
} from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const TabButton = ({ active, id, label, icon: Icon, onClick }) => (
    <button
        onClick={() => onClick(id)}
        className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 mb-2
      ${active === id
                ? 'bg-blue-50 text-primary shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'}`}
    >
        <Icon size={18} className={`mr-3 ${active === id ? 'text-primary' : 'text-gray-400'}`} />
        {label}
    </button>
);

const Profile = () => {
    const { user, checkAuthStatus } = useAuth(); // checkAuthStatus to reload user data after update
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(false);

    // Data State
    const [documents, setDocuments] = useState([]);
    const [formData, setFormData] = useState({
        name: '', phone: '', address: '',
        institution: '', course: '', gpa: '',
        income: '', currency: 'USD'
    });

    // Password State
    const [passData, setPassData] = useState({ current: '', newPass: '', confirm: '' });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phoneNumber || '',
                address: user.address?.city || '', // Simplified for demo
                institution: user.academicProfile?.currentInstitution || '',
                course: user.academicProfile?.course || '',
                gpa: user.academicProfile?.gpa || '',
                income: user.financialProfile?.annualIncome || '',
                currency: user.financialProfile?.currency || 'USD'
            });
        }
        fetchDocuments();
    }, [user]);

    const fetchDocuments = async () => {
        try {
            const res = await api.get('/documents');
            setDocuments(res.data.data.documents);
        } catch (err) {
            console.error("Failed to fetch docs", err);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                name: formData.name,
                phoneNumber: formData.phone,
                // Nested updates need care. For Mongoose `findByIdAndUpdate` 
                // typically we'd send the full object or use dot notation if logic allowed.
                // Our basic controller replaces the object if key provided.
                academicProfile: {
                    ...user.academicProfile,
                    currentInstitution: formData.institution,
                    course: formData.course,
                    gpa: formData.gpa
                },
                financialProfile: {
                    annualIncome: formData.income,
                    currency: formData.currency
                },
                address: { city: formData.address } // Simplified
            };

            await api.patch('/users/update-me', payload);
            await checkAuthStatus(); // Reload global user context
            toast.success('Profile updated successfully');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    const handleUploadDoc = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const toastId = toast.loading("Uploading document...");
        try {
            const fd = new FormData();
            fd.append('file', file); // Field name must match multer 'file'
            // We usually need to specify 'name' or 'type' for the document model
            // But our generic upload route might just take the file name as name?
            // Let's check DocumentController.uploadDocument logic (it usually expects file info)
            // The controller uses req.file. 
            // We might need to send additional body fields if schema requires them (e.g. name, type)
            // Let's assume controller defaults or we add fields.
            // For now, let's send 'name' as filename
            fd.append('name', file.name);
            fd.append('type', 'General');

            await api.post('/documents', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            toast.update(toastId, { render: "Document uploaded!", type: "success", isLoading: false, autoClose: 2000 });
            fetchDocuments();
        } catch (err) {
            toast.update(toastId, { render: "Upload failed", type: "error", isLoading: false, autoClose: 2000 });
        }
    };

    const handleDeleteDoc = async (id) => {
        try {
            await api.delete(`/documents/${id}`);
            setDocuments(prev => prev.filter(d => d._id !== id));
            toast.success('Document deleted');
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passData.newPass !== passData.confirm) return toast.error("Passwords don't match");

        try {
            await api.patch('/users/update-password', {
                currentPassword: passData.current,
                newPassword: passData.newPass
            });
            toast.success('Password changed!');
            setPassData({ current: '', newPass: '', confirm: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed');
        }
    };

    if (!user) return <div className="p-10 text-center">Loading Profile...</div>;

    const completion = [
        user.name, user.email, user.phoneNumber,
        user.academicProfile?.gpa,
        documents.length > 0
    ].filter(Boolean).length / 5 * 100;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">

                {/* Sidebar */}
                <div className="w-full md:w-64 flex-shrink-0 space-y-6">
                    {/* User Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary font-bold text-2xl">
                            {user.name.charAt(0)}
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">{user.name}</h2>
                        <p className="text-sm text-gray-500 capitalize">{user.role}</p>

                        <div className="mt-4 text-left">
                            <div className="flex justify-between text-xs mb-1 text-gray-500">
                                <span>Profile Completion</span>
                                <span>{completion}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${completion}%` }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                        <TabButton active={activeTab} id="overview" label="Overview" icon={User} onClick={setActiveTab} />
                        <TabButton active={activeTab} id="academic" label="Academic & Personal" icon={BookOpen} onClick={setActiveTab} />
                        <TabButton active={activeTab} id="financial" label="Financial Info" icon={DollarSign} onClick={setActiveTab} />
                        <TabButton active={activeTab} id="documents" label="Document Vault" icon={FileText} onClick={setActiveTab} />
                        <TabButton active={activeTab} id="settings" label="Settings" icon={Lock} onClick={setActiveTab} />
                    </nav>
                </div>

                {/* Main Content */}
                <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-8 min-h-[600px]">
                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && (
                            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <h2 className="text-2xl font-bold mb-6 text-gray-900">Profile Overview</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                        <h3 className="font-semibold text-blue-900 mb-2">Personal Details</h3>
                                        <p className="text-sm text-blue-800">Email: {user.email}</p>
                                        <p className="text-sm text-blue-800">Phone: {user.phoneNumber || 'Not Set'}</p>
                                        <p className="text-sm text-blue-800">Location: {user.address?.city || 'Not Set'}</p>
                                    </div>
                                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                                        <h3 className="font-semibold text-purple-900 mb-2">Academic Status</h3>
                                        <p className="text-sm text-purple-800">Institution: {user.academicProfile?.currentInstitution || 'N/A'}</p>
                                        <p className="text-sm text-purple-800">Course: {user.academicProfile?.course || 'N/A'}</p>
                                        <p className="text-sm text-purple-800">GPA: {user.academicProfile?.gpa || 'N/A'}</p>
                                    </div>
                                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                                        <h3 className="font-semibold text-yellow-900 mb-2">Financial Info</h3>
                                        <p className="text-sm text-yellow-800">Income: ${user.financialProfile?.annualIncome || '0'}</p>
                                    </div>
                                    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                                        <h3 className="font-semibold text-green-900 mb-2">Documents</h3>
                                        <p className="text-sm text-green-800">{documents.length} files stored</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {(activeTab === 'academic' || activeTab === 'financial') && (
                            <motion.div key="forms" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <h2 className="text-2xl font-bold mb-6 text-gray-900">Edit Details</h2>
                                <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-lg">
                                    {activeTab === 'academic' && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-lg px-3 py-2 border" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                                <input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-lg px-3 py-2 border" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Current Institution</label>
                                                <input type="text" value={formData.institution} onChange={e => setFormData({ ...formData, institution: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-lg px-3 py-2 border" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Course</label>
                                                    <input type="text" value={formData.course} onChange={e => setFormData({ ...formData, course: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-lg px-3 py-2 border" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">GPA</label>
                                                    <input type="number" step="0.01" value={formData.gpa} onChange={e => setFormData({ ...formData, gpa: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-lg px-3 py-2 border" />
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {activeTab === 'financial' && (
                                        <>
                                            <div className="bg-yellow-50 p-4 rounded-lg mb-4 text-sm text-yellow-800">
                                                <AlertTriangle size={16} className="inline mr-2" />
                                                Provide accurate family income. This is used to check your eligibility for need-based scholarships.
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Annual Family Income</label>
                                                <div className="relative mt-1">
                                                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                                                    <input type="number" value={formData.income} onChange={e => setFormData({ ...formData, income: e.target.value })} className="block w-full border-gray-300 rounded-lg pl-8 pr-3 py-2 border" />
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    <button type="submit" disabled={loading} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center">
                                        {loading ? <Loader2 className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
                                        Save Changes
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        {activeTab === 'documents' && (
                            <motion.div key="docs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900">Document Vault</h2>
                                    <label className="cursor-pointer bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center shadow-sm">
                                        <Upload size={18} className="mr-2" /> Upload New
                                        <input type="file" className="hidden" onChange={handleUploadDoc} accept=".pdf,.jpg,.png" />
                                    </label>
                                </div>

                                {documents.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500">
                                        <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                                        <p>No documents stored yet.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {documents.map(doc => (
                                            <div key={doc._id} className="flex items-center p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition group relative">
                                                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg mr-4">
                                                    <FileText size={24} />
                                                </div>
                                                <div className="flex-1 overflow-hidden">
                                                    <p className="font-medium text-gray-900 truncate" title={doc.name}>{doc.name}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs text-gray-500 uppercase">{doc.type || 'file'}</span>
                                                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full flex items-center">
                                                            <Shield size={10} className="mr-1" /> Verified
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteDoc(doc._id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                                                    title="Delete"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'settings' && (
                            <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <h2 className="text-2xl font-bold mb-6 text-gray-900">Security Settings</h2>
                                <form onSubmit={handlePasswordChange} className="max-w-md space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Current Password</label>
                                        <input type="password" value={passData.current} onChange={e => setPassData({ ...passData, current: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-lg px-3 py-2 border" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">New Password</label>
                                        <input type="password" value={passData.newPass} onChange={e => setPassData({ ...passData, newPass: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-lg px-3 py-2 border" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                                        <input type="password" value={passData.confirm} onChange={e => setPassData({ ...passData, confirm: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-lg px-3 py-2 border" />
                                    </div>
                                    <button type="submit" className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition">Update Password</button>
                                </form>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Profile;

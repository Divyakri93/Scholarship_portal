import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Plus, Trash2, HelpCircle, Loader2 } from 'lucide-react';

const CreateScholarship = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        amount: '',
        deadline: '',
        slotsAvailable: '',
        // Eligibility
        minGPA: '',
        minAge: '',
        maxAge: '',
        maxIncome: '',
        allowedCourses: '',
        // Documents
        requiredDocuments: '' // To be comma separated string
    });

    // Derived state for tags/arrays handled in submit

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Transform Data
        const payload = {
            title: formData.title,
            description: formData.description,
            amount: Number(formData.amount),
            deadline: formData.deadline,
            slotsAvailable: Number(formData.slotsAvailable),

            eligibility: {
                minGPA: Number(formData.minGPA),
                minAge: Number(formData.minAge),
                maxAge: Number(formData.maxAge),
                maxIncome: Number(formData.maxIncome),
                allowedCourses: formData.allowedCourses.split(',').map(s => s.trim()).filter(Boolean)
            },

            requiredDocuments: formData.requiredDocuments.split(',').map(s => s.trim()).filter(Boolean),
            tags: [] // Optional
        };

        try {
            await api.post('/scholarships', payload);
            toast.success('Scholarship Created Successfully');
            navigate('/admin/dashboard');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to create scholarship');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gray-900 px-8 py-6 border-b border-gray-200">
                        <h2 className="text-2xl font-bold text-white">Post New Scholarship</h2>
                        <p className="text-gray-400 text-sm mt-1">Fill in the details to publish a new opportunity.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">

                        {/* Section 1: Basic Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Details</h3>
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Scholarship Title</label>
                                    <input required name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm px-3 py-2 border focus:ring-primary focus:border-primary" placeholder="e.g. Global Tech Excellence Award" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea required name="description" value={formData.description} onChange={handleChange} rows={4} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm px-3 py-2 border focus:ring-primary focus:border-primary" placeholder="Detailed description of the program..." />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Amount ($)</label>
                                        <input required type="number" name="amount" value={formData.amount} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm px-3 py-2 border focus:ring-primary focus:border-primary" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Deadline</label>
                                        <input required type="date" name="deadline" value={formData.deadline} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm px-3 py-2 border focus:ring-primary focus:border-primary" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Slots</label>
                                        <input type="number" name="slotsAvailable" value={formData.slotsAvailable} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm px-3 py-2 border focus:ring-primary focus:border-primary" placeholder="e.g. 10" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Eligibility */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Eligibility Criteria</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Minimum GPA</label>
                                    <input type="number" step="0.1" name="minGPA" value={formData.minGPA} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm px-3 py-2 border focus:ring-primary focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Max Annual Income ($)</label>
                                    <input type="number" name="maxIncome" value={formData.maxIncome} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm px-3 py-2 border focus:ring-primary focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Min Age</label>
                                    <input type="number" name="minAge" value={formData.minAge} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm px-3 py-2 border focus:ring-primary focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Max Age</label>
                                    <input type="number" name="maxAge" value={formData.maxAge} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm px-3 py-2 border focus:ring-primary focus:border-primary" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Target Courses (Comma separated)</label>
                                    <input type="text" name="allowedCourses" value={formData.allowedCourses} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm px-3 py-2 border focus:ring-primary focus:border-primary" placeholder="Computer Science, Engineering, Arts..." />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Documents */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Requirements</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Required Documents (Comma separated)</label>
                                <input type="text" name="requiredDocuments" value={formData.requiredDocuments} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm px-3 py-2 border focus:ring-primary focus:border-primary" placeholder="Transcript, Recommendation Letter, ID Proof..." />
                                <p className="text-xs text-gray-500 mt-1">Users will be asked to upload these specific files.</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-4 pt-6">
                            <button type="button" onClick={() => navigate('/admin/dashboard')} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                            <button type="submit" disabled={loading} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 shadow-md flex items-center">
                                {loading ? <Loader2 className="animate-spin mr-2" /> : <Plus size={18} className="mr-2" />}
                                Create Scholarship
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateScholarship;

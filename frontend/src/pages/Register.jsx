import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, User, BookOpen, Lock, AlertCircle, Loader2 } from 'lucide-react';

const Register = () => {
    const [step, setStep] = useState(1);
    const { register } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student',
        // Academic Details (Student)
        currentInstitution: '',
        course: '',
        gpa: '',
        // Organization Details (Provider)
        orgName: '',
        orgWebsite: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const nextStep = () => {
        if (step === 1) {
            if (!formData.name || !formData.email || !formData.role) {
                setError('Please fill in all basic fields');
                return;
            }
        }
        setError('');
        setStep(step + 1);
    };

    const prevStep = () => setStep(step - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        setLoading(true);

        // Prepare payload
        const payload = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role
        };

        if (formData.role === 'student') {
            payload.academicProfile = {
                currentInstitution: formData.currentInstitution,
                course: formData.course,
                gpa: formData.gpa ? parseFloat(formData.gpa) : undefined
            };
        } else if (formData.role === 'provider') {
            payload.organizationDetails = {
                name: formData.orgName,
                website: formData.orgWebsite
            };
        }

        try {
            await register(payload);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { title: 'Identity', icon: User },
        { title: 'Details', icon: BookOpen },
        { title: 'Security', icon: Lock }
    ];

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-xl w-full bg-white p-8 rounded-2xl shadow-xl"
            >
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 text-center">Create Account</h2>
                    {/* Progress Baar */}
                    <div className="flex justify-center mt-6">
                        <div className="flex items-center w-full max-w-xs justify-between">
                            {steps.map((s, i) => (
                                <div key={i} className="flex flex-col items-center relative z-10">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                                        {step > i + 1 ? <Check size={20} /> : <s.icon size={20} />}
                                    </div>
                                    <span className="text-xs mt-2 text-gray-500 font-medium">{s.title}</span>
                                </div>
                            ))}
                            {/* Connecting Line */}
                            <div className="absolute top-16 w-64 h-1 bg-gray-200 -z-0">
                                <div
                                    className="h-full bg-primary transition-all duration-300"
                                    style={{ width: `${((step - 1) / 2) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ x: 10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -10, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                        <input name="name" type="text" required value={formData.name} onChange={handleChange}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary px-3 py-2 border" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                        <input name="email" type="email" required value={formData.email} onChange={handleChange}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary px-3 py-2 border" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">I am a...</label>
                                        <select name="role" value={formData.role} onChange={handleChange}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary px-3 py-2 border bg-white">
                                            <option value="student">Student</option>
                                            <option value="provider">Scholarship Provider</option>
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ x: 10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -10, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="space-y-4">
                                    {formData.role === 'student' ? (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Institution Name</label>
                                                <input name="currentInstitution" type="text" value={formData.currentInstitution} onChange={handleChange}
                                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary px-3 py-2 border" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Course / Major</label>
                                                <input name="course" type="text" value={formData.course} onChange={handleChange}
                                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary px-3 py-2 border" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Current GPA</label>
                                                <input name="gpa" type="number" step="0.01" value={formData.gpa} onChange={handleChange}
                                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary px-3 py-2 border" />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Organization Name</label>
                                                <input name="orgName" type="text" value={formData.orgName} onChange={handleChange}
                                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary px-3 py-2 border" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Website URL</label>
                                                <input name="orgWebsite" type="url" value={formData.orgWebsite} onChange={handleChange}
                                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary px-3 py-2 border" />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ x: 10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -10, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Password</label>
                                        <input name="password" type="password" required value={formData.password} onChange={handleChange}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary px-3 py-2 border" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                                        <input name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary px-3 py-2 border" />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {error && (
                        <div className="flex items-center text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                            <AlertCircle size={16} className="mr-2" />
                            {error}
                        </div>
                    )}

                    <div className="flex justify-between pt-4">
                        {step > 1 ? (
                            <button type="button" onClick={prevStep} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Back</button>
                        ) : <div></div>}

                        {step < 3 ? (
                            <button type="button" onClick={nextStep} className="px-6 py-2 bg-primary text-white rounded-md hover:bg-blue-700">Next</button>
                        ) : (
                            <button type="submit" disabled={loading} className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center">
                                {loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                                Create Account
                            </button>
                        )}
                    </div>
                </form>
                <div className="text-center mt-6">
                    <span className="text-sm text-gray-600">Already have an account? </span>
                    <Link to="/login" className="font-medium text-primary hover:text-blue-500">
                        Sign in
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;

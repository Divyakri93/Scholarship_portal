import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, User, BookOpen, Lock, AlertCircle, Loader2 } from 'lucide-react';
import registerIllustration from '../assets/register_illustration.png';

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
        <div className="min-h-screen flex bg-gray-50">
            {/* Left Side - Visual & Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-indigo-900 items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-900 opacity-90"></div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent"></div>

                <div className="relative z-10 p-12 text-center text-white space-y-8 max-w-lg">
                    <motion.img
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        src={registerIllustration}
                        alt="Join the Community"
                        className="w-full max-w-md mx-auto drop-shadow-2xl rounded-lg"
                    />
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h2 className="text-4xl font-bold mb-4">Start Your Journey</h2>
                        <p className="text-indigo-200 text-lg">
                            Join thousands of students and providers in the world's most accessible scholarship ecosystem.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-12 lg:w-1/2">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-xl w-full bg-white p-8 rounded-2xl shadow-xl"
                >
                    <div className="mb-8 text-center">
                        <Link to="/" className="text-2xl font-bold text-indigo-600 tracking-tighter hover:opacity-80 transition block mb-4">
                            ScholarPortal
                        </Link>
                        <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>

                        {/* Progress Bar */}
                        <div className="flex justify-center mt-8">
                            <div className="flex items-center w-full max-w-xs justify-between relative">
                                {/* Connecting Line */}
                                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-0 transform -translate-y-1/2"></div>
                                <div
                                    className="absolute top-1/2 left-0 h-1 bg-indigo-600 transition-all duration-300 -z-0 transform -translate-y-1/2"
                                    style={{ width: `${((step - 1) / 2) * 100}%` }}
                                />

                                {steps.map((s, i) => (
                                    <div key={i} className="relative z-10 flex flex-col items-center group">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${step > i + 1 ? 'bg-green-500 border-green-500 text-white' : step === i + 1 ? 'bg-indigo-600 border-indigo-600 text-white scale-110 shadow-lg' : 'bg-white border-gray-300 text-gray-400'}`}>
                                            {step > i + 1 ? <Check size={18} /> : <s.icon size={18} />}
                                        </div>
                                        <span className={`text-xs mt-2 font-medium transition-colors ${step === i + 1 ? 'text-indigo-600' : 'text-gray-500'}`}>{s.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -20, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                            <input name="name" type="text" required value={formData.name} onChange={handleChange}
                                                className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-4 py-3 border transition-all" placeholder="John Doe" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                            <input name="email" type="email" required value={formData.email} onChange={handleChange}
                                                className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-4 py-3 border transition-all" placeholder="john@example.com" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">I am a...</label>
                                            <select name="role" value={formData.role} onChange={handleChange}
                                                className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-4 py-3 border bg-white transition-all">
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
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -20, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="space-y-5">
                                        {formData.role === 'student' ? (
                                            <>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Institution Name</label>
                                                    <input name="currentInstitution" type="text" value={formData.currentInstitution} onChange={handleChange}
                                                        className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-4 py-3 border transition-all" placeholder="University of Technology" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Course / Major</label>
                                                    <input name="course" type="text" value={formData.course} onChange={handleChange}
                                                        className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-4 py-3 border transition-all" placeholder="Computer Science" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Current GPA</label>
                                                    <input name="gpa" type="number" step="0.01" value={formData.gpa} onChange={handleChange}
                                                        className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-4 py-3 border transition-all" placeholder="3.5" />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Organization Name</label>
                                                    <input name="orgName" type="text" value={formData.orgName} onChange={handleChange}
                                                        className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-4 py-3 border transition-all" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Website URL</label>
                                                    <input name="orgWebsite" type="url" value={formData.orgWebsite} onChange={handleChange}
                                                        className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-4 py-3 border transition-all" placeholder="https://..." />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -20, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Password</label>
                                            <input name="password" type="password" required value={formData.password} onChange={handleChange}
                                                className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-4 py-3 border transition-all" placeholder="••••••••" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                                            <input name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange}
                                                className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-4 py-3 border transition-all" placeholder="••••••••" />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="flex items-center text-red-600 bg-red-50 p-4 rounded-lg text-sm border border-red-100"
                            >
                                <AlertCircle size={18} className="mr-2 flex-shrink-0" />
                                {error}
                            </motion.div>
                        )}

                        <div className="flex justify-between pt-6 border-t border-gray-100">
                            {step > 1 ? (
                                <button type="button" onClick={prevStep} className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors">Back</button>
                            ) : <div></div>}

                            {step < 3 ? (
                                <button type="button" onClick={nextStep} className="px-8 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">Next</button>
                            ) : (
                                <button type="submit" disabled={loading} className="px-8 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-md hover:shadow-lg flex items-center transition-all transform hover:-translate-y-0.5">
                                    {loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                                    Create Account
                                </button>
                            )}
                        </div>
                    </form>
                    <div className="text-center mt-8">
                        <span className="text-sm text-gray-600">Already have an account? </span>
                        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Sign in
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;

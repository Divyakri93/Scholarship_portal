import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import loginIllustration from '../assets/login_illustration.png';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(''); // Clear error on change
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!formData.email || !formData.password) {
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }

        try {
            const success = await login(formData.email, formData.password);
            if (success) {
                navigate('/dashboard');
            } else {
                setError('Invalid email or password');
            }
        } catch (err) {
            setError('An error occurred during login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Left Side - Visual & Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-primary items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-900 opacity-90"></div>

                {/* Decorative Circles */}
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

                <div className="relative z-10 p-12 text-center text-white space-y-8 max-w-lg">
                    <motion.img
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        src={loginIllustration}
                        alt="Secure Login"
                        className="w-full max-w-md mx-auto drop-shadow-2xl"
                    />
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <h2 className="text-4xl font-bold mb-4">Welcome Back!</h2>
                        <p className="text-blue-100 text-lg">
                            Access your portal to track applications, manage documents, and find new opportunities tailored for you.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-12 lg:w-1/2">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl"
                >
                    <div className="text-center">
                        <Link to="/" className="text-2xl font-bold text-primary tracking-tighter hover:opacity-80 transition">
                            ScholarPortal
                        </Link>
                        <h2 className="mt-6 text-3xl font-bold text-gray-900">Sign in to your account</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Or <Link to="/register" className="font-medium text-primary hover:text-blue-500">start your journey today</Link>
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm transition-all"
                                        placeholder="you@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm transition-all"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 cursor-pointer">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-medium text-primary hover:text-blue-500">
                                    Forgot password?
                                </a>
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="rounded-md bg-red-50 p-4 border border-red-100"
                            >
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">{error}</h3>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin h-5 w-5" />
                            ) : (
                                'Sign in'
                            )}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;

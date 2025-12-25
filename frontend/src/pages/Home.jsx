import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import heroImage from '../assets/hero_image.png';
import { ArrowRight, BookOpen, UserCheck, ShieldCheck } from 'lucide-react';

const Home = () => {
    return (
        <div className="min-h-screen flex flex-col">
            {/* Hero Section */}
            <div className="flex-grow flex items-center justify-center pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-24 text-center lg:text-left">
                    {/* Text Content */}
                    <div className="flex-1 space-y-8 z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-tight tracking-tight">
                                Unlock Your Future with <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                                    Scholarships
                                </span>
                            </h1>
                            <p className="mt-6 text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
                                The most advanced centralized platform bridging the gap between ambitious students and life-changing financial aid opportunities.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                        >
                            <Link to="/register" className="btn btn-primary text-lg px-8 py-3.5 group">
                                Get Started
                                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                            </Link>
                            <Link to="/login" className="btn btn-secondary text-lg px-8 py-3.5">
                                Log In
                            </Link>
                        </motion.div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 text-left">
                            <FeatureItem icon={BookOpen} title="Wide Access" desc="Thousands of verified scholarships." />
                            <FeatureItem icon={UserCheck} title="Smart Match" desc="Tailored to your academic profile." />
                            <FeatureItem icon={ShieldCheck} title="Secure" desc="Your data is encrypted and safe." />
                        </div>
                    </div>

                    {/* Hero Image */}
                    <motion.div
                        className="flex-1 relative"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
                        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
                        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

                        <img
                            src={heroImage}
                            alt="Students celebrating"
                            className="relative z-10 w-full hover:scale-105 transition-transform duration-500 drop-shadow-2xl"
                        />
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

const FeatureItem = ({ icon: Icon, title, desc }) => (
    <div className="flex items-start bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="bg-blue-50 p-2 rounded-lg text-primary mr-3">
            <Icon size={24} />
        </div>
        <div>
            <h3 className="font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">{desc}</p>
        </div>
    </div>
);

export default Home;

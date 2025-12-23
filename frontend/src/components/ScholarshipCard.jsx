import { Calendar, DollarSign, BookOpen, Clock, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const ScholarshipCard = ({ scholarship, viewMode }) => {
    const isExpired = new Date(scholarship.deadline) < new Date();

    const CardWrapper = viewMode === 'list' ? 'flex flex-row gap-6' : 'flex flex-col h-full';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 ${CardWrapper}`}
        >
            {/* Decorative Header/Image Placeholder */}
            <div className={`${viewMode === 'list' ? 'w-48 h-full min-h-[180px]' : 'h-32'} bg-gradient-to-r from-primary-500 to-primary-700 relative overflow-hidden shrink-0`}>
                <div className="absolute inset-0 bg-black/5"></div>
                <div className="absolute bottom-4 left-4 text-white">
                    <span className="text-xs font-semibold bg-white/20 backdrop-blur-md px-2 py-1 rounded-md border border-white/20 shadow-sm">
                        {scholarship.provider?.organizationDetails?.name || 'Authorized Provider'}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{scholarship.title}</h3>
                    {isExpired && (
                        <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ml-2">
                            Expired
                        </span>
                    )}
                </div>

                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{scholarship.description}</p>

                {/* Tags/Details */}
                <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                        <DollarSign size={16} className="text-green-600 mr-2" />
                        <span className="font-semibold text-gray-900">${scholarship.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                        <Calendar size={16} className="text-primary mr-2" />
                        <span>Deadline: {format(new Date(scholarship.deadline), 'MMM dd, yyyy')}</span>
                    </div>
                    {scholarship.eligibility?.allowedCourses?.length > 0 && (
                        <div className="flex items-center text-sm text-gray-600">
                            <BookOpen size={16} className="text-orange-500 mr-2" />
                            <span className="truncate max-w-[200px]">{scholarship.eligibility.allowedCourses.join(', ')}</span>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="text-xs text-gray-400">
                        Posted {format(new Date(scholarship.createdAt), 'MMM dd')}
                    </div>
                    <Link
                        to={`/scholarships/${scholarship._id}`}
                        className={`flex items-center gap-1 text-sm font-medium ${isExpired ? 'text-gray-400 cursor-not-allowed' : 'text-primary-600 hover:text-primary-700'}`}
                        onClick={(e) => isExpired && e.preventDefault()}
                    >
                        {isExpired ? 'Closed' : 'View Details'} <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

export const ScholarshipSkeleton = ({ viewMode }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse ${viewMode === 'list' ? 'flex flex-row h-48' : 'flex flex-col h-[380px]'}`}>
        <div className={`${viewMode === 'list' ? 'w-48 h-full' : 'h-32'} bg-gray-200`}></div>
        <div className="p-5 flex-1 space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="pt-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
        </div>
    </div>
);

export default ScholarshipCard;

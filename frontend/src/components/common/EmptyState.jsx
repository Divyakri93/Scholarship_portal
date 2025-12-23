import React from 'react';
import { FileQuestion } from 'lucide-react';
import { motion } from 'framer-motion';

const EmptyState = ({
    icon: Icon = FileQuestion,
    title = "No data found",
    description = "There is nothing to display here at the moment.",
    action
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 px-4 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200"
        >
            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                <Icon size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-heading font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-500 max-w-sm mb-6">{description}</p>

            {action && (
                <div>{action}</div>
            )}
        </motion.div>
    );
};

export default EmptyState;

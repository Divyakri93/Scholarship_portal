import { useState, useEffect } from 'react';
import api from '../services/api';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

const EligibilityChecker = ({ scholarshipId }) => {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        check();
    }, [scholarshipId]);

    const check = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/scholarships/${scholarshipId}/eligibility`);
            setResult(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-center h-48">
            <RefreshCw className="animate-spin text-primary" size={24} />
            <span className="ml-2 text-gray-500">Checking eligibility...</span>
        </div>
    );

    if (!result) return null;

    const { isEligible, score, criteria } = result;
    const color = isEligible ? 'green' : score > 50 ? 'yellow' : 'red';

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className={`p-4 border-b border-gray-100 flex justify-between items-center bg-${color}-50`}>
                <h3 className="font-bold text-gray-900">Eligibility Check</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-bold bg-${color}-100 text-${color}-700`}>
                    {score}% Match
                </span>
            </div>

            <div className="p-6">
                <div className="mb-6 text-center">
                    {isEligible ? (
                        <div className="flex flex-col items-center text-green-600">
                            <CheckCircle size={48} className="mb-2" />
                            <p className="font-bold text-lg">You are Eligible!</p>
                            <p className="text-sm text-gray-500">You meet all the requirements for this scholarship.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-gray-700">
                            {score > 50 ? <AlertTriangle size={48} className="mb-2 text-yellow-500" /> : <XCircle size={48} className="mb-2 text-red-500" />}
                            <p className="font-bold text-lg">{score > 50 ? 'Almost there' : 'Not Eligible'}</p>
                            <p className="text-sm text-gray-500">You meet some requirements, but not all.</p>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    {criteria?.map((item, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-sm transition">
                            <div className={`mt-0.5 ${item.met ? 'text-green-500' : 'text-red-500'}`}>
                                {item.met ? <CheckCircle size={18} /> : <XCircle size={18} />}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                                <p className="text-xs text-gray-500 my-0.5">{item.message}</p>
                                {!item.met && (
                                    <div className="flex gap-4 text-xs mt-1">
                                        <span className="text-gray-400">Required: <span className="text-gray-600">{item.required}</span></span>
                                        <span className={`font-medium ${item.met ? 'text-green-600' : 'text-red-600'}`}>You: {item.value}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {!isEligible && (
                    <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                        <a href="/profile" className="text-sm text-primary hover:underline font-medium">
                            Update your Profile
                        </a>
                        <span className="text-gray-400 mx-2">•</span>
                        <span className="text-xs text-gray-400">Eligibility is based on your profile data.</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EligibilityChecker;

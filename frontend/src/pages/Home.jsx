const Home = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="max-w-4xl text-center space-y-6">
                <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">
                    Find Your Perfect <span className="text-primary">Scholarship</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    The most advanced platform for students to find financial aid and for providers to manage applications effortlessly.
                </p>
                <div className="flex gap-4 justify-center mt-8">
                    <a href="/login" className="px-8 py-3 bg-primary text-white rounded-full font-semibold shadow-lg hover:bg-blue-700 transition">
                        Get Started
                    </a>
                    <a href="/scholarships" className="px-8 py-3 bg-white text-primary border border-gray-200 rounded-full font-semibold shadow hover:bg-gray-50 transition">
                        Browse Scholarships
                    </a>
                </div>
            </div>
        </div>
    );
};
export default Home;

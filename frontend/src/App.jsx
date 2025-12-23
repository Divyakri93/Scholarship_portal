import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { AnimatePresence } from 'framer-motion';
import ErrorBoundary from './components/common/ErrorBoundary';
import Layout from './components/Layout';
import { LoadingSpinner } from './components/common/Loading';

// Lazy Loaded Pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
import Dashboard from './pages/Dashboard';
// const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
import ScholarshipList from './pages/ScholarshipList';
// const ScholarshipList = lazy(() => import('./pages/ScholarshipList'));
import ScholarshipDetail from './pages/ScholarshipDetail';
// const ScholarshipDetail = lazy(() => import('./pages/ScholarshipDetail'));
const ApplicationForm = lazy(() => import('./pages/ApplicationForm'));
const ApplicationList = lazy(() => import('./pages/ApplicationList'));
const ApplicationDetail = lazy(() => import('./pages/ApplicationDetail'));
const CreateScholarship = lazy(() => import('./pages/CreateScholarship'));
const AdminApplicationReview = lazy(() => import('./pages/AdminApplicationReview'));
const Profile = lazy(() => import('./pages/Profile'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Fallback Loading Component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <LoadingSpinner size={40} className="text-primary-600" />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/scholarships" element={<ScholarshipList />} />
              <Route path="/scholarships/:id" element={<ScholarshipDetail />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Protected Routes (Student & Provider) */}
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/dashboard" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
                  <Route path="/profile" element={<ErrorBoundary><Profile /></ErrorBoundary>} />

                  {/* Application Form - Student Only */}
                  <Route path="/application/apply/:scholarshipId" element={<ErrorBoundary><ApplicationForm /></ErrorBoundary>} />
                  <Route path="/applications" element={<ErrorBoundary><ApplicationList /></ErrorBoundary>} />
                  <Route path="/applications/:id" element={<ErrorBoundary><ApplicationDetail /></ErrorBoundary>} />
                </Route>
              </Route>

              {/* Admin Routes */}
              <Route element={<ProtectedRoute role="admin" />}>
                <Route element={<Layout />}>
                  <Route path="/admin/dashboard" element={<ErrorBoundary><AdminDashboard /></ErrorBoundary>} />
                  <Route path="/admin/scholarships/new" element={<ErrorBoundary><CreateScholarship /></ErrorBoundary>} />
                  <Route path="/admin/applications/:id" element={<ErrorBoundary><AdminApplicationReview /></ErrorBoundary>} />
                </Route>
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <ToastContainer position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

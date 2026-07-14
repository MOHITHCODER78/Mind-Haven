import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import StudentRoute from './components/auth/StudentRoute';
import AdminRoute from './components/admin/AdminRoute';
import PageLoader from './components/shared/PageLoader';
import NotFoundPage from './pages/NotFoundPage';
import ErrorBoundary from './components/shared/ErrorBoundary';
import { AnimatePresence } from 'framer-motion';

const HomePage = lazy(() => import('./pages/HomePage'));
const StudentDashboardPage = lazy(() => import('./pages/StudentDashboardPage'));
const ResourcesPage = lazy(() => import('./pages/ResourcesPage'));
const ResourceArticlePage = lazy(() => import('./pages/ResourceArticlePage'));
const FeelingsWallPage = lazy(() => import('./pages/FeelingsWallPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const SupportLoginPage = lazy(() => import('./pages/SupportLoginPage'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage'));
const AdminResourcesPage = lazy(() => import('./pages/AdminResourcesPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const AiAssistantPage = lazy(() => import('./pages/AiAssistantPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage'));
const MoodTrackerPage = lazy(() => import('./pages/MoodTrackerPage'));

function App() {
  return (
    <ErrorBoundary>
      <AnimatePresence mode="wait">
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<PageLoader><HomePage /></PageLoader>} />
            <Route path="/resources" element={<PageLoader><ResourcesPage /></PageLoader>} />
            <Route path="/resources/:id" element={<PageLoader><ResourceArticlePage /></PageLoader>} />
            <Route path="/wall" element={<PageLoader><FeelingsWallPage /></PageLoader>} />
            <Route path="/login" element={<PageLoader><LoginPage /></PageLoader>} />
            <Route path="/register" element={<PageLoader><RegisterPage /></PageLoader>} />
            <Route path="/support/login" element={<PageLoader><SupportLoginPage /></PageLoader>} />
            <Route path="/admin/login" element={<PageLoader><AdminLoginPage /></PageLoader>} />
            <Route element={<StudentRoute />}>
              <Route path="/dashboard" element={<PageLoader><StudentDashboardPage /></PageLoader>} />
              <Route path="/mood-tracker" element={<PageLoader><MoodTrackerPage /></PageLoader>} />
              <Route path="/assistant" element={<PageLoader><AiAssistantPage /></PageLoader>} />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route path="/chat" element={<PageLoader><ChatPage /></PageLoader>} />
            </Route>
            <Route element={<AdminRoute />}>
              <Route path="/admin/dashboard" element={<PageLoader><AdminDashboardPage /></PageLoader>} />
              <Route path="/admin/users" element={<PageLoader><AdminUsersPage /></PageLoader>} />
              <Route path="/admin/resources" element={<PageLoader><AdminResourcesPage /></PageLoader>} />
            </Route>
            <Route path="/privacy-policy" element={<PageLoader><PrivacyPolicyPage /></PageLoader>} />
            <Route path="/terms" element={<PageLoader><TermsOfServicePage /></PageLoader>} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </ErrorBoundary>
  );
}

export default App;
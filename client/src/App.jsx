import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import StudentRoute from './components/auth/StudentRoute';
import AdminRoute from './components/admin/AdminRoute';
import HomePage from './pages/HomePage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import ResourcesPage from './pages/ResourcesPage';
import ResourceArticlePage from './pages/ResourceArticlePage';
import FeelingsWallPage from './pages/FeelingsWallPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SupportLoginPage from './pages/SupportLoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminResourcesPage from './pages/AdminResourcesPage';
import ChatPage from './pages/ChatPage';
import AiAssistantPage from './pages/AiAssistantPage';
import { AnimatePresence } from 'framer-motion';
import MoodTrackerPage from './pages/MoodTrackerPage';
import PageLoader from './components/shared/PageLoader';

function App() {
  return (
    <AnimatePresence mode="wait">
      <PageLoader key="loader" />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/resources/:id" element={<ResourceArticlePage />} />
          <Route path="/wall" element={<FeelingsWallPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/support/login" element={<SupportLoginPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route element={<StudentRoute />}>
            <Route path="/dashboard" element={<StudentDashboardPage />} />
            <Route path="/mood-tracker" element={<MoodTrackerPage />} />
            <Route path="/assistant" element={<AiAssistantPage />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/chat" element={<ChatPage />} />
          </Route>
          <Route element={<AdminRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/resources" element={<AdminResourcesPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default App;

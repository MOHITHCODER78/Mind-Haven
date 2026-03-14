import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../../context/useAuth';

function StudentRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="auth-shell"><div className="auth-card"><p>Loading your student workspace...</p></div></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (user.role !== 'student') {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/chat'} replace />;
  }

  return <Outlet />;
}

export default StudentRoute;

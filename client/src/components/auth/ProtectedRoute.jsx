import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../../context/useAuth';

function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="auth-shell"><div className="auth-card"><p>Loading your workspace...</p></div></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;

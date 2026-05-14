import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'vendor') return <Navigate to="/vendor" replace />;
    if (user.role === 'organizer') return <Navigate to="/organizer" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

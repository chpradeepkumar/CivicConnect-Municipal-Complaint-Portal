import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { PageLoader } from '../components/Spinner.jsx';
import { dashboardHome } from '../utils/roles.js';

export function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (user) return <Navigate to={dashboardHome(user.role)} replace />;
  return children;
}

export default PublicOnlyRoute;

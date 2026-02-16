import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const styles = {
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    mt: 4,
  },
};

export default function ProtectedRoute({ allowedRoles }: { allowedRoles?: string[] }) {
  const { user, isAuthenticated, loading } = useAuth(); // Assume 'loading' is added to AuthContext
  const location = useLocation();

  if (loading) {
    return (
      <Box sx={styles.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  // 1. Check if user is logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Check Role (Optional RBAC)
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />; // Create this page later
  }

  return <Outlet />;
}
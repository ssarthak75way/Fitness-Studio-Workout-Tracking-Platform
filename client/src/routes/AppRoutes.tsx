import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

// Lazy load components
const LoginPage = lazy(() => import('../features/auth/LoginPage'));
const DashboardPage = lazy(() => import('../features/dashboard/DashboardPage'));
const SchedulePage = lazy(() => import('../features/schedule/SchedulePage'));
const BookingsPage = lazy(() => import('../features/bookings/BookingsPage'));
const WorkoutsPage = lazy(() => import('../features/workouts/WorkoutsPage'));
const ProgressPage = lazy(() => import('../features/progress/ProgressPage'));
const MembershipPage = lazy(() => import('../features/membership/MembershipPage'));
const SettingsPage = lazy(() => import('../features/settings/SettingsPage'));
const CheckInPage = lazy(() => import('../features/bookings/CheckInPage'));
const WorkoutTemplatesPage = lazy(() => import('../features/workouts/WorkoutTemplatesPage'));
const UserManagementPage = lazy(() => import('../features/admin/UserManagementPage'));
const ProtectedLayout = lazy(() => import('../components/ProtectedLayout'));
const PublicLayout = lazy(() => import('../components/PublicLayout'));
const InstructorProfilePage = lazy(() => import('../features/instructors/InstructorProfilePage'));

function ProtectedRoute({
  children,
  allowedRoles
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <ProtectedLayout>{children}</ProtectedLayout>;
}

function AppContent() {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      }
    >
      <Routes>
        <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/schedule"
          element={
            <ProtectedRoute>
              <SchedulePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <BookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workouts"
          element={
            <ProtectedRoute>
              <WorkoutsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workouts/templates"
          element={
            <ProtectedRoute>
              <WorkoutTemplatesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/progress"
          element={
            <ProtectedRoute>
              <ProgressPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/membership"
          element={
            <ProtectedRoute>
              <MembershipPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/check-in"
          element={
            <ProtectedRoute>
              <CheckInPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructors/:id"
          element={
            <ProtectedRoute>
              <InstructorProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['STUDIO_ADMIN']}>
              <UserManagementPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
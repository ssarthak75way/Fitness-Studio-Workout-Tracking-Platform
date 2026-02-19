import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';
import { Suspense, lazy } from 'react';

// Layouts
const ProtectedLayout = lazy(() => import('../components/ProtectedLayout'));
const PublicLayout = lazy(() => import('../components/PublicLayout'));

const styles = {
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
};

// Loading component for the router
const PageLoader = () => (
  <Box sx={styles.loadingContainer}>
    <CircularProgress />
  </Box>
);

function ProtectedRoute({ allowedRoles }: { allowedRoles?: string[] }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <PageLoader />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <ProtectedLayout>
        <Outlet />
      </ProtectedLayout>
    </Suspense>
  );
}

const router = createBrowserRouter([
  {
    element: (
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    ),
    children: [
      {
        element: (
          <Suspense fallback={<PageLoader />}>
            <PublicLayout>
              <Outlet />
            </PublicLayout>
          </Suspense>
        ),
        children: [
          {
            index: true,
            lazy: async () => ({ Component: (await import('../features/landing/LandingPage')).default }),
          },
          {
            path: 'login',
            lazy: async () => ({ Component: (await import('../features/auth/LoginPage')).default }),
          },
          {
            path: 'about',
            lazy: async () => ({ Component: (await import('../features/info/AboutPage')).default }),
          },
          {
            path: 'contact',
            lazy: async () => ({ Component: (await import('../features/info/ContactPage')).default }),
          },
          {
            path: 'privacy',
            lazy: async () => ({ Component: (await import('../features/info/PrivacyPage')).default }),
          },
          {
            path: 'terms',
            lazy: async () => ({ Component: (await import('../features/info/TermsPage')).default }),
          },
          {
            path: '*',
            lazy: async () => ({ Component: (await import('../components/NotFoundPage')).default }),
          },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'dashboard',
            lazy: async () => ({ Component: (await import('../features/dashboard/DashboardPage')).default }),
          },
          {
            path: 'schedule',
            lazy: async () => ({ Component: (await import('../features/schedule/SchedulePage')).default }),
          },
          {
            path: 'bookings',
            lazy: async () => ({ Component: (await import('../features/bookings/BookingsPage')).default }),
          },
          {
            path: 'workouts',
            lazy: async () => ({ Component: (await import('../features/workouts/WorkoutsPage')).default }),
          },
          {
            path: 'progress',
            lazy: async () => ({ Component: (await import('../features/progress/ProgressPage')).default }),
          },
          {
            path: 'membership',
            lazy: async () => ({ Component: (await import('../features/membership/MembershipPage')).default }),
          },
          {
            path: 'settings',
            lazy: async () => ({ Component: (await import('../features/settings/SettingsPage')).default }),
          },
          {
            path: 'profile',
            lazy: async () => ({ Component: (await import('../features/profile/ProfilePage')).default }),
          },
          {
            path: 'instructors/:id',
            lazy: async () => ({ Component: (await import('../features/instructors/InstructorProfilePage')).default }),
          },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={['STUDIO_ADMIN', 'MEMBER', 'INSTRUCTOR']} />,
        children: [
          {
            path: 'workouts/templates',
            lazy: async () => ({ Component: (await import('../features/workouts/WorkoutTemplatesPage')).default }),
          },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={['STUDIO_ADMIN', 'INSTRUCTOR']} />,
        children: [
          {
            path: 'check-in',
            lazy: async () => ({ Component: (await import('../features/bookings/CheckInPage')).default }),
          },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={['STUDIO_ADMIN']} />,
        children: [
          {
            path: 'admin/users',
            lazy: async () => ({ Component: (await import('../features/admin/UserManagementPage')).default }),
          },
        ],
      },
    ],
  },
]);

export function AppRoutes() {
  return <RouterProvider router={router} />;
}
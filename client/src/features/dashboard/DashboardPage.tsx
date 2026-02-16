import { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, useTheme, alpha, Skeleton } from '@mui/material';
import { motion, type Variants } from 'framer-motion';
import { dashboardService } from '../../services/index';
import { useAuth } from '../../context/AuthContext';
import {
  TrendingUp as TrendingUpIcon,
  Event as EventIcon,
  History as HistoryIcon,
  People as PeopleIcon,
  EmojiEvents as StreakIcon
} from '@mui/icons-material';
import type { DashboardStats } from '../../types';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100
    }
  }
};

const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: any, color: string }) => (
  <motion.div variants={itemVariants} style={{ height: '100%' }}>
    <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
      <Box sx={{
        position: 'absolute',
        top: -10,
        right: -10,
        opacity: 0.1,
        transform: 'rotate(-15deg)'
      }}>
        <Icon sx={{ fontSize: 100, color: color, opacity: 0.5 }} />
      </Box>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Box sx={{
            p: 1,
            borderRadius: 2,
            bgcolor: alpha(color, 0.1),
            color: color,
            mr: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon fontSize="small" />
          </Box>
          <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h3" fontWeight={800}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  </motion.div>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const theme = useTheme();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await dashboardService.getDashboardStats();
        setStats(response.data.stats);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Skeleton variant="text" width="40%" height={60} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="30%" height={30} sx={{ mb: 4 }} />
        <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }} gap={3}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rectangular" height={140} sx={{ borderRadius: 3 }} />
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible" sx={{ p: { xs: 2, md: 4 } }}>
      <Box mb={6}>
        <Typography variant="h2" gutterBottom sx={{
          background: `linear-gradient(45deg, ${theme.palette.mode === 'dark' ? '#fff' : theme.palette.text.primary} 30%, ${theme.palette.primary.main} 90%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 800
        }}>
          Howdy, {user?.fullName?.split(' ')[0]}!
        </Typography>
        <Typography variant="h6" color="text.secondary" fontWeight={400}>
          {user?.role === 'MEMBER' && "It's a great day to crush your goals. Let's get moving!"}
          {user?.role === 'INSTRUCTOR' && "Your sessions today are looking great. Lead the way!"}
          {user?.role === 'STUDIO_ADMIN' && "The studio is buzzing. Here's your high-level overview."}
        </Typography>
      </Box>

      <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }} gap={3}>
        {user?.role === 'MEMBER' && (
          <>
            <StatCard
              title="Upcoming Bookings"
              value={stats?.upcomingBookings?.length || 0}
              icon={EventIcon}
              color={theme.palette.primary.main}
            />
            <StatCard
              title="Total Workouts"
              value={stats?.totalWorkouts || 0}
              icon={HistoryIcon}
              color={theme.palette.secondary.main}
            />
            <Box sx={{ gridColumn: { md: 'span 2' } }}>
              <StatCard
                title="Workout Streak"
                value={`${stats?.workoutStreak || 0} Days`}
                icon={StreakIcon}
                color="#facc15"
              />
            </Box>
          </>
        )}

        {user?.role === 'INSTRUCTOR' && (
          <>
            <StatCard
              title="Today's Classes"
              value={stats?.todaysClasses?.length || 0}
              icon={EventIcon}
              color={theme.palette.primary.main}
            />
            <StatCard
              title="Total Classes"
              value={stats?.totalClasses || 0}
              icon={HistoryIcon}
              color={theme.palette.secondary.main}
            />
            <Box sx={{ gridColumn: { md: 'span 2' } }}>
              <StatCard
                title="Average Rating"
                value={stats?.averageRating || 'N/A'}
                icon={TrendingUpIcon}
                color="#4ade80"
              />
            </Box>
          </>
        )}

        {user?.role === 'STUDIO_ADMIN' && (
          <>
            <StatCard
              title="Total Users"
              value={stats?.totalUsers || 0}
              icon={PeopleIcon}
              color={theme.palette.primary.main}
            />
            <StatCard
              title="Total Members"
              value={stats?.totalMembers || 0}
              icon={PeopleIcon}
              color={theme.palette.secondary.main}
            />
            <StatCard
              title="Total Instructors"
              value={stats?.totalInstructors || 0}
              icon={PeopleIcon}
              color="#facc15"
            />
            <StatCard
              title="Total Bookings"
              value={stats?.totalBookings || 0}
              icon={EventIcon}
              color="#4ade80"
            />
          </>
        )}
      </Box>
    </Box>
  );
}
import { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, useTheme, alpha, Skeleton, Button } from '@mui/material';
import { motion, type Variants } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../../services/index';
import { useAuth } from '../../context/AuthContext';
import {
  TrendingUp as TrendingUpIcon,
  Event as EventIcon,
  History as HistoryIcon,
  People as PeopleIcon,
  EmojiEvents as StreakIcon,
  ArrowForward as ArrowForwardIcon,
  AccountCircle as ProfileIcon,
  Settings as SettingsIcon,
  CalendarMonth as CalendarIcon
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

const styles = {
  statCard: {
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  statIconBackground: (color: string) => ({
    position: 'absolute',
    top: -10,
    right: -10,
    opacity: 0.1,
    transform: 'rotate(-15deg)',
    '& .MuiSvgIcon-root': {
      fontSize: 100,
      color: color,
      opacity: 0.5,
    },
  }),
  iconWrapper: (color: string) => ({
    p: 1,
    borderRadius: 2,
    bgcolor: alpha(color, 0.1),
    color: color,
    mr: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  quickActionCard: (color: string) => ({
    height: '100%',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    '&:hover': {
      transform: 'translateY(-4px)',
      bgcolor: alpha(color, 0.05),
    },
  }),
  quickActionContent: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    p: 3,
  },
  actionIconWrapper: (color: string) => ({
    p: 1.5,
    borderRadius: '50%',
    bgcolor: alpha(color, 0.1),
    color: color,
    display: 'flex',
  }),
  loadingContainer: {
    p: 4,
  },
  pageContainer: {
    p: { xs: 2, md: 4 },
  },
  headerTitle: (theme: any) => ({
    background: `linear-gradient(45deg, ${theme.palette.mode === 'dark' ? '#fff' : theme.palette.text.primary} 30%, ${theme.palette.primary.main} 90%)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: 800,
  }),
  upcomingItem: (theme: any) => ({
    mb: 2,
    p: 2,
    borderRadius: 2,
    bgcolor: alpha(theme.palette.primary.main, 0.05),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  recentWorkoutItem: (theme: any) => ({
    mb: 2,
    p: 2,
    borderRadius: 2,
    bgcolor: alpha(theme.palette.secondary.main, 0.05),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
};

const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: any, color: string }) => (
  <motion.div variants={itemVariants} style={{ height: '100%' }}>
    <Card sx={styles.statCard}>
      <Box sx={styles.statIconBackground(color)}>
        <Icon />
      </Box>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Box sx={styles.iconWrapper(color)}>
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

const QuickActionCard = ({ title, description, icon: Icon, onClick, color }: { title: string, description: string, icon: any, onClick: () => void, color: string }) => (
  <motion.div variants={itemVariants}>
    <Card sx={styles.quickActionCard(color)} onClick={onClick}>
      <CardContent sx={styles.quickActionContent}>
        <Box sx={styles.actionIconWrapper(color)}>
          <Icon />
        </Box>
        <Box flex={1}>
          <Typography variant="h6" fontWeight={700}>{title}</Typography>
          <Typography variant="body2" color="text.secondary">{description}</Typography>
        </Box>
        <ArrowForwardIcon color="action" />
      </CardContent>
    </Card>
  </motion.div>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
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
      <Box sx={styles.loadingContainer}>
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
    <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible" sx={styles.pageContainer}>
      <Box mb={6} display="flex" justifyContent="space-between" alignItems="flex-end" flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h2" gutterBottom sx={styles.headerTitle(theme)}>
            Howdy, {user?.fullName?.split(' ')[0]}!
          </Typography>
          <Typography variant="h6" color="text.secondary" fontWeight={400}>
            {user?.role === 'MEMBER' && "It's a great day to crush your goals. Let's get moving!"}
            {user?.role === 'INSTRUCTOR' && "Your sessions today are looking great. Lead the way!"}
            {user?.role === 'STUDIO_ADMIN' && "The studio is buzzing. Here's your high-level overview."}
          </Typography>
        </Box>
        <Box>
          <Button
            variant="outlined"
            startIcon={<ProfileIcon />}
            onClick={() => navigate('/profile')}
            sx={{ borderRadius: 2 }}
          >
            View Profile
          </Button>
        </Box>
      </Box>

      {/* Stats Grid */}
      <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }} gap={3} mb={6}>
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
              title="Instructors"
              value={stats?.totalInstructors || 0}
              icon={PeopleIcon}
              color="#facc15"
            />
            <StatCard
              title="Bookings"
              value={stats?.totalBookings || 0}
              icon={EventIcon}
              color="#4ade80"
            />
          </>
        )}
      </Box>

      {/* Detailed Lists */}
      <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: 'repeat(2, 1fr)' }} gap={4} mb={6}>
        {/* MEMBER: Upcoming Schedule & Recent Workouts */}
        {user?.role === 'MEMBER' && (
          <>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} mb={2}>Your Schedule</Typography>
                {stats?.upcomingBookings && stats.upcomingBookings.length > 0 ? (
                  stats.upcomingBookings.map((booking: any) => (
                    <Box key={booking._id} sx={(theme: any) => ({
                      mb: 2,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    })}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700}>{booking?.classSession?.title || "NA"}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(booking?.classSession?.startTime).toLocaleDateString()} @ {new Date(booking?.classSession?.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>
                      <Button size="small" variant="outlined" color="primary" onClick={() => navigate('/schedule')}>View</Button>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">No upcoming classes. Book one now!</Typography>
                )}
              </CardContent>
            </Card>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} mb={2}>Recent Workouts</Typography>
                {stats?.recentWorkouts && stats.recentWorkouts.length > 0 ? (
                  stats.recentWorkouts.map((workout: any) => (
                    <Box key={workout._id} sx={(theme: any) => ({
                      mb: 2,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.secondary.main, 0.05),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    })}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700}>{workout?.title || "NA"}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(workout?.date).toLocaleDateString()} • {workout?.exercises?.length} Exercises
                        </Typography>
                      </Box>
                      <Button size="small" variant="text" onClick={() => navigate('/progress')}>Details</Button>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">No recent workouts logged.</Typography>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* INSTRUCTOR: Upcoming Classes */}
        {user?.role === 'INSTRUCTOR' && (
          <Card sx={{ gridColumn: { md: 'span 2' } }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>Upcoming Sessions</Typography>
              <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2}>
                {stats?.upcomingClasses && stats.upcomingClasses.length > 0 ? (
                  stats.upcomingClasses.map((session: any) => (
                    <Box key={session._id} sx={(theme: any) => ({
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                    })}>
                      <Typography variant="subtitle1" fontWeight={700} gutterBottom>{session?.title || "NA"}</Typography>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <EventIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {new Date(session?.startTime).toLocaleDateString()} @ {new Date(session?.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <PeopleIcon fontSize="small" color="action" />
                        <Typography variant="body2">{session?.enrolledCount} / {session?.capacity} Enrolled</Typography>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">No upcoming classes assigned.</Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        )}

        {/* ADMIN: Recent Users */}
        {user?.role === 'STUDIO_ADMIN' && (
          <Card sx={{ gridColumn: { md: 'span 2' } }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>Newest Members</Typography>
              {stats?.recentUsers && stats.recentUsers.length > 0 ? (
                <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }} gap={2}>
                  {stats.recentUsers.map((newUser: any) => (
                    <Box key={newUser._id} sx={(theme: any) => ({
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.background.paper, 0.5),
                      border: `1px solid ${theme.palette.divider}`
                    })}>
                      <Box display="flex" alignItems="center" gap={2} mb={1}>
                        <Box sx={(theme: any) => ({ width: 40, height: 40, borderRadius: '50%', bgcolor: theme.palette.primary.main, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 })}>
                          {newUser.fullName.charAt(0)}
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700}>{newUser.fullName}</Typography>
                          <Typography variant="caption" color="text.secondary">{newUser.role}</Typography>
                        </Box>
                      </Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Joined: {new Date(newUser.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">No recent signups.</Typography>
              )}
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Quick Actions */}
      <Typography variant="h5" fontWeight={700} gutterBottom mb={3}>
        Quick Actions
      </Typography>
      <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }} gap={3}>
        {/* Common for all */}
        <QuickActionCard
          title="My Profile"
          description="Update your personal details"
          icon={ProfileIcon}
          color={theme.palette.info.main}
          onClick={() => navigate('/profile')}
        />
        <QuickActionCard
          title="Settings"
          description="Manage preferences & security"
          icon={SettingsIcon}
          color={theme.palette.grey[500]}
          onClick={() => navigate('/settings')}
        />

        {/* Role Specific */}
        {user?.role === 'STUDIO_ADMIN' && (
          <QuickActionCard
            title="User Management"
            description="Manage members and instructors"
            icon={PeopleIcon}
            color={theme.palette.primary.main}
            onClick={() => navigate('/admin/users')}
          />
        )}

        {user?.role === 'INSTRUCTOR' && (
          <QuickActionCard
            title="My Schedule"
            description="View your upcoming classes"
            icon={CalendarIcon}
            color={theme.palette.primary.main}
            onClick={() => navigate('/schedule')}
          />
        )}

        {user?.role === 'MEMBER' && (
          <QuickActionCard
            title="Book a Class"
            description="Find and book a new session"
            icon={CalendarIcon}
            color={theme.palette.primary.main}
            onClick={() => navigate('/schedule')}
          />
        )}
      </Box>
    </Box >
  );
}
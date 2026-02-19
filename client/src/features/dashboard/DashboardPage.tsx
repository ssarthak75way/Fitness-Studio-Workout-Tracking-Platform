import { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, useTheme, alpha, Skeleton, Button, CircularProgress } from '@mui/material';
import { motion, type Variants } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../../services/index';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
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
import type { DashboardStats, Booking, WorkoutLog, ClassSession, User } from '../../types';
import type { Theme } from '@mui/material';

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
  pageContainer: {
    p: 0,
    bgcolor: 'background.default',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  headerHero: (theme: Theme) => ({
    pt: { xs: 10, md: 14 },
    pb: { xs: 8, md: 12 },
    px: { xs: 3, md: 6 },
    position: 'relative',
    backgroundImage: theme.palette.mode === 'dark'
      ? `linear-gradient(rgba(6, 9, 15, 0.7), rgba(6, 9, 15, 1)), url(https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop)`
      : `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.95)), url(https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: 4,
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
    '&::before': {
      content: '"PERFORMANCE"',
      position: 'absolute',
      top: '20%',
      left: '5%',
      fontSize: { xs: '5rem', md: '12rem' },
      fontWeight: 950,
      color: theme.palette.mode === 'dark' ? alpha('#fff', 0.03) : alpha('#000', 0.03),
      letterSpacing: '20px',
      zIndex: 0,
      pointerEvents: 'none',
      lineHeight: 0.8
    }
  }),
  headerTitle: (theme: Theme) => ({
    fontWeight: 950,
    fontSize: { xs: '3.5rem', md: '6rem' },
    lineHeight: 0.85,
    letterSpacing: '-4px',
    color: theme.palette.text.primary,
    textTransform: 'uppercase',
    mb: 2,
    position: 'relative',
    zIndex: 1,
    '& span': {
      color: theme.palette.primary.main,
      textShadow: `0 0 40px ${alpha(theme.palette.primary.main, 0.5)}`
    }
  }),
  contentWrapper: {
    px: { xs: 3, md: 6 },
    py: { xs: 4, md: 8 },
    flexGrow: 1,
    position: 'relative',
    zIndex: 1
  },
  sectionLabel: {
    color: 'primary.main',
    fontWeight: 900,
    letterSpacing: '5px',
    mb: 4,
    display: 'block',
    textTransform: 'uppercase',
    fontSize: '0.7rem',
    opacity: 0.8
  },
  bentoGrid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(12, 1fr)' },
    gap: 3,
    mb: 8,
  },
  statCard: {
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 2,
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: (theme: Theme) => theme.palette.mode === 'dark'
      ? alpha(theme.palette.background.paper, 0.4)
      : alpha(theme.palette.background.paper, 0.8),
    backdropFilter: 'blur(24px) saturate(160%)',
    transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
    boxShadow: (theme: Theme) => theme.palette.mode === 'dark'
      ? `inset 0 0 20px -10px ${alpha('#fff', 0.05)}, 0 10px 30px -15px ${alpha('#000', 0.5)}`
      : `0 10px 30px -15px ${alpha(theme.palette.common.black, 0.05)}`,
    '&:hover': {
      transform: 'translateY(-10px) scale(1.02)',
      borderColor: (theme: Theme) => alpha(theme.palette.primary.main, 0.4),
      boxShadow: (theme: Theme) => `inset 0 0 30px -10px ${alpha(theme.palette.primary.main, 0.1)}, 0 20px 50px -20px ${alpha(theme.palette.primary.main, 0.4)}`,
      '& .metric-icon': {
        transform: 'scale(1.1) rotate(-10deg)',
        color: (theme: Theme) => theme.palette.primary.main
      }
    }
  },
  metricIcon: (color: string) => ({
    p: 2,
    borderRadius: 1.5,
    bgcolor: alpha(color, 0.08),
    color: color,
    mb: 3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    width: 'fit-content',
    boxShadow: `0 8px 16px -4px ${alpha(color, 0.15)}`
  }),
  quickActionCard: (color: string) => ({
    height: '100%',
    cursor: 'pointer',
    borderRadius: 2,
    border: '1px solid',
    borderColor: 'rgba(255,255,255,0.08)',
    bgcolor: alpha(color, 0.03),
    backdropFilter: 'blur(10px)',
    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    '&:hover': {
      transform: 'translateY(-6px)',
      bgcolor: alpha(color, 0.08),
      borderColor: alpha(color, 0.4),
      boxShadow: `0 15px 40px -15px ${alpha(color, 0.3)}`,
      '& .action-arrow': { transform: 'translateX(4px)' }
    },
  }),
  actionIconWrapper: (color: string) => ({
    p: 2,
    borderRadius: '50%',
    bgcolor: alpha(color, 0.1),
    color: color,
    display: 'flex',
    transition: 'transform 0.3s ease',
  }),
  listItem: (theme: Theme, color: string = 'primary.main') => ({
    mb: 2.5,
    p: 4,
    borderRadius: 2,
    bgcolor: alpha(theme.palette.background.paper, 0.3),
    backdropFilter: 'blur(20px)',
    border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    boxShadow: '0 4px 20px -10px rgba(0,0,0,0.3)',
    '&:hover': {
      borderColor: alpha(color, 0.5),
      bgcolor: alpha(theme.palette.background.paper, 0.5),
      transform: 'translateX(10px)',
      boxShadow: `0 15px 40px -15px ${alpha(color, 0.15)}`,
      '& .list-btn': {
        bgcolor: color,
        color: '#fff',
        boxShadow: `0 0 20px ${alpha(color, 0.4)}`
      }
    }
  }),
  instructorClassItem: (theme: Theme) => ({
    p: 4,
    borderRadius: 2,
    bgcolor: alpha(theme.palette.background.paper, 0.3),
    backdropFilter: 'blur(20px)',
    border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    '&:hover': {
      borderColor: theme.palette.primary.main,
      transform: 'translateY(-5px)',
      boxShadow: `0 15px 40px -15px ${alpha(theme.palette.primary.main, 0.3)}`
    }
  }),
  adminUserItem: (theme: Theme) => ({
    p: 3,
    borderRadius: 2,
    bgcolor: alpha(theme.palette.background.paper, 0.3),
    backdropFilter: 'blur(20px)',
    border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    '&:hover': {
      borderColor: theme.palette.primary.main,
      transform: 'translateY(-5px)'
    }
  }),
  adminAvatar: (theme: Theme) => ({
    width: 54,
    height: 54,
    borderRadius: 1.5,
    bgcolor: theme.palette.primary.main,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 900,
    fontSize: '1.4rem'
  }),
  loadingContainer: {
    p: 6,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    gap: 4
  }
};

const StatCard = ({ title, value, icon: Icon, color, size = "small", progress }: { title: string, value: string | number, icon: React.ElementType, color: string, size?: "small" | "large", progress?: number }) => {
  return (
    <motion.div variants={itemVariants} style={{ height: '100%' }}>
      <Card sx={{ ...styles.statCard, p: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box sx={styles.metricIcon(color)} className="metric-icon">
            <Icon sx={{ fontSize: '1.5rem' }} />
          </Box>
          {progress !== undefined && (
            <Box position="relative" display="inline-flex">
              <CircularProgress
                variant="determinate"
                value={100}
                size={50}
                thickness={2}
                sx={{ color: alpha(color, 0.1), position: 'absolute' }}
              />
              <CircularProgress
                variant="determinate"
                value={progress}
                size={50}
                thickness={2}
                sx={{ color: color, filter: `drop-shadow(0 0 8px ${alpha(color, 0.6)})` }}
              />
              <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.primary', fontSize: '0.6rem' }}>{progress}%</Typography>
              </Box>
            </Box>
          )}
        </Box>

        <Typography variant="overline" color="text.secondary" fontWeight={900} letterSpacing={3} sx={{ display: 'block', mb: 1, opacity: 0.6 }}>
          {title}
        </Typography>

        <Typography variant="h1" fontWeight={950} sx={{
          fontSize: size === "large" ? { xs: '3.5rem', md: '5rem' } : { xs: '2.5rem', md: '3.5rem' },
          lineHeight: 1,
          letterSpacing: '-3px',
          color: 'text.primary'
        }}>
          {value}
        </Typography>
      </Card>
    </motion.div>
  );
};

const QuickActionCard = ({ title, description, icon: Icon, onClick, color }: { title: string, description: string, icon: React.ElementType, onClick: () => void, color: string }) => (
  <motion.div variants={itemVariants}>
    <Card sx={styles.quickActionCard(color)} onClick={onClick}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3, p: 4 }}>
        <Box sx={styles.actionIconWrapper(color)} className="action-icon">
          <Icon />
        </Box>
        <Box flex={1}>
          <Typography variant="subtitle1" fontWeight={900} letterSpacing="-0.02em">{title}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.6, fontWeight: 500, lineHeight: 1.4 }}>{description}</Typography>
        </Box>
        <ArrowForwardIcon className="action-arrow" sx={{ fontSize: '1.2rem', opacity: 0.4, transition: 'transform 0.3s ease' }} />
      </CardContent>
    </Card>
  </motion.div>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
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
        showToast('Failed to load dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [showToast]);

  if (loading) {
    return (
      <Box sx={styles.loadingContainer}>
        <Skeleton variant="rectangular" width="60%" height={100} sx={{ borderRadius: 1 }} />
        <Skeleton variant="text" width="20%" height={30} sx={{ mb: 2 }} />
        <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }} gap={3}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible" sx={styles.pageContainer}>
      {/* Cinematic Hero */}
      <Box sx={styles.headerHero(theme)}>
        <Box>
          <Typography sx={styles.sectionLabel}>
            {user?.role === 'STUDIO_ADMIN' ? 'STUDIO CONTROL' : 'ATHLETE DASHBOARD'}
          </Typography>
          <Typography variant="h1" sx={styles.headerTitle(theme)}>
            HOWDY, <Box component="span">{user?.fullName?.split(' ')[0]}</Box>!
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 600, fontWeight: 400, lineHeight: 1.6 }}>
            {user?.role === 'MEMBER' && "The studio is optimized for your next breakthrough. Every session is a step toward mastery."}
            {user?.role === 'INSTRUCTOR' && "Your athletes are ready. Lead them through a session of peak performance."}
            {user?.role === 'STUDIO_ADMIN' && "Full system operational. Monitoring elite athletic development across the network."}
          </Typography>
        </Box>
        <Box>
          <Button
            variant="contained"
            startIcon={<ProfileIcon />}
            onClick={() => navigate('/profile')}
            sx={{
              borderRadius: 0,
              py: 2.5, px: 6,
              fontWeight: 900,
              letterSpacing: '2px',
              bgcolor: theme.palette.mode === 'dark' ? 'white' : 'primary.main',
              color: theme.palette.mode === 'dark' ? 'secondary.main' : 'white',
              fontSize: '0.9rem',
              '&:hover': {
                bgcolor: 'primary.main',
                color: 'white',
                boxShadow: `0 0 30px ${alpha(theme.palette.primary.main, 0.5)}`
              }
            }}
          >
            VIEW PROFILE
          </Button>
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box sx={styles.contentWrapper}>

        {/* Bento Grid Metrics */}
        <Typography sx={styles.sectionLabel}>PLATFORM INTEL</Typography>
        <Box sx={styles.bentoGrid}>
          {user?.role === 'MEMBER' && (
            <>
              <Box sx={{ gridColumn: { md: 'span 7' }, gridRow: { md: 'span 2' } }}>
                <StatCard
                  title="Success Pipeline"
                  value={stats?.upcomingBookings?.length || 0}
                  icon={EventIcon}
                  color={theme.palette.primary.main}
                  size="large"
                  progress={stats?.upcomingBookings?.length ? (stats.upcomingBookings.length / 10) * 100 : 0}
                />
              </Box>
              <Box sx={{ gridColumn: { md: 'span 5' } }}>
                <StatCard
                  title="Career Volume"
                  value={stats?.totalWorkouts || 0}
                  icon={HistoryIcon}
                  color={theme.palette.secondary.main}
                />
              </Box>
              <Box sx={{ gridColumn: { md: 'span 5' } }}>
                <StatCard
                  title="Current Velocity"
                  value={`${stats?.workoutStreak || 0}D`}
                  icon={StreakIcon}
                  color="#facc15"
                />
              </Box>
            </>
          )}

          {user?.role === 'INSTRUCTOR' && (
            <>
              <Box sx={{ gridColumn: { md: 'span 7' }, gridRow: { md: 'span 2' } }}>
                <StatCard
                  title="Engagement Index"
                  value={stats?.averageRating || '4.9'}
                  icon={StreakIcon}
                  color="#facc15"
                  size="large"
                  progress={98}
                />
              </Box>
              <Box sx={{ gridColumn: { md: 'span 5' } }}>
                <StatCard
                  title="Daily Load"
                  value={stats?.todaysClasses?.length || 0}
                  icon={EventIcon}
                  color={theme.palette.primary.main}
                />
              </Box>
              <Box sx={{ gridColumn: { md: 'span 5' } }}>
                <StatCard
                  title="Global Impact"
                  value={stats?.totalClasses || 0}
                  icon={HistoryIcon}
                  color={theme.palette.secondary.main}
                />
              </Box>
            </>
          )}

          {user?.role === 'STUDIO_ADMIN' && (
            <>
              <Box sx={{ gridColumn: { md: 'span 8' }, gridRow: { md: 'span 2' } }}>
                <StatCard
                  title="Network Ecosystem"
                  value={stats?.totalUsers || 0}
                  icon={PeopleIcon}
                  color={theme.palette.primary.main}
                  size="large"
                  progress={85}
                />
              </Box>
              <Box sx={{ gridColumn: { md: 'span 4' } }}>
                <StatCard
                  title="Active Core"
                  value={stats?.totalMembers || 0}
                  icon={PeopleIcon}
                  color={theme.palette.secondary.main}
                />
              </Box>
              <Box sx={{ gridColumn: { md: 'span 4' } }}>
                <StatCard
                  title="Elite Council"
                  value={stats?.totalInstructors || 0}
                  icon={PeopleIcon}
                  color="#facc15"
                />
              </Box>
              <Box sx={{ gridColumn: { md: 'span 12' } }}>
                <StatCard
                  title="System Throughput"
                  value={`${stats?.totalBookings || 0} SESSIONS`}
                  icon={TrendingUpIcon}
                  color="#4ade80"
                />
              </Box>
            </>
          )}
        </Box>

        {/* Dynamic Lists Section */}
        <Box display="grid" gridTemplateColumns={{ xs: '1fr', lg: 'repeat(2, 1fr)' }} gap={6} mb={10}>

          {/* Member Content */}
          {user?.role === 'MEMBER' && (
            <>
              <Box>
                <Typography sx={styles.sectionLabel}>YOUR UPCOMING SESSIONS</Typography>
                <Box>
                  {stats?.upcomingBookings && stats.upcomingBookings.length > 0 ? (
                    stats.upcomingBookings.map((booking: Booking) => (
                      <Box key={booking._id} sx={styles.listItem(theme, theme.palette.primary.main)}>
                        <Box>
                          <Typography variant="h6" fontWeight={900} sx={{ letterSpacing: '-0.5px', color: 'text.primary' }}>
                            {(typeof booking.classSession !== 'string' && booking.classSession?.title) || "ELITE SESSION"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, opacity: 0.7 }}>
                            {typeof booking.classSession !== 'string' && booking.classSession?.startTime
                              ? `${new Date(booking.classSession.startTime).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })} @ ${new Date(booking.classSession.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                              : 'TBD'}
                          </Typography>
                        </Box>
                        <Button
                          className="list-btn"
                          size="medium"
                          variant="outlined"
                          sx={{ borderRadius: 0, fontWeight: 900, letterSpacing: '1px', transition: 'all 0.3s ease' }}
                          onClick={() => navigate('/schedule')}
                        >
                          ACCESS
                        </Button>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body1" color="text.secondary" sx={{ opacity: 0.5, fontStyle: 'italic' }}>
                      No sessions booked. Optimized performance awaits.
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box>
                <Typography sx={styles.sectionLabel}>PERFORMANCE HISTORY</Typography>
                <Box>
                  {stats?.recentWorkouts && stats.recentWorkouts.length > 0 ? (
                    stats.recentWorkouts.map((workout: WorkoutLog) => (
                      <Box key={workout._id} sx={styles.listItem(theme, theme.palette.secondary.main)}>
                        <Box>
                          <Typography variant="h6" fontWeight={900} sx={{ letterSpacing: '-0.5px', color: 'text.primary' }}>
                            {workout?.title || "UNNAMED WORKOUT"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, opacity: 0.7 }}>
                            {new Date(workout?.date).toLocaleDateString()} • {workout?.exercises?.length || 0} EXERCISES COMPLETED
                          </Typography>
                        </Box>
                        <Button
                          className="list-btn"
                          size="medium"
                          variant="text"
                          sx={{ fontWeight: 900, letterSpacing: '1px', transition: 'all 0.3s ease' }}
                          onClick={() => navigate('/progress')}
                        >
                          ANALYZE
                        </Button>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body1" color="text.secondary" sx={{ opacity: 0.5, fontStyle: 'italic' }}>
                      No workouts logged. Start your evolution today.
                    </Typography>
                  )}
                </Box>
              </Box>
            </>
          )}

          {/* Instructor Content */}
          {user?.role === 'INSTRUCTOR' && (
            <Box sx={{ gridColumn: 'span 2' }}>
              <Typography sx={styles.sectionLabel}>UPCOMING SESSIONS TO LEAD</Typography>
              <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3}>
                {stats?.upcomingClasses && stats.upcomingClasses.length > 0 ? (
                  stats.upcomingClasses.map((session: ClassSession) => (
                    <Box key={session._id} sx={styles.instructorClassItem(theme)}>
                      <Typography variant="h5" fontWeight={900} gutterBottom>{session?.title || "CLASS"}</Typography>
                      <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <EventIcon color="primary" />
                        <Typography variant="subtitle2" fontWeight={700}>
                          {new Date(session?.startTime).toLocaleDateString()} @ {new Date(session?.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={2}>
                        <PeopleIcon color="primary" />
                        <Typography variant="body2" fontWeight={600}>{session?.enrolledCount} / {session?.capacity} ATHLETES ENROLLED</Typography>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body1" color="text.secondary">No sessions assigned yet.</Typography>
                )}
              </Box>
            </Box>
          )}

          {/* Admin Content */}
          {user?.role === 'STUDIO_ADMIN' && (
            <Box sx={{ gridColumn: 'span 2' }}>
              <Typography sx={styles.sectionLabel}>NEWEST STUDIO MEMBERS</Typography>
              <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }} gap={3}>
                {stats?.recentUsers && stats.recentUsers.length > 0 ? (
                  stats.recentUsers.map((newUser: User) => (
                    <Box key={newUser._id} sx={styles.adminUserItem(theme)}>
                      <Box display="flex" alignItems="center" gap={3} mb={2}>
                        <Box sx={styles.adminAvatar(theme)}>
                          {newUser.fullName.charAt(0)}
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={900}>{newUser.fullName}</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700, bgcolor: 'primary.main', px: 1, color: '#fff' }}>{newUser.role}</Typography>
                        </Box>
                      </Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        JOINED: {new Date(newUser.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body1" color="text.secondary">No recent signups to report.</Typography>
                )}
              </Box>
            </Box>
          )}
        </Box>

        {/* Quick Actions Section */}
        <Typography sx={styles.sectionLabel}>COMMAND CENTER</Typography>
        <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }} gap={3} mb={10}>
          <QuickActionCard
            title="Profile Control"
            description="Manage your elite athlete profile"
            icon={ProfileIcon}
            color={theme.palette.info.main}
            onClick={() => navigate('/profile')}
          />
          <QuickActionCard
            title="System Settings"
            description="Configure security & experience"
            icon={SettingsIcon}
            color={theme.palette.grey[500]}
            onClick={() => navigate('/settings')}
          />

          {user?.role === 'STUDIO_ADMIN' && (
            <QuickActionCard
              title="User Management"
              description="Command member & instructor data"
              icon={PeopleIcon}
              color={theme.palette.primary.main}
              onClick={() => navigate('/admin/users')}
            />
          )}

          {user?.role === 'INSTRUCTOR' && (
            <QuickActionCard
              title="Studio Schedule"
              description="Review your upcoming assignments"
              icon={CalendarIcon}
              color={theme.palette.primary.main}
              onClick={() => navigate('/schedule')}
            />
          )}

          {user?.role === 'MEMBER' && (
            <QuickActionCard
              title="Book Session"
              description="Secure your spot in the next class"
              icon={CalendarIcon}
              color={theme.palette.primary.main}
              onClick={() => navigate('/schedule')}
            />
          )}

          <QuickActionCard
            title="Performance Hub"
            description="View deep metrics and growth"
            icon={TrendingUpIcon}
            color={theme.palette.success.main}
            onClick={() => navigate('/progress')}
          />
        </Box>

      </Box>
    </Box>
  );
}
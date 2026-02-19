import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Card, CardContent, useTheme, alpha, Chip, Stack,
  type Theme
} from '@mui/material';
import {
  Add as AddIcon,
  EmojiEvents as StreakIcon,
  History as HistoryIcon,
  Timeline as RecordIcon,
  ChevronRight as ChevronRightIcon,
  FitnessCenter as FitnessCenterIcon,
  Layers as TemplatesIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { workoutService } from '../../services';
import type { WorkoutLog, PersonalRecord, WorkoutTemplate } from '../../types';
import LogWorkoutModal from './LogWorkoutModal';
import { useToast } from '../../context/ToastContext';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 }
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
      ? `linear-gradient(rgba(6, 9, 15, 0.75), rgba(6, 9, 15, 1)), url(https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop)`
      : `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.95)), url(https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: 4,
    borderBottom: `1px solid ${theme.palette.divider}`,
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
      textShadow: theme.palette.mode === 'dark' ? `0 0 40px ${alpha(theme.palette.primary.main, 0.5)}` : 'none'
    }
  }),
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
  contentWrapper: {
    px: { xs: 3, md: 6 },
    py: { xs: 4, md: 8 },
    flexGrow: 1,
    position: 'relative',
    zIndex: 1
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
    gap: 3,
    mb: 8
  },
  statCard: (theme: Theme) => ({
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 2,
    border: '1px solid',
    borderColor: theme.palette.divider,
    bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.4 : 0.8),
    backdropFilter: 'blur(24px) saturate(160%)',
    transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
    boxShadow: theme.palette.mode === 'dark'
      ? `inset 0 0 20px -10px ${alpha('#fff', 0.05)}, 0 10px 30px -15px ${alpha('#000', 0.5)}`
      : `0 10px 30px -15px ${alpha(theme.palette.common.black, 0.1)}`,
    '&:hover': {
      transform: 'translateY(-10px) scale(1.02)',
      borderColor: alpha(theme.palette.primary.main, 0.4),
      boxShadow: `inset 0 0 30px -10px ${alpha(theme.palette.primary.main, 0.1)}, 0 20px 50px -20px ${alpha(theme.palette.primary.main, 0.4)}`,
      '& .metric-icon': {
        transform: 'scale(1.1) rotate(-10deg)',
        color: theme.palette.primary.main
      }
    }
  }),
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
  recordsGrid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
    gap: 3,
    mb: 8
  },
  recordCard: (theme: Theme) => ({
    borderRadius: 2,
    border: '1px solid',
    borderColor: theme.palette.divider,
    bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.3 : 0.7),
    backdropFilter: 'blur(20px)',
    p: 4,
    height: '100%',
    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    '&:hover': {
      borderColor: alpha(theme.palette.secondary.main, 0.4),
      transform: 'translateY(-5px)',
      boxShadow: `0 15px 40px -15px ${alpha(theme.palette.secondary.main, 0.2)}`
    }
  }),
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3
  },
  historyCard: (theme: Theme) => ({
    borderRadius: 2,
    bgcolor: alpha(theme.palette.background.paper, 0.3),
    backdropFilter: 'blur(20px)',
    borderColor: theme.palette.divider,
    p: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    '&:hover': {
      borderColor: theme.palette.primary.main,
      bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.5 : 0.9),
      transform: 'translateX(10px)',
      boxShadow: `0 15px 40px -15px ${alpha(theme.palette.primary.main, 0.15)}`,
      '& .history-btn': {
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.4)}`
      }
    }
  }),
  noRecordsBox: (theme: Theme) => ({
    gridColumn: '1/-1',
    p: 6,
    textAlign: 'center',
    bgcolor: alpha('#fff', 0.02),
    borderRadius: 2,
    border: `1px dashed ${alpha(theme.palette.divider, 0.2)}`
  }),
  exerciseBadge: (theme: Theme) => ({
    px: 2,
    py: 1,
    borderRadius: 0,
    bgcolor: alpha(theme.palette.action.hover, 0.1),
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    display: 'flex',
    alignItems: 'center',
    gap: 1.5
  }),
  actionButton: {
    borderRadius: 0,
    fontWeight: 900,
    letterSpacing: '1px',
    py: 2,
    px: 4,
    transition: 'all 0.3s ease'
  }
};

const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: React.ElementType, color: string }) => {
  const theme = useTheme();
  return (
    <Card sx={styles.statCard(theme)}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={styles.metricIcon(color)} className="metric-icon">
          <Icon sx={{ fontSize: '1.5rem' }} />
        </Box>
        <Typography variant="overline" color="text.secondary" fontWeight={900} letterSpacing={3} sx={{ display: 'block', mb: 1, opacity: 0.6 }}>
          {title}
        </Typography>
        <Typography variant="h3" fontWeight={950} sx={{ letterSpacing: '-2px', color: 'text.primary' }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default function WorkoutsPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [records, setRecords] = useState<Record<string, PersonalRecord>>({});
  const [streak, setStreak] = useState(0);
  const [openLog, setOpenLog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null);

  const fetchData = async () => {
    try {
      const [workoutsRes, recordsRes, streakRes] = await Promise.all([
        workoutService.getWorkoutHistory(),
        workoutService.getPersonalRecords(),
        workoutService.getWorkoutStreak(),
      ]);
      setWorkouts(workoutsRes.data?.workouts || []);
      setRecords(recordsRes.data?.records || {});
      setStreak(streakRes.data?.streak || 0);
    } catch (error) {
      console.error('Failed to fetch workout data:', error);
      showToast('Failed to load workout history', 'error');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible" sx={styles.pageContainer}>
      {/* Cinematic Hero */}
      <Box sx={styles.headerHero(theme)}>
        <Box>
          <Typography sx={styles.sectionLabel}>PERFORMANCE EVOLUTION</Typography>
          <Typography variant="h1" sx={styles.headerTitle(theme)}>
            ELITE <Box component="span">WORKOUTS</Box>
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 600, fontWeight: 400, lineHeight: 1.6 }}>
            The arena is yours. Track every rep, celebrate every breakthrough, and document your path to absolute mastery.
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<TemplatesIcon />}
            onClick={() => navigate('/workouts/templates')}
            sx={{ ...styles.actionButton, color: 'text.primary', borderColor: theme.palette.divider }}
          >
            TEMPLATES
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenLog(true)}
            sx={{ ...styles.actionButton, bgcolor: 'primary.main', color: '#fff' }}
          >
            LOG SESSION
          </Button>
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box sx={styles.contentWrapper}>
        {/* Stats Section */}
        <Typography sx={styles.sectionLabel}>CORE METRICS</Typography>
        <Box sx={styles.statsGrid}>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Current Velocity"
              value={`${streak} DAYS`}
              icon={StreakIcon}
              color="#facc15"
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Career Volume"
              value={`${workouts.length} SESSIONS`}
              icon={HistoryIcon}
              color={theme.palette.primary.main}
            />
          </motion.div>
        </Box>

        {/* PR Section */}
        <Typography sx={styles.sectionLabel}>HALL OF FAME</Typography>
        <Box sx={styles.recordsGrid}>
          {Object.entries(records).length > 0 ? (
            Object.entries(records).map(([exercise, record]) => (
              <motion.div variants={itemVariants} key={exercise}>
                <Card sx={styles.recordCard(theme)}>
                  <Box display="flex" alignItems="center" mb={2} gap={1}>
                    <RecordIcon sx={{ color: theme.palette.secondary.main, fontSize: 20 }} />
                    <Typography variant="overline" color="text.secondary" fontWeight={900} letterSpacing={2}>
                      {exercise}
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight={950} sx={{ color: 'text.primary', letterSpacing: '-1.5px', mb: 1 }}>
                    {record.weight} <Typography variant="caption" sx={{ fontWeight: 900, opacity: 0.5, letterSpacing: '1px' }}>LBS</Typography>
                    <Box component="span" sx={{ mx: 1.5, opacity: 0.2 }}>×</Box>
                    {record.reps} <Typography variant="caption" sx={{ fontWeight: 900, opacity: 0.5, letterSpacing: '1px' }}>REPS</Typography>
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, opacity: 0.6 }}>
                    RECORDED {new Date(record.date).toLocaleDateString().toUpperCase()}
                  </Typography>
                </Card>
              </motion.div>
            ))
          ) : (
            <Box sx={styles.noRecordsBox(theme)}>
              <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '1px', opacity: 0.5 }}>
                NO RECORDS ARCHIVED. START YOUR LEGACY.
              </Typography>
            </Box>
          )}
        </Box>

        {/* History Section */}
        <Typography sx={styles.sectionLabel}>SESSION CHRONICLE</Typography>
        <Box sx={styles.historyList}>
          {workouts.length > 0 ? (
            workouts.map((workout) => (
              <motion.div variants={itemVariants} key={workout._id}>
                <Box sx={styles.historyCard(theme)}>
                  <Box display="flex" gap={4} alignItems="center">
                    <Box>
                      <Typography variant="h6" fontWeight={900} sx={{ letterSpacing: '-0.5px', color: 'text.primary', mb: 1 }}>
                        {workout.title.toUpperCase()}
                      </Typography>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Chip
                          label={new Date(workout.date).toLocaleDateString().toUpperCase()}
                          size="small"
                          sx={{ borderRadius: 0, fontWeight: 900, bgcolor: alpha(theme.palette.text.primary, 0.05), color: alpha(theme.palette.text.primary, 0.6) }}
                        />
                        {workout.duration && (
                          <Box display="flex" alignItems="center" gap={1}>
                            <HistoryIcon sx={{ fontSize: '1rem', color: 'primary.main' }} />
                            <Typography variant="caption" sx={{ fontWeight: 900, color: 'primary.main', opacity: 0.8 }}>
                              {workout.duration} MINS
                            </Typography>
                          </Box>
                        )}
                        <Box display="flex" alignItems="center" gap={1}>
                          <FitnessCenterIcon sx={{ fontSize: '1rem', color: alpha(theme.palette.text.primary, 0.4) }} />
                          <Typography variant="caption" sx={{ fontWeight: 900, color: alpha(theme.palette.text.primary, 0.4) }}>
                            {workout.exercises.length} EXERCISES
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </Box>
                  <Button
                    className="history-btn"
                    size="medium"
                    variant="outlined"
                    endIcon={<ChevronRightIcon />}
                    sx={{ borderRadius: 0, fontWeight: 900, letterSpacing: '1px', transition: 'all 0.3s ease' }}
                  >
                    DETAILS
                  </Button>
                </Box>
              </motion.div>
            ))
          ) : (
            <Box sx={styles.noRecordsBox(theme)}>
              <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '1px', opacity: 0.5 }}>
                NO SESSIONS RECORDED IN THE CHRONICLE.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      <LogWorkoutModal
        open={openLog}
        onClose={() => {
          setOpenLog(false);
          setSelectedTemplate(null);
        }}
        onSuccess={() => {
          fetchData();
          setOpenLog(false);
          setSelectedTemplate(null);
        }}
        initialValues={selectedTemplate ? {
          title: selectedTemplate.name,
          exercises: selectedTemplate.exercises.map(ex => ({
            name: ex.name,
            sets: Array(ex.sets).fill({ reps: ex.reps, weight: ex.weight || 0 }),
            notes: ex.notes
          }))
        } : null}
      />
    </Box>
  );
}
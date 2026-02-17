import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Card, CardContent, useTheme, alpha, IconButton, Chip
} from '@mui/material';
import type { Theme } from '@mui/material';
import {
  Add as AddIcon,
  EmojiEvents as StreakIcon,
  History as HistoryIcon,
  Timeline as RecordIcon,
  ChevronRight as ChevronRightIcon,
  FitnessCenter as FitnessCenterIcon
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
  pageContainer: { maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 3 } },
  headerTitle: (theme: Theme) => ({
    background: `linear-gradient(45deg, ${theme.palette.text.primary} 30%, ${theme.palette.primary.main} 90%)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  }),
  headerSubtitle: { fontWeight: 400, mt: 0.5 },
  templatesButton: { borderStyle: 'solid', borderRadius: 2, px: 3, fontWeight: 600 },
  logSessionButton: (theme: Theme) => ({ borderRadius: 2, px: 3, fontWeight: 600, boxShadow: theme.shadows[4] }),
  statsGrid: { display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 6 },
  statCard: (color: string) => (theme: Theme) => ({
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: theme.shadows[2],
    borderRadius: 4,
    background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(color, 0.05)} 100%)`,
    border: `1px solid ${theme.palette.divider}`
  }),
  statCardIconBg: { position: 'absolute', top: -10, right: -10, opacity: 0.1, transform: 'rotate(-15deg)' },
  statCardIconLarge: (color: string) => ({ fontSize: 100, color: color }),
  statLabelContainer: (color: string) => ({
    p: 1,
    borderRadius: 2,
    bgcolor: alpha(color, 0.1),
    color: color,
    mr: 2,
    display: 'flex',
    boxShadow: `0 4px 12px ${alpha(color, 0.2)}`
  }),
  statLabel: { textTransform: 'uppercase', letterSpacing: '0.05em' },
  statValue: { color: 'text.primary' },
  sectionTitle: { fontWeight: 800, mb: 3 },
  recordsGrid: { display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 6 },
  recordCard: (theme: Theme) => ({
    borderRadius: 3,
    border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
    background: alpha(theme.palette.background.paper, 0.8),
    backdropFilter: 'blur(8px)'
  }),
  recordValue: { display: 'flex', alignItems: 'baseline', gap: 0.5 },
  recordUnit: { opacity: 0.7, fontWeight: 600 },
  recordSpacer: { mx: 1, color: 'text.disabled' },
  recordDate: { display: 'block', mt: 1 },
  noRecordsBox: (theme: Theme) => ({
    gridColumn: '1/-1',
    p: 4,
    textAlign: 'center',
    bgcolor: 'background.paper',
    borderRadius: 3,
    border: `1px dashed ${theme.palette.divider}`
  }),
  historyList: { display: 'flex', flexDirection: 'column', gap: 2 },
  historyCard: (theme: Theme) => ({
    borderRadius: 3,
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows[4]
    },
    border: `1px solid ${theme.palette.divider}`
  }),
  dateChip: { borderRadius: 1, fontSize: '0.75rem' },
  durationChip: (theme: Theme) => ({
    borderRadius: 1,
    fontSize: '0.75rem',
    border: 'none',
    bgcolor: alpha(theme.palette.primary.main, 0.1)
  }),
  exerciseBadge: (theme: Theme) => ({
    px: 1.5,
    py: 0.75,
    borderRadius: 1.5,
    bgcolor: alpha(theme.palette.action.hover, 0.5),
    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
    flexGrow: 1,
    maxWidth: 'fit-content'
  }),
  exerciseName: { fontWeight: 600, fontSize: '0.85rem' },
  exerciseSets: (theme: Theme) => ({ borderLeft: `1px solid ${theme.palette.divider}`, pl: 1, ml: 0.5 })
};

const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: React.ElementType, color: string }) => {
  const theme = useTheme();
  return (
    <Card sx={styles.statCard(color)(theme)}>
      <Box sx={styles.statCardIconBg}>
        <Icon sx={styles.statCardIconLarge(color)} />
      </Box>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Box sx={styles.statLabelContainer(color)}>
            <Icon sx={{ fontSize: 24 }} />
          </Box>
          <Typography variant="subtitle2" color="text.secondary" fontWeight={600} sx={styles.statLabel}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h3" fontWeight={800} sx={styles.statValue}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default function WorkoutsPage() {
  const theme = useTheme();
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [records, setRecords] = useState<Record<string, PersonalRecord>>({});
  const [streak, setStreak] = useState(0);
  const [openLog, setOpenLog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetchData = async () => {
    try {
      const [workoutsRes, recordsRes, streakRes] = await Promise.all([
        workoutService.getWorkoutHistory(),
        workoutService.getPersonalRecords(),
        workoutService.getWorkoutStreak(),
      ]);
      setWorkouts(workoutsRes.data.workouts);
      setRecords(recordsRes.data.records || recordsRes.data);
      setStreak(streakRes.data.streak);
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={5} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={styles.headerTitle(theme)}>
            Workouts
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={styles.headerSubtitle}>
            Track your progress and push your limits.
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            onClick={() => navigate('/workouts/templates')}
            sx={styles.templatesButton}
          >
            Templates
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenLog(true)}
            sx={styles.logSessionButton(theme)}
          >
            Log Session
          </Button>
        </Box>
      </Box>

      {/* Stats Section */}
      <Box sx={styles.statsGrid}>
        <motion.div variants={itemVariants}>
          <StatCard
            title="Workout Streak"
            value={`${streak} Days`}
            icon={StreakIcon}
            color="#facc15"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            title="Total Sessions"
            value={workouts.length}
            icon={HistoryIcon}
            color={theme.palette.primary.main}
          />
        </motion.div>
      </Box>

      <Typography variant="h5" sx={styles.sectionTitle} gutterBottom>
        Personal Records
      </Typography>
      <Box sx={styles.recordsGrid}>
        {Object.entries(records).length > 0 ? (
          Object.entries(records).map(([exercise, record]) => (
            <motion.div variants={itemVariants} key={exercise}>
              <Card sx={styles.recordCard(theme)}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1.5}>
                    <RecordIcon sx={{ mr: 1, color: theme.palette.secondary.main, fontSize: 20 }} />
                    <Typography variant="subtitle1" fontWeight={700} noWrap>{exercise}</Typography>
                  </Box>
                  <Typography variant="h4" fontWeight={800} color="secondary.main" sx={styles.recordValue}>
                    {record.weight} <Typography variant="caption" sx={styles.recordUnit}>lbs</Typography>
                    <Typography variant="h6" component="span" sx={styles.recordSpacer}>×</Typography>
                    {record.reps} <Typography variant="caption" sx={styles.recordUnit}>reps</Typography>
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={styles.recordDate}>
                    Achieved on {new Date(record.date).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <Box sx={styles.noRecordsBox(theme)}>
            <Typography variant="body1" color="text.secondary">No records found yet. Start training!</Typography>
          </Box>
        )}
      </Box>

      <Typography variant="h5" sx={styles.sectionTitle} gutterBottom>
        Recent History
      </Typography>
      <Box sx={styles.historyList}>
        {workouts.map((workout) => (
          <motion.div variants={itemVariants} key={workout._id}>
            <Card sx={styles.historyCard(theme)}>
              <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>{workout.title}</Typography>
                    <Box display="flex" gap={1} alignItems="center" mt={0.5}>
                      <Chip
                        label={`${new Date(workout.date).toLocaleDateString()}`}
                        size="small"
                        variant="outlined"
                        sx={styles.dateChip}
                      />
                      {workout.duration && (
                        <Chip
                          icon={<HistoryIcon sx={{ fontSize: '1rem !important' }} />}
                          label={`${workout.duration} min`}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={styles.durationChip(theme)}
                        />
                      )}
                    </Box>
                  </Box>
                  <IconButton size="small">
                    <ChevronRightIcon />
                  </IconButton>
                </Box>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {workout.exercises.map((exercise, idx) => (
                    <Box key={idx} sx={styles.exerciseBadge(theme)}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <FitnessCenterIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="body2" sx={styles.exerciseName}>{exercise.name}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={styles.exerciseSets(theme)}>
                          {exercise.sets.length} sets
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        ))}
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
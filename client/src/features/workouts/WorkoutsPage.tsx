import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Card, CardContent, useTheme, alpha, IconButton, Chip
} from '@mui/material';
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
import type { WorkoutLog } from '../../types';
import LogWorkoutModal from './LogWorkoutModal';

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

const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: any, color: string }) => (
  <Card sx={{
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: (theme) => theme.shadows[2],
    borderRadius: 4,
    background: (theme) => `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(color, 0.05)} 100%)`,
    border: (theme) => `1px solid ${theme.palette.divider}`
  }}>
    <Box sx={{ position: 'absolute', top: -10, right: -10, opacity: 0.1, transform: 'rotate(-15deg)' }}>
      <Icon sx={{ fontSize: 100, color: color }} />
    </Box>
    <CardContent sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <Box sx={{
          p: 1,
          borderRadius: 2,
          bgcolor: alpha(color, 0.1),
          color: color,
          mr: 2,
          display: 'flex',
          boxShadow: `0 4px 12px ${alpha(color, 0.2)}`
        }}>
          <Icon sx={{ fontSize: 24 }} />
        </Box>
        <Typography variant="subtitle2" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="h3" fontWeight={800} sx={{ color: 'text.primary' }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

export default function WorkoutsPage() {
  const theme = useTheme();
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [records, setRecords] = useState<Record<string, any>>({});
  const [streak, setStreak] = useState(0);
  const [openLog, setOpenLog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const navigate = useNavigate();

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
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible" sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 3 } }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={5} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{
            background: `linear-gradient(45deg, ${theme.palette.text.primary} 30%, ${theme.palette.primary.main} 90%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Workouts
          </Typography>
          <Typography variant="body1" color="text.secondary" fontWeight={400} mt={0.5}>
            Track your progress and push your limits.
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            onClick={() => navigate('/workouts/templates')}
            sx={{ borderStyle: 'solid', borderRadius: 2, px: 3, fontWeight: 600 }}
          >
            Templates
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenLog(true)}
            sx={{ borderRadius: 2, px: 3, fontWeight: 600, boxShadow: theme.shadows[4] }}
          >
            Log Session
          </Button>
        </Box>
      </Box>

      {/* Stats Section */}
      <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }} gap={3} mb={6}>
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

      <Typography variant="h5" fontWeight={800} gutterBottom mb={3}>
        Personal Records
      </Typography>
      <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }} gap={2} mb={6}>
        {Object.entries(records).length > 0 ? (
          Object.entries(records).map(([exercise, record]: [string, any]) => (
            <motion.div variants={itemVariants} key={exercise}>
              <Card sx={{
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                background: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: 'blur(8px)'
              }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1.5}>
                    <RecordIcon sx={{ mr: 1, color: theme.palette.secondary.main, fontSize: 20 }} />
                    <Typography variant="subtitle1" fontWeight={700} noWrap>{exercise}</Typography>
                  </Box>
                  <Typography variant="h4" fontWeight={800} color="secondary.main" sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                    {record.weight} <Typography variant="caption" sx={{ opacity: 0.7, fontWeight: 600 }}>lbs</Typography>
                    <Typography variant="h6" component="span" sx={{ mx: 1, color: 'text.disabled' }}>×</Typography>
                    {record.reps} <Typography variant="caption" sx={{ opacity: 0.7, fontWeight: 600 }}>reps</Typography>
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    Achieved on {new Date(record.date).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <Box gridColumn="1/-1" p={4} textAlign="center" bgcolor="background.paper" borderRadius={3} border={`1px dashed ${theme.palette.divider}`}>
            <Typography variant="body1" color="text.secondary">No records found yet. Start training!</Typography>
          </Box>
        )}
      </Box>

      <Typography variant="h5" fontWeight={800} gutterBottom mb={3}>
        Recent History
      </Typography>
      <Box display="flex" flexDirection="column" gap={2}>
        {workouts.map((workout) => (
          <motion.div variants={itemVariants} key={workout._id}>
            <Card sx={{
              borderRadius: 3,
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[4]
              },
              border: `1px solid ${theme.palette.divider}`
            }}>
              <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>{workout.title}</Typography>
                    <Box display="flex" gap={1} alignItems="center" mt={0.5}>
                      <Chip
                        label={`${new Date(workout.date).toLocaleDateString()}`}
                        size="small"
                        variant="outlined"
                        sx={{ borderRadius: 1, fontSize: '0.75rem' }}
                      />
                      {workout.duration && (
                        <Chip
                          icon={<HistoryIcon sx={{ fontSize: '1rem !important' }} />}
                          label={`${workout.duration} min`}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ borderRadius: 1, fontSize: '0.75rem', border: 'none', bgcolor: alpha(theme.palette.primary.main, 0.1) }}
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
                    <Box key={idx} sx={{
                      px: 1.5,
                      py: 0.75,
                      borderRadius: 1.5,
                      bgcolor: alpha(theme.palette.action.hover, 0.5),
                      border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                      flexGrow: 1,
                      maxWidth: 'fit-content'
                    }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <FitnessCenterIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="body2" fontWeight={600} fontSize="0.85rem">{exercise.name}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ borderLeft: `1px solid ${theme.palette.divider}`, pl: 1, ml: 0.5 }}>
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
        initialValues={selectedTemplate}
      />
    </Box>
  );
}
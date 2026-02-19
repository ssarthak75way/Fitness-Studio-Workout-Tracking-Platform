import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Select, MenuItem, FormControl, useTheme, alpha, Stack
} from '@mui/material';
import type { Theme } from '@mui/material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';
import {
  Timeline as TimelineIcon,
  EmojiEvents as TrophyIcon,
  Straighten as RulerIcon,
  Add as AddIcon,
  FitnessCenter as FitnessIcon
} from '@mui/icons-material';
import { metricsService, workoutService } from '../../services/index';
import { motion, type Variants } from 'framer-motion';
import type { BodyMetric, WorkoutAnalytics, PersonalRecord } from '../../types';
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
      ? `linear-gradient(rgba(6, 9, 15, 0.75), rgba(6, 9, 15, 1)), url(https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=2069&auto=format&fit=crop)`
      : `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.95)), url(https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=2069&auto=format&fit=crop)`,
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
      content: '"ANALYTICS"',
      position: 'absolute',
      top: '10%',
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
  heroSubtitle: () => ({
    color: 'text.secondary',
    maxWidth: 600,
    fontWeight: 400,
    lineHeight: 1.6,
    opacity: 0.8
  }),
  logEvolutionButton: () => ({
    borderRadius: 0,
    fontWeight: 900,
    letterSpacing: '1px',
    py: 2,
    px: 4,
    transition: 'all 0.3s ease',
    bgcolor: 'primary.main',
    color: 'primary.contrastText'
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
  metricsGrid: {
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
      : `0 10px 30px -15px ${alpha(theme.palette.common.black, 0.08)}`,
    '&:hover': {
      transform: 'translateY(-10px) scale(1.02)',
      borderColor: alpha(theme.palette.primary.main, 0.4),
      boxShadow: `inset 0 0 30px -10px ${alpha(theme.palette.primary.main, 0.1)}, 0 20px 50px -20px ${alpha(theme.palette.primary.main, 0.4)}`,
    }
  }),
  statIconWrapper: (color: string) => ({
    p: 1.5,
    borderRadius: 1.5,
    bgcolor: alpha(color, 0.08),
    color: color,
    mb: 2.5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 'fit-content',
    boxShadow: `0 8px 16px -4px ${alpha(color, 0.15)}`
  }),
  statTitle: () => ({
    variant: 'overline',
    color: 'text.secondary',
    fontWeight: 900,
    letterSpacing: 3,
    display: 'block',
    mb: 1,
    opacity: 0.6
  }),
  statValue: () => ({
    variant: 'h3',
    fontWeight: 950,
    letterSpacing: '-2px',
    color: 'text.primary'
  }),
  statUnit: () => ({
    variant: 'h6',
    fontWeight: 900,
    color: 'primary.main',
    opacity: 0.8,
    letterSpacing: '1px'
  }),
  chartCard: (theme: Theme) => ({
    mb: 8,
    p: 4,
    borderRadius: 2,
    border: '1px solid',
    borderColor: theme.palette.divider,
    bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.3 : 0.8),
    backdropFilter: 'blur(20px)',
    boxShadow: theme.palette.mode === 'dark'
      ? `0 20px 50px -20px ${alpha('#000', 0.4)}`
      : `0 10px 30px -15px ${alpha(theme.palette.common.black, 0.1)}`
  }),
  bentoGrid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
    gap: 4,
    mb: 8
  },
  prCard: (theme: Theme) => ({
    borderRadius: 2,
    border: '1px solid',
    borderColor: theme.palette.divider,
    bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.3 : 0.8),
    backdropFilter: 'blur(16px)',
    p: 4,
    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    '&:hover': {
      borderColor: theme.palette.secondary.main,
      transform: 'translateY(-5px)',
      boxShadow: `0 15px 40px -15px ${alpha(theme.palette.secondary.main, 0.2)}`
    }
  }),
  tooltipContainer: (theme: Theme) => ({
    bgcolor: alpha(theme.palette.background.paper, 0.95),
    backdropFilter: 'blur(10px)',
    p: 2,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 1.5,
    boxShadow: theme.palette.mode === 'dark'
      ? `0 10px 30px rgba(0,0,0,0.5)`
      : `0 10px 30px rgba(0,0,0,0.1)`
  }),
  tooltipLabel: () => ({
    variant: 'overline',
    fontWeight: 900,
    letterSpacing: 2,
    color: 'primary.main',
    display: 'block',
    mb: 1
  }),
  tooltipItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    mb: 0.5
  },
  tooltipText: () => ({
    variant: 'body2',
    color: 'text.primary',
    fontWeight: 700
  }),
  dialogPaper: (theme: Theme) => ({
    borderRadius: 2,
    bgcolor: 'background.paper',
    backgroundImage: theme.palette.mode === 'dark'
      ? `linear-gradient(rgba(6, 9, 15, 0.8), rgba(6, 9, 15, 1))`
      : 'none',
    border: `1px solid ${theme.palette.divider}`,
    overflow: 'hidden'
  }),
  actionButton: {
    borderRadius: 0,
    fontWeight: 900,
    letterSpacing: '1px',
    py: 2,
    px: 4,
    transition: 'all 0.3s ease'
  },
  selectControl: (theme: Theme) => ({
    borderRadius: 0,
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.divider
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: 'primary.main'
    },
    bgcolor: alpha(theme.palette.text.primary, 0.03)
  }),
  prGrid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
    gap: 3
  },
  anatomyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 2
  },
  exerciseSelectContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    mb: 4
  },
  prTitle: () => ({
    variant: 'h3',
    fontWeight: 950,
    color: 'text.primary',
    letterSpacing: '-2px',
    mb: 1
  }),
  prUnit: () => ({
    variant: 'h6',
    component: 'span',
    fontWeight: 900,
    opacity: 0.5
  }),
  prVolume: () => ({
    variant: 'overline',
    color: 'secondary.main',
    fontWeight: 900,
    letterSpacing: '2px'
  }),
  prDate: () => ({
    variant: 'body2',
    color: 'text.secondary',
    mt: 1,
    fontWeight: 600,
    opacity: 0.6
  }),
  addMetricTitle: () => ({
    variant: 'h4',
    fontWeight: 950,
    letterSpacing: '-1.5px',
    color: 'text.primary'
  }),
  anatomyLabel: () => ({
    variant: 'overline',
    color: 'primary.main',
    fontWeight: 900,
    letterSpacing: '4px',
    mb: 2,
    display: 'block'
  }),
  dialogActions: {
    p: 4,
    pt: 2
  },
  abortButton: {
    fontWeight: 900
  },
  commitButton: () => ({
    borderRadius: 0,
    fontWeight: 900,
    letterSpacing: '1px',
    py: 2,
    px: 6,
    transition: 'all 0.3s ease',
    bgcolor: 'primary.main',
    color: 'primary.contrastText'
  })
};

const StatCard = ({ title, value, unit, icon: Icon, color }: { title: string, value: string | number, unit?: string, icon: React.ElementType, color: string }) => {
  const theme = useTheme();
  return (
    <Card sx={styles.statCard(theme)}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={styles.statIconWrapper(color)}>
          <Icon sx={{ fontSize: '1.5rem' }} />
        </Box>
        <Typography sx={{ ...styles.statTitle }}>
          {title}
        </Typography>
        <Box display="flex" alignItems="baseline" gap={1}>
          <Typography sx={{ ...styles.statValue }}>
            {value}
          </Typography>
          {unit && (
            <Typography sx={{ ...styles.statUnit }}>
              {unit.toUpperCase()}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: string | number;
    color: string;
    [key: string]: string | number | undefined;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  const theme = useTheme();
  if (active && payload && payload.length) {
    return (
      <Box sx={styles.tooltipContainer(theme)}>
        <Typography sx={{ ...styles.tooltipLabel }}>
          {label}
        </Typography>
        {payload.map((entry, index) => (
          <Box key={index} sx={styles.tooltipItem}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: entry.color }} />
            <Typography sx={{ ...styles.tooltipText }}>
              {entry.name.toUpperCase()}: <span style={{ color: entry.color }}>{entry.value}</span>
            </Typography>
          </Box>
        ))}
      </Box>
    );
  }
  return null;
};

export default function ProgressPage() {
  const theme = useTheme();
  const { showToast } = useToast();
  const [metrics, setMetrics] = useState<BodyMetric[]>([]);
  const [records, setRecords] = useState<Record<string, PersonalRecord>>({});
  const [streak, setStreak] = useState(0);
  const [analytics, setAnalytics] = useState<WorkoutAnalytics | null>(null);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [openAddMetric, setOpenAddMetric] = useState(false);
  const [newMetric, setNewMetric] = useState({
    weight: '',
    bodyFatPercentage: '',
    measurements: {
      neck: '',
      chest: '',
      waist: '',
      hips: '',
      biceps: '',
      thighs: '',
    }
  });

  // ... (existing helper functions)
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [metricsRes, recordsRes, streakRes, analyticsRes] = await Promise.all([
        metricsService.getBodyMetrics(),
        workoutService.getPersonalRecords(),
        workoutService.getWorkoutStreak(),
        workoutService.getWorkoutAnalytics(),
      ]);
      setMetrics(metricsRes.data.metrics || []);
      setRecords(recordsRes.data.records);
      setStreak(streakRes.data.streak);
      setAnalytics(analyticsRes.data.analytics);

      const exercises = Object.keys(analyticsRes.data.analytics.exerciseProgression);
      if (exercises.length > 0 && !selectedExercise) {
        setSelectedExercise(exercises[0]);
      }
    } catch (error) {
      console.error('Failed to fetch progress data:', error);
    }
  };

  const handleAddMetric = async () => {
    try {
      await metricsService.addBodyMetrics({
        weight: parseFloat(newMetric.weight),
        bodyFatPercentage: parseFloat(newMetric.bodyFatPercentage),
        measurements: {
          neck: parseFloat(newMetric.measurements.neck) || undefined,
          chest: parseFloat(newMetric.measurements.chest) || undefined,
          waist: parseFloat(newMetric.measurements.waist) || undefined,
          hips: parseFloat(newMetric.measurements.hips) || undefined,
          biceps: parseFloat(newMetric.measurements.biceps) || undefined,
          thighs: parseFloat(newMetric.measurements.thighs) || undefined,
        }
      });
      setOpenAddMetric(false);
      fetchData();
      showToast('Metrics evolved successfully', 'success');
      setNewMetric({ weight: '', bodyFatPercentage: '', measurements: { neck: '', chest: '', waist: '', hips: '', biceps: '', thighs: '' } });
    } catch (error) {
      console.error('Failed to add metric:', error);
      showToast('Evolution failed', 'error');
    }
  };


  const chartData = metrics.map((m) => ({
    date: new Date(m.updatedAt || m.date).toLocaleDateString(),
    weight: m.weight,
    bodyFat: m.bodyFatPercentage,
  })).reverse();

  return (
    <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible" sx={styles.pageContainer}>
      {/* Cinematic Hero */}
      <Box sx={styles.headerHero(theme)}>
        <Box>
          <Typography sx={styles.sectionLabel}>DATA CONQUEST</Typography>
          <Typography variant="h1" sx={styles.headerTitle(theme)}>
            DATA <Box component="span">CONQUEST</Box>
          </Typography>
          <Typography variant="h6" sx={styles.heroSubtitle}>
            Quantify your greatness. Every metric is a testament to your discipline, verified by the elite FITNESS STUDIO performance engine.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenAddMetric(true)}
          sx={styles.logEvolutionButton}
        >
          LOG EVOLUTION
        </Button>
      </Box>

      {/* Main Content Area */}
      <Box sx={styles.contentWrapper}>
        {/* Stats Grid */}
        <Typography sx={styles.sectionLabel}>VITAL METRICS</Typography>
        <Box sx={styles.metricsGrid}>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Kinetic Path"
              value={streak}
              unit="days"
              icon={TimelineIcon}
              color="#facc15"
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Core Mass"
              value={metrics[0]?.weight?.toFixed(1) || 'N/A'}
              unit={metrics[0]?.weight ? 'lbs' : ''}
              icon={FitnessIcon}
              color={theme.palette.primary.main}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Density Index"
              value={metrics[0]?.bodyFatPercentage?.toFixed(1) || 'N/A'}
              unit={metrics[0]?.bodyFatPercentage ? '%' : ''}
              icon={RulerIcon}
              color={theme.palette.info.main}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Hall of Fame"
              value={Object.keys(records).length}
              unit="achievements"
              icon={TrophyIcon}
              color={theme.palette.secondary.main}
            />
          </motion.div>
        </Box>

        {/* Main Progression Chart */}
        <Typography sx={styles.sectionLabel}>MASS EVOLUTION</Typography>
        <Card sx={styles.chartCard(theme)}>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.05)} vertical={false} />
              <XAxis
                dataKey="date"
                stroke={alpha(theme.palette.text.primary, 0.3)}
                tick={{ fill: alpha(theme.palette.text.primary, 0.5), fontSize: 10, fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
                dy={15}
              />
              <YAxis
                stroke={alpha(theme.palette.text.primary, 0.3)}
                tick={{ fill: alpha(theme.palette.text.primary, 0.5), fontSize: 10, fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
                dx={-15}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={60} />
              <Line
                type="monotone"
                dataKey="weight"
                stroke={theme.palette.primary.main}
                strokeWidth={4}
                dot={{ r: 6, fill: theme.palette.primary.main, strokeWidth: 0 }}
                activeDot={{ r: 10, fill: '#fff', strokeWidth: 4, stroke: theme.palette.primary.main }}
                name="Weight Evolution"
              />
              <Line
                type="monotone"
                dataKey="bodyFat"
                stroke={theme.palette.info.main}
                strokeWidth={4}
                dot={{ r: 6, fill: theme.palette.info.main, strokeWidth: 0 }}
                activeDot={{ r: 10, fill: '#fff', strokeWidth: 4, stroke: theme.palette.info.main }}
                name="Body Fat Transformation"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Bento Grid Analytics */}
        <Box sx={styles.bentoGrid}>
          <Box>
            <Typography sx={styles.sectionLabel}>VOLUME INTEL</Typography>
            <Card sx={styles.chartCard(theme)}>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={analytics?.volumeHistory || []}>
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    stroke={alpha(theme.palette.text.primary, 0.3)}
                    tick={{ fill: alpha(theme.palette.text.primary, 0.5), fontSize: 10, fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                    dy={15}
                  />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: alpha(theme.palette.text.primary, 0.05) }} />
                  <Bar
                    dataKey="volume"
                    fill={theme.palette.primary.main}
                    radius={[4, 4, 0, 0]}
                    name="Session Volume"
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Box>

          <Box>
            <Typography sx={styles.sectionLabel}>CONSISTENCY RECORD</Typography>
            <Card sx={styles.chartCard(theme)}>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={analytics?.monthlyConsistency || []} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="month"
                    type="category"
                    stroke={alpha(theme.palette.text.primary, 0.5)}
                    tick={{ fill: alpha(theme.palette.text.primary, 0.6), fontSize: 11, fontWeight: 900 }}
                    axisLine={false}
                    tickLine={false}
                    width={80}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: alpha(theme.palette.text.primary, 0.05) }} />
                  <Bar
                    dataKey="count"
                    fill={theme.palette.secondary.main}
                    radius={[0, 4, 4, 0]}
                    name="Missions Completed"
                    barSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Box>
        </Box>

        {/* Exercise Progression */}
        <Box sx={styles.exerciseSelectContainer}>
          <Typography sx={styles.sectionLabel} mb={0}>EXERCISE TRAJECTORY</Typography>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <Select
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              sx={styles.selectControl(theme)}
            >
              {Object.keys(analytics?.exerciseProgression || {}).map(ex => (
                <MenuItem key={ex} value={ex}>{ex.toUpperCase()}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Card sx={styles.chartCard(theme)}>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={analytics?.exerciseProgression[selectedExercise] || []}>
              <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.05)} vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => new Date(date).toLocaleDateString()}
                stroke={alpha(theme.palette.text.primary, 0.3)}
                tick={{ fill: alpha(theme.palette.text.primary, 0.5), fontSize: 10, fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
                dy={15}
              />
              <YAxis
                stroke={alpha(theme.palette.text.primary, 0.3)}
                tick={{ fill: alpha(theme.palette.text.primary, 0.5), fontSize: 10, fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
                dx={-15}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="weight"
                stroke={theme.palette.warning.main}
                strokeWidth={4}
                dot={{ r: 6, fill: theme.palette.warning.main, strokeWidth: 0 }}
                activeDot={{ r: 10, fill: '#fff', strokeWidth: 4, stroke: theme.palette.warning.main }}
                name="Max Payload (lbs)"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* PR Cards */}
        <Typography sx={styles.sectionLabel}>ARCHIVED BREAKTHROUGHS</Typography>
        <Box sx={styles.prGrid}>
          {Object.entries(records).map(([exercise, record]: [string, PersonalRecord]) => (
            <Box key={exercise}>
              <motion.div variants={itemVariants}>
                <Card sx={styles.prCard(theme)}>
                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <TrophyIcon sx={{ color: 'warning.main', fontSize: '1.5rem' }} />
                    <Typography variant="h6" fontWeight={900} sx={{ letterSpacing: '-0.5px' }}>
                      {exercise.toUpperCase()}
                    </Typography>
                  </Box>
                  <Typography sx={{ ...styles.prTitle }}>
                    {record.weight} <Typography sx={{ ...styles.prUnit }}>LBS</Typography>
                  </Typography>
                  <Typography sx={{ ...styles.prVolume }}>
                    {record.reps} REPS VOLUME
                  </Typography>
                  <Typography sx={{ ...styles.prDate }}>
                    RECORDED {new Date(record.date).toLocaleDateString().toUpperCase()}
                  </Typography>
                </Card>
              </motion.div>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Add Metric Dialog */}
      <Dialog
        open={openAddMetric}
        onClose={() => setOpenAddMetric(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: styles.dialogPaper(theme) }}
      >
        <DialogTitle sx={{ p: 4, pb: 2 }}>
          <Typography sx={{ ...styles.sectionLabel }} mb={1}>EVOLUTION ARCHIVE</Typography>
          <Typography sx={{ ...styles.addMetricTitle }}>
            ADD BODY <Box component="span" sx={{ color: 'primary.main' }}>METRICS</Box>
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 4, py: 2 }}>
          <Stack spacing={4}>
            <Box display="flex" gap={3}>
              <TextField
                fullWidth
                label="CURRENT MASS (LBS)"
                variant="outlined"
                type="number"
                value={newMetric.weight}
                onChange={(e) => setNewMetric({ ...newMetric, weight: e.target.value })}
                sx={styles.selectControl(theme)}
              />
              <TextField
                fullWidth
                label="DENSITY % (BODY FAT)"
                variant="outlined"
                type="number"
                value={newMetric.bodyFatPercentage}
                onChange={(e) => setNewMetric({ ...newMetric, bodyFatPercentage: e.target.value })}
                sx={styles.selectControl(theme)}
              />
            </Box>

            <Box>
              <Typography sx={{ ...styles.anatomyLabel }}>
                ANATOMICAL MEASUREMENTS (IN)
              </Typography>
              <Box sx={styles.anatomyGrid}>
                {['neck', 'chest', 'waist', 'hips', 'biceps', 'thighs'].map((field) => (
                  <Box key={field}>
                    <TextField
                      fullWidth
                      label={field.toUpperCase()}
                      variant="outlined"
                      type="number"
                      value={newMetric.measurements[field as keyof typeof newMetric.measurements]}
                      onChange={(e) => setNewMetric({ ...newMetric, measurements: { ...newMetric.measurements, [field]: e.target.value } })}
                      sx={styles.selectControl(theme)}
                      size="small"
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={styles.dialogActions}>
          <Button onClick={() => setOpenAddMetric(false)} color="inherit" sx={styles.abortButton}>ABORT</Button>
          <Button
            variant="contained"
            onClick={handleAddMetric}
            sx={styles.commitButton}
          >
            COMMIT DATA
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
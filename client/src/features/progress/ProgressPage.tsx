import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Select, MenuItem, FormControl, InputLabel, useTheme, alpha
} from '@mui/material';
import type { Theme } from '@mui/material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';
import {
  Timeline as TimelineIcon,
  ShowChart as ChartIcon,
  EmojiEvents as TrophyIcon,
  Straighten as RulerIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { metricsService, workoutService } from '../../services/index';
import { motion, type Variants } from 'framer-motion';
import type { BodyMetric, WorkoutAnalytics, PersonalRecord } from '../../types';

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
  statCard: (color: string) => ({
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: (theme: Theme) => theme.shadows[2],
    borderRadius: 4,
    background: (theme: Theme) => `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(color, 0.05)} 100%)`,
    border: (theme: Theme) => `1px solid ${theme.palette.divider}`
  }),
  statIconBackground: () => ({
    position: 'absolute',
    top: -10,
    right: -10,
    opacity: 0.1,
    transform: 'rotate(-15deg)'
  }),
  statIconLarge: (color: string) => ({
    fontSize: 100,
    color: color
  }),
  iconWrapper: (color: string) => ({
    p: 1,
    borderRadius: 2,
    bgcolor: alpha(color, 0.1),
    color: color,
    mr: 2,
    display: 'flex',
    boxShadow: `0 4px 12px ${alpha(color, 0.2)}`
  }),
  iconSmall: { fontSize: 24 },
  statTitle: {
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  statValue: { color: 'text.primary' },
  tooltipContainer: (theme: Theme) => ({
    bgcolor: alpha(theme.palette.background.paper, 0.9),
    p: 2,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 2,
    boxShadow: theme.shadows[3],
    backdropFilter: 'blur(4px)'
  }),
  tooltipMarker: (color: string) => ({
    width: 8,
    height: 8,
    borderRadius: '50%',
    bgcolor: color
  }),
  pageContainer: {
    maxWidth: 1200,
    mx: 'auto',
    p: { xs: 2, md: 3 }
  },
  headerTitle: (theme: Theme) => ({
    background: `linear-gradient(45deg, ${theme.palette.text.primary} 30%, ${theme.palette.primary.main} 90%)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  }),
  addMetricsButton: (theme: Theme) => ({
    borderRadius: 2,
    px: 3,
    fontWeight: 600,
    boxShadow: theme.shadows[4]
  }),
  chartCard: (theme: Theme) => ({
    mb: 6,
    p: 3,
    borderRadius: 3,
    boxShadow: theme.shadows[2],
    border: `1px solid ${theme.palette.divider}`
  }),
  barChartCard: (theme: Theme) => ({
    p: 3,
    borderRadius: 3,
    boxShadow: theme.shadows[2],
    border: `1px solid ${theme.palette.divider}`,
    height: '100%',
    minHeight: 400
  }),
  exerciseSelect: { minWidth: 200 },
  selectControl: { borderRadius: 2 },
  prCard: (theme: Theme) => ({
    borderRadius: 3,
    border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
    background: alpha(theme.palette.background.paper, 0.8),
    backdropFilter: 'blur(8px)',
    transition: 'transform 0.2s',
    '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[4] }
  }),
  prTitle: { mr: 1, color: 'warning.main', fontSize: 20 },
  prValue: { display: 'flex', alignItems: 'baseline', gap: 0.5 },
  prUnit: { opacity: 0.7, fontWeight: 600 },
  prDetail: { mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 },
  dialogPaper: { borderRadius: 3 },
  dialogTitle: { pb: 1 },
  textFieldInput: { borderRadius: 2 },
  measurementTitle: { mt: 1, fontWeight: 600 },
  dialogActions: { p: 3, gap: 1 },
  genericButton: { borderRadius: 2, fontWeight: 600 }
};

const StatCard = ({ title, value, unit, icon: Icon, color }: { title: string, value: string | number, unit?: string, icon: React.ElementType, color: string }) => (
  <Card sx={styles.statCard(color)}>
    <Box sx={styles.statIconBackground()}>
      <Icon sx={styles.statIconLarge(color)} />
    </Box>
    <CardContent sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <Box sx={styles.iconWrapper(color)}>
          <Icon sx={styles.iconSmall} />
        </Box>
        <Typography variant="subtitle2" color="text.secondary" fontWeight={600} sx={styles.statTitle}>
          {title}
        </Typography>
      </Box>
      <Box display="flex" alignItems="baseline" gap={0.5}>
        <Typography variant="h3" fontWeight={800} sx={styles.statValue}>
          {value}
        </Typography>
        {unit && (
          <Typography variant="h6" color="text.secondary" fontWeight={600}>
            {unit}
          </Typography>
        )}
      </Box>
    </CardContent>
  </Card>
);

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: string | number;
    color?: string;
  }>;
  label?: string | number;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  const theme = useTheme();
  if (active && payload && payload.length) {
    return (
      <Box sx={styles.tooltipContainer(theme)}>
        <Typography variant="subtitle2" fontWeight={700} mb={1}>{label}</Typography>
        {payload.map((entry, index) => (
          <Box key={index} display="flex" alignItems="center" gap={1} mb={0.5}>
            <Box sx={styles.tooltipMarker(entry.color || theme.palette.primary.main)} />
            <Typography variant="body2" color="text.primary">
              {entry.name}: <span style={{ fontWeight: 600 }}>{entry.value}</span>
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
  const [metrics, setMetrics] = useState<BodyMetric[]>([]);
  const [records, setRecords] = useState<Record<string, PersonalRecord>>({});
  const [streak, setStreak] = useState(0);
  const [analytics, setAnalytics] = useState<WorkoutAnalytics | null>(null);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [openAddMetric, setOpenAddMetric] = useState(false);
  const [newMetric, setNewMetric] = useState({
    weight: '',
    bodyFatPercentage: '',
    neck: '',
    chest: '',
    waist: '',
    hips: '',
    biceps: '',
    thighs: '',
  });

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

      // Auto-select first exercise for progression chart
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
          neck: parseFloat(newMetric.neck) || undefined,
          chest: parseFloat(newMetric.chest) || undefined,
          waist: parseFloat(newMetric.waist) || undefined,
          hips: parseFloat(newMetric.hips) || undefined,
          biceps: parseFloat(newMetric.biceps) || undefined,
          thighs: parseFloat(newMetric.thighs) || undefined,
        }
      });
      setOpenAddMetric(false);
      fetchData();
      setNewMetric({ weight: '', bodyFatPercentage: '', neck: '', chest: '', waist: '', hips: '', biceps: '', thighs: '' });
    } catch (error) {
      console.error('Failed to add metric:', error);
    }
  };

  const chartData = metrics.map((m) => ({
    date: new Date(m.updatedAt || m.date).toLocaleDateString(),
    weight: m.weight,
    bodyFat: m.bodyFatPercentage,
    neck: m.measurements?.neck,
    chest: m.measurements?.chest,
    waist: m.measurements?.waist,
    hips: m.measurements?.hips,
    biceps: m.measurements?.biceps,
    thighs: m.measurements?.thighs,
  })).reverse(); // Show oldest to newest for trend

  return (
    <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible" sx={styles.pageContainer}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={5} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={styles.headerTitle(theme)}>
            Progress & Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary" fontWeight={400} mt={0.5}>
            Visualize your fitness journey and milestones.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenAddMetric(true)}
          sx={styles.addMetricsButton(theme)}
        >
          Add Metrics
        </Button>
      </Box>

      <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }} gap={3} mb={6}>
        <motion.div variants={itemVariants}>
          <StatCard
            title="Workout Streak"
            value={streak}
            unit="days"
            icon={TimelineIcon}
            color="#facc15"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            title="Current Weight"
            value={metrics[0]?.weight?.toFixed(2) || 'N/A'}
            unit={metrics[0]?.weight?.toFixed(2) ? 'lbs' : ''}
            icon={ChartIcon}
            color={theme.palette.primary.main}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            title="Body Fat %"
            value={metrics[0]?.bodyFatPercentage?.toFixed(2) || 'N/A'}
            unit={metrics[0]?.bodyFatPercentage?.toFixed(2) ? '%' : ''}
            icon={RulerIcon}
            color={theme.palette.info.main}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            title="Personal Records"
            value={Object.keys(records).length}
            icon={TrophyIcon}
            color={theme.palette.secondary.main}
          />
        </motion.div>
      </Box>

      <Typography variant="h5" fontWeight={800} gutterBottom mb={3}>
        Weight & Body Fat Progress
      </Typography>
      <Card sx={styles.chartCard(theme)}>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.1)} />
            <XAxis
              dataKey="date"
              stroke={theme.palette.text.secondary}
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke={theme.palette.text.secondary}
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Line
              type="monotone"
              dataKey="weight"
              stroke={theme.palette.primary.main}
              strokeWidth={3}
              dot={{ r: 4, fill: theme.palette.primary.main, strokeWidth: 2, stroke: theme.palette.background.paper }}
              activeDot={{ r: 6 }}
              name="Weight (lbs)"
            />
            <Line
              type="monotone"
              dataKey="bodyFat"
              stroke={theme.palette.info.main}
              strokeWidth={3}
              dot={{ r: 4, fill: theme.palette.info.main, strokeWidth: 2, stroke: theme.palette.background.paper }}
              activeDot={{ r: 6 }}
              name="Body Fat %"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Box display="grid" gridTemplateColumns={{ xs: '1fr', lg: '1fr 1fr' }} gap={4} mb={6}>
        <Box>
          <Typography variant="h5" fontWeight={800} gutterBottom mb={3}>
            Workout Volume
          </Typography>
          <Card sx={styles.barChartCard(theme)}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.volumeHistory || []}>
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.1)} vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  stroke={theme.palette.text.secondary}
                  tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke={theme.palette.text.secondary}
                  tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="volume"
                  fill={theme.palette.primary.main}
                  name="Total Volume (lbs)"
                  radius={[6, 6, 0, 0]}
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Box>

        <Box>
          <Typography variant="h5" fontWeight={800} gutterBottom mb={3}>
            Monthly Consistency
          </Typography>
          <Card sx={styles.barChartCard(theme)}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.monthlyConsistency || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.1)} horizontal={false} />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="month"
                  type="category"
                  stroke={theme.palette.text.secondary}
                  tick={{ fill: theme.palette.text.secondary, fontSize: 12, fontWeight: 600 }}
                  tickLine={false}
                  axisLine={false}
                  width={80}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="count"
                  fill={theme.palette.secondary.main}
                  name="Workouts"
                  radius={[0, 4, 4, 0]}
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Box>
      </Box>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} mt={4}>
        <Typography variant="h5" fontWeight={800}>Exercise Progression</Typography>
        <FormControl size="small" sx={styles.exerciseSelect}>
          <InputLabel>Select Exercise</InputLabel>
          <Select
            value={selectedExercise}
            label="Select Exercise"
            onChange={(e) => setSelectedExercise(e.target.value)}
            sx={styles.selectControl}
          >
            {Object.keys(analytics?.exerciseProgression || {}).map(ex => (
              <MenuItem key={ex} value={ex}>{ex}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Card sx={styles.chartCard(theme)}>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={analytics?.exerciseProgression[selectedExercise] || []}>
            <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.1)} />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => new Date(date).toLocaleDateString()}
              stroke={theme.palette.text.secondary}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke={theme.palette.text.secondary}
              tickLine={false}
              axisLine={false}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Line
              type="monotone"
              dataKey="weight"
              stroke={theme.palette.warning.main}
              name="Max weight (lbs)"
              strokeWidth={3}
              dot={{ r: 4, fill: theme.palette.warning.main, strokeWidth: 2, stroke: theme.palette.background.paper }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Typography variant="h5" fontWeight={800} gutterBottom mb={3}>
        Personal Records
      </Typography>
      <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }} gap={3}>
        {Object.entries(records).map(([exercise, record]: [string, PersonalRecord]) => (
          <motion.div variants={itemVariants} key={exercise}>
            <Card sx={styles.prCard(theme)}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1.5}>
                  <TrophyIcon sx={styles.prTitle} />
                  <Typography variant="subtitle1" fontWeight={700} noWrap>{exercise}</Typography>
                </Box>
                <Typography variant="h4" fontWeight={800} color="secondary.main" sx={styles.prValue}>
                  {record.weight} <Typography variant="caption" sx={styles.prUnit}>lbs</Typography>
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={styles.prDetail}>
                  {record.reps} reps • {new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </Box>

      {/* Add Metric Dialog */}
      <Dialog
        open={openAddMetric}
        onClose={() => setOpenAddMetric(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: styles.dialogPaper }}
      >
        <DialogTitle component="div" sx={styles.dialogTitle}>
          <Typography variant="h5" fontWeight={700}>Add Body Metrics</Typography>
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                label="Weight (lbs)"
                type="number"
                value={newMetric.weight}
                onChange={(e) => setNewMetric({ ...newMetric, weight: e.target.value })}
                InputProps={{ sx: styles.textFieldInput }}
              />
              <TextField
                fullWidth
                label="Body Fat %"
                type="number"
                value={newMetric.bodyFatPercentage}
                onChange={(e) => setNewMetric({ ...newMetric, bodyFatPercentage: e.target.value })}
                InputProps={{ sx: styles.textFieldInput }}
              />
            </Box>
            <Typography variant="subtitle2" color="primary" sx={styles.measurementTitle}>
              MEASUREMENTS (INCHES)
            </Typography>
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
              {['neck', 'chest', 'waist', 'hips', 'biceps', 'thighs'].map((field) => (
                <TextField
                  key={field}
                  label={field.charAt(0).toUpperCase() + field.slice(1)}
                  type="number"
                  value={newMetric[field as keyof typeof newMetric]}
                  onChange={(e) => setNewMetric({ ...newMetric, [field]: e.target.value })}
                  InputProps={{ sx: styles.textFieldInput }}
                  size="small"
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={styles.dialogActions}>
          <Button onClick={() => setOpenAddMetric(false)} sx={styles.genericButton} color="inherit">Cancel</Button>
          <Button variant="contained" onClick={handleAddMetric} sx={styles.genericButton}>
            Save Metrics
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
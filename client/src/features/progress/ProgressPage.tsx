import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Select, MenuItem, FormControl, InputLabel, useTheme, alpha
} from '@mui/material';
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

const StatCard = ({ title, value, unit, icon: Icon, color }: { title: string, value: string | number, unit?: string, icon: any, color: string }) => (
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
      <Box display="flex" alignItems="baseline" gap={0.5}>
        <Typography variant="h3" fontWeight={800} sx={{ color: 'text.primary' }}>
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

const CustomTooltip = ({ active, payload, label }: any) => {
  const theme = useTheme();
  if (active && payload && payload.length) {
    return (
      <Box sx={{
        bgcolor: alpha(theme.palette.background.paper, 0.9),
        p: 2,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        boxShadow: theme.shadows[3],
        backdropFilter: 'blur(4px)'
      }}>
        <Typography variant="subtitle2" fontWeight={700} mb={1}>{label}</Typography>
        {payload.map((entry: any, index: number) => (
          <Box key={index} display="flex" alignItems="center" gap={1} mb={0.5}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: entry.color }} />
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
  const [metrics, setMetrics] = useState<any[]>([]);
  const [records, setRecords] = useState<any>({});
  const [streak, setStreak] = useState(0);
  const [analytics, setAnalytics] = useState<any>(null);
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
    <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible" sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 3 } }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={5} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{
            background: `linear-gradient(45deg, ${theme.palette.text.primary} 30%, ${theme.palette.primary.main} 90%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
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
          sx={{ borderRadius: 2, px: 3, fontWeight: 600, boxShadow: theme.shadows[4] }}
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
            value={metrics[0]?.weight || 'N/A'}
            unit={metrics[0]?.weight ? 'lbs' : ''}
            icon={ChartIcon}
            color={theme.palette.primary.main}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            title="Body Fat %"
            value={metrics[0]?.bodyFatPercentage || 'N/A'}
            unit={metrics[0]?.bodyFatPercentage ? '%' : ''}
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
      <Card sx={{
        mb: 6,
        p: 3,
        borderRadius: 3,
        boxShadow: theme.shadows[2],
        border: `1px solid ${theme.palette.divider}`
      }}>
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
          <Card sx={{
            p: 3,
            borderRadius: 3,
            boxShadow: theme.shadows[2],
            border: `1px solid ${theme.palette.divider}`,
            height: '100%',
            minHeight: 400
          }}>
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
          <Card sx={{
            p: 3,
            borderRadius: 3,
            boxShadow: theme.shadows[2],
            border: `1px solid ${theme.palette.divider}`,
            height: '100%',
            minHeight: 400
          }}>
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
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Select Exercise</InputLabel>
          <Select
            value={selectedExercise}
            label="Select Exercise"
            onChange={(e) => setSelectedExercise(e.target.value)}
            sx={{ borderRadius: 2 }}
          >
            {Object.keys(analytics?.exerciseProgression || {}).map(ex => (
              <MenuItem key={ex} value={ex}>{ex}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Card sx={{
        mb: 6,
        p: 3,
        borderRadius: 3,
        boxShadow: theme.shadows[2],
        border: `1px solid ${theme.palette.divider}`
      }}>
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
        {Object.entries(records).map(([exercise, record]: [string, any]) => (
          <motion.div variants={itemVariants} key={exercise}>
            <Card sx={{
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(8px)',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[4] }
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1.5}>
                  <TrophyIcon sx={{ mr: 1, color: theme.palette.warning.main, fontSize: 20 }} />
                  <Typography variant="subtitle1" fontWeight={700} noWrap>{exercise}</Typography>
                </Box>
                <Typography variant="h4" fontWeight={800} color="secondary.main" sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                  {record.weight} <Typography variant="caption" sx={{ opacity: 0.7, fontWeight: 600 }}>lbs</Typography>
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
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
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle component="div" sx={{ pb: 1 }}>
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
                InputProps={{ sx: { borderRadius: 2 } }}
              />
              <TextField
                fullWidth
                label="Body Fat %"
                type="number"
                value={newMetric.bodyFatPercentage}
                onChange={(e) => setNewMetric({ ...newMetric, bodyFatPercentage: e.target.value })}
                InputProps={{ sx: { borderRadius: 2 } }}
              />
            </Box>
            <Typography variant="subtitle2" color="primary" sx={{ mt: 1, fontWeight: 600 }}>
              MEASUREMENTS (INCHES)
            </Typography>
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
              {['neck', 'chest', 'waist', 'hips', 'biceps', 'thighs'].map((field) => (
                <TextField
                  key={field}
                  label={field.charAt(0).toUpperCase() + field.slice(1)}
                  type="number"
                  value={(newMetric as any)[field]}
                  onChange={(e) => setNewMetric({ ...newMetric, [field]: e.target.value })}
                  InputProps={{ sx: { borderRadius: 2 } }}
                  size="small"
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={() => setOpenAddMetric(false)} sx={{ borderRadius: 2, fontWeight: 600 }} color="inherit">Cancel</Button>
          <Button variant="contained" onClick={handleAddMetric} sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}>
            Save Metrics
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
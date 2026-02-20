import { useState, useEffect } from 'react';
import {
    Box, Typography, Card, CardContent, TextField, Button,
    Stack, Chip, useTheme, alpha, type Theme, CircularProgress, Grid
} from '@mui/material';

import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Area, ComposedChart
} from 'recharts';
import {
    Timeline as TimelineIcon,
    TrendingUp as GainIcon,
    PrecisionManufacturing as ModelIcon,
    AdsClick as GoalIcon,
    Warning as WarningIcon,
    CheckCircle as OptimalIcon
} from '@mui/icons-material';
import { workoutService } from '../../services';
import type { AdvancedAnalytics } from '../../types';
import { motion } from 'framer-motion';

interface AdvancedAnalyticsDashboardProps {
    exercise: string;
}

const styles = {
    card: (theme: Theme) => ({
        mb: 8,
        borderRadius: 2,
        border: '1px solid',
        borderColor: theme.palette.divider,
        bgcolor: alpha(theme.palette.background.paper, 0.4),
        backdropFilter: 'blur(20px)',
        overflow: 'hidden'
    }),
    statItem: (theme: Theme) => ({
        flex: 1,
        p: 3,
        borderRight: `1px solid ${theme.palette.divider}`,
        '&:last-child': { borderRight: 'none' }
    }),
    predictionBox: (theme: Theme) => ({
        p: 3,
        bgcolor: alpha(theme.palette.primary.main, 0.05),
        borderRadius: 1.5,
        border: `1px dashed ${alpha(theme.palette.primary.main, 0.3)}`
    })
};

export default function AdvancedAnalyticsDashboard({ exercise }: AdvancedAnalyticsDashboardProps) {
    const theme = useTheme();
    const [loading, setLoading] = useState(false);
    const [analytics, setAnalytics] = useState<AdvancedAnalytics | null>(null);
    const [targetWeight, setTargetWeight] = useState<string>('');

    const fetchAnalytics = async (weight?: number) => {
        try {
            setLoading(true);
            const res = await workoutService.getAdvancedAnalytics(exercise, weight);
            if (res.status === 'success') {
                setAnalytics(res.data.analytics);
            }
        } catch (error) {
            console.error('Failed to fetch statistical analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (exercise) fetchAnalytics();
    }, [exercise]);

    const handlePredict = () => {
        const weight = parseFloat(targetWeight);
        if (!isNaN(weight)) {
            fetchAnalytics(weight);
        }
    };

    if (!analytics && loading) return <Box display="flex" justifyContent="center" p={8}><CircularProgress /></Box>;
    if (!analytics) return null;

    // Prepare chart data with regression line
    const chartData = analytics.history.map((h, i) => ({
        ...h,
        displayDate: new Date(h.date).toLocaleDateString(),
        // Simple visualization of regression
        trend: analytics.current1RM - (analytics.history.length - 1 - i) * (analytics.rateOfGain / 7),
        confidenceUpper: (analytics.current1RM - (analytics.history.length - 1 - i) * (analytics.rateOfGain / 7)) + analytics.marginOfError,
        confidenceLower: (analytics.current1RM - (analytics.history.length - 1 - i) * (analytics.rateOfGain / 7)) - analytics.marginOfError,
    }));

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Box mb={4}>
                <Typography variant="overline" fontWeight={900} color="primary" letterSpacing={2}>
                    STATISTICAL INTELLIGENCE
                </Typography>
                <Typography variant="h3" fontWeight={950} letterSpacing="-1.5px" mb={1}>
                    PERFORMANCE <Box component="span" sx={{ color: 'primary.main' }}>MODELING</Box>
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Advanced regression analysis for {exercise.toUpperCase()}. Predictive modeling based on historical 1RM velocity.
                </Typography>
            </Box>

            <Card sx={styles.card(theme)}>
                <Stack direction={{ xs: 'column', md: 'row' }}>
                    <Box sx={styles.statItem(theme)}>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <GainIcon color="primary" fontSize="small" />
                            <Typography variant="overline" fontWeight={900} opacity={0.6}>WEEKLY VELOCITY</Typography>
                        </Box>
                        <Typography variant="h4" fontWeight={950}>{analytics.rateOfGain.toFixed(2)}kg <Typography component="span" fontWeight={900} color="text.secondary">/ WK</Typography></Typography>
                        <Chip
                            size="small"
                            label={analytics.isDecelerating ? "DECELERATING" : "OPTIMAL VOLUME"}
                            color={analytics.isDecelerating ? "warning" : "success"}
                            icon={analytics.isDecelerating ? <WarningIcon /> : <OptimalIcon />}
                            sx={{ mt: 1, fontWeight: 900, fontSize: '0.6rem' }}
                        />
                    </Box>

                    <Box sx={styles.statItem(theme)}>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <ModelIcon color="secondary" fontSize="small" />
                            <Typography variant="overline" fontWeight={900} opacity={0.6}>MODEL CONFIDENCE</Typography>
                        </Box>
                        <Typography variant="h4" fontWeight={950}>{(analytics.rSquared * 100).toFixed(1)}%</Typography>
                        <Typography variant="caption" fontWeight={700} color="text.secondary">R² ACCURACY SCORE</Typography>
                    </Box>

                    <Box sx={styles.statItem(theme)}>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <GoalIcon color="info" fontSize="small" />
                            <Typography variant="overline" fontWeight={900} opacity={0.6}>CURRENT CEILING</Typography>
                        </Box>
                        <Typography variant="h4" fontWeight={950}>{analytics.current1RM}kg</Typography>
                        <Typography variant="caption" fontWeight={700} color="text.secondary">ESTIMATED 1RM</Typography>
                    </Box>
                </Stack>

                <Box p={4}>
                    <Grid container spacing={4}>
                        <Grid item xs={12} lg={8}>
                            <Box height={350}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.text.primary, 0.05)} />
                                        <XAxis dataKey="displayDate" hide />
                                        <YAxis orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                                        <Tooltip />
                                        <Area
                                            type="monotone"
                                            dataKey="confidenceUpper"
                                            stroke="none"
                                            fill={alpha(theme.palette.primary.main, 0.1)}
                                            name="Confidence Interval"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="confidenceLower"
                                            stroke="none"
                                            fill={alpha(theme.palette.background.paper, 1)}
                                            baseValue="dataMin"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="weight"
                                            stroke={theme.palette.text.primary}
                                            strokeWidth={3}
                                            dot={{ r: 4, fill: theme.palette.text.primary }}
                                            name="Historical 1RM"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="trend"
                                            stroke={theme.palette.primary.main}
                                            strokeDasharray="5 5"
                                            strokeWidth={2}
                                            dot={false}
                                            name="Regression Line"
                                        />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </Box>
                        </Grid>

                        <Grid item xs={12} lg={4}>
                            <Box sx={styles.predictionBox(theme)}>
                                <Typography variant="overline" fontWeight={900} color="primary" letterSpacing={1}>GOAL PROJECTION</Typography>
                                <Box display="flex" gap={1} mt={2}>
                                    <TextField
                                        size="small"
                                        label="TARGET KG"
                                        value={targetWeight}
                                        onChange={(e) => setTargetWeight(e.target.value)}
                                        sx={{ bgcolor: 'background.paper' }}
                                    />
                                    <Button variant="contained" onClick={handlePredict} sx={{ fontWeight: 900 }}>FORECAST</Button>
                                </Box>

                                {analytics.prediction.predictedDate && (
                                    <Box mt={4}>
                                        <Typography variant="h5" fontWeight={950}>{analytics.prediction.daysToGoal} DAYS</Typography>
                                        <Typography variant="body2" fontWeight={700} opacity={0.6}>
                                            Estimated achievement date: {new Date(analytics.prediction.predictedDate).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                )}

                                <Box mt={4}>
                                    <Typography variant="caption" fontWeight={900} opacity={0.5} display="block" mb={2}>PROJECTED REACH</Typography>
                                    <Stack spacing={2}>
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography variant="body2" fontWeight={800}>30 DAYS</Typography>
                                            <Typography variant="body2" fontWeight={900} color="primary">{analytics.prediction.forecast30Days.toFixed(1)}kg</Typography>
                                        </Box>
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography variant="body2" fontWeight={800}>60 DAYS</Typography>
                                            <Typography variant="body2" fontWeight={900} color="primary">{analytics.prediction.forecast60Days.toFixed(1)}kg</Typography>
                                        </Box>
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography variant="body2" fontWeight={800}>90 DAYS</Typography>
                                            <Typography variant="body2" fontWeight={900} color="primary">{analytics.prediction.forecast90Days.toFixed(1)}kg</Typography>
                                        </Box>
                                    </Stack>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Card>
        </motion.div>
    );
}

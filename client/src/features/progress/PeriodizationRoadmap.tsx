import { useState, useEffect } from 'react';
import {
    Box, Typography, Card, CardContent, Button, Stack,
    useTheme, alpha, type Theme, Chip
} from '@mui/material';
import {
    TrendingUp as ProgressIcon,
    LockReset as ResetIcon
} from '@mui/icons-material';
import { workoutService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { type PeriodizedProgram, PhaseType } from '../../types';

interface PeriodizationRoadmapProps {
    onUpdate?: () => void;
}

const styles = {
    roadmapCard: (theme: Theme) => ({
        mb: 8,
        borderRadius: 2,
        border: '1px solid',
        borderColor: theme.palette.divider,
        bgcolor: alpha(theme.palette.background.paper, 0.4),
        backdropFilter: 'blur(20px)',
        overflow: 'hidden'
    }),
    phaseBox: (theme: Theme, isActive: boolean) => ({

        flex: 1,
        p: 3,
        borderRight: `1px solid ${theme.palette.divider}`,
        bgcolor: isActive ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
        transition: 'all 0.3s ease',
        '&:last-of-type': { borderRight: 'none' },
        opacity: isActive ? 1 : 0.6
    }),
    weekNode: (theme: Theme, isCurrent: boolean, isPast: boolean) => ({
        width: 24,
        height: 24,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: isCurrent ? 'primary.main' : (isPast ? 'secondary.main' : alpha(theme.palette.text.primary, 0.1)),
        color: '#fff',
        fontSize: '0.6rem',
        fontWeight: 900,
        transition: 'all 0.3s ease',
        transform: isCurrent ? 'scale(1.2)' : 'scale(1)',
        boxShadow: isCurrent ? `0 0 20px ${alpha(theme.palette.primary.main, 0.5)}` : 'none'
    }),
    initiateButton: {
        borderRadius: 0,
        fontWeight: 950,
        letterSpacing: '2px',
        textTransform: 'uppercase',
        py: 2,
        px: 4
    }
};

export default function PeriodizationRoadmap({ onUpdate }: PeriodizationRoadmapProps) {
    const theme = useTheme();
    const { showToast } = useToast();
    const [program, setProgram] = useState<PeriodizedProgram | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProgram();
    }, []);

    const fetchProgram = async () => {
        try {
            setLoading(true);
            const res = await workoutService.getActiveProgram();
            if (res.status === 'success') {
                setProgram(res.data.program);
            }
        } catch (error) {
            console.error('Failed to fetch program:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInitiate = async () => {
        try {
            const res = await workoutService.initiateProgram();
            if (res.status === 'success') {
                setProgram(res.data.program);
                showToast('12-Week Protocol Initiated!', 'success');
                if (onUpdate) onUpdate();
            }
        } catch (error) {
            showToast('Initialization failed', 'error');
        }
    };

    if (loading) return null;

    return (
        <Card sx={styles.roadmapCard(theme)}>
            {!program ? (
                <CardContent sx={{ textAlign: 'center', p: 6 }}>
                    <ProgressIcon sx={{ fontSize: '4rem', color: 'primary.main', opacity: 0.2, mb: 2 }} />
                    <Typography variant="h4" fontWeight={950} letterSpacing="-1.5px" mb={2}>
                        INITIALIZE <Box component="span" sx={{ color: 'primary.main' }}>PERIODIZATION</Box>
                    </Typography>
                    <Typography variant="body1" color="text.secondary" mb={4} sx={{ maxWidth: 500, mx: 'auto' }}>
                        Unlock elite 12-week programming with auto-adjusting weights based on your historical performance logs.
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={handleInitiate}
                        sx={styles.initiateButton}
                    >
                        START 12-WEEK PROTOCOL
                    </Button>
                </CardContent>
            ) : (
                <Box>
                    <Box sx={{ p: 4, bgcolor: alpha(theme.palette.primary.main, 0.05), borderBottom: `1px solid ${theme.palette.divider}` }}>
                        <Typography sx={{ color: 'primary.main', fontWeight: 900, letterSpacing: '4px', textTransform: 'uppercase', fontSize: '0.7rem', mb: 1 }}>
                            ACTIVE EVOLUTION PROTOCOL
                        </Typography>
                        <Typography variant="h4" fontWeight={950} letterSpacing="-1px">
                            12-WEEK <Box component="span" sx={{ color: 'primary.main' }}>ELITE PROGRAM</Box>
                        </Typography>
                    </Box>

                    <Stack direction={{ xs: 'column', md: 'row' }}>
                        {program.phases.map((phase, idx: number) => {
                            const isActive = program.currentWeek >= phase.startWeek && program.currentWeek <= phase.endWeek;

                            return (
                                <Box key={idx} sx={styles.phaseBox(theme, isActive)}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                        <Typography variant="overline" fontWeight={900} letterSpacing={2} color={isActive ? 'primary.main' : 'text.secondary'}>
                                            {phase.type}
                                        </Typography>
                                        {isActive && <Chip label="ACTIVE" size="small" color="primary" sx={{ fontWeight: 900, height: 20 }} />}
                                    </Box>

                                    <Stack direction="row" spacing={1} mb={3}>
                                        {Array.from({ length: phase.endWeek - phase.startWeek + 1 }).map((_, wIdx) => {
                                            const weekNum = phase.startWeek + wIdx;
                                            const isCurrent = weekNum === program.currentWeek;
                                            const isPast = weekNum < program.currentWeek;
                                            return (
                                                <Box key={weekNum} sx={styles.weekNode(theme, isCurrent, isPast)}>
                                                    {weekNum}
                                                </Box>
                                            );
                                        })}
                                    </Stack>

                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, opacity: 0.8 }}>
                                        {phase.type === PhaseType.HYPERTROPHY && "Build mass with 60-75% intensity."}
                                        {phase.type === PhaseType.STRENGTH && "Develop power with 80-90% intensity."}
                                        {phase.type === PhaseType.PEAKING && "Reach max output with 90-100% intensity."}
                                    </Typography>
                                </Box>
                            );
                        })}
                    </Stack>

                    <Box sx={{ p: 2, textAlign: 'center', borderTop: `1px solid ${theme.palette.divider}` }}>
                        <Button
                            startIcon={<ResetIcon />}
                            size="small"
                            onClick={handleInitiate}
                            sx={{ fontWeight: 900, opacity: 0.5, '&:hover': { opacity: 1 } }}
                        >
                            RESTART PROTOCOL
                        </Button>
                    </Box>
                </Box>
            )}
        </Card>
    );
}

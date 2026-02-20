import { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Button, Chip,
    useTheme, alpha, Select, MenuItem, FormControl,
    InputLabel, Stack, CircularProgress, Table,
    TableBody, TableCell, TableContainer, TableHead,
    TableRow, Paper, TextField
} from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import { motion } from 'framer-motion';
import { studioService, type Studio, type ReconciliationReport } from '../../services/studio.service';
import type { Theme } from '@mui/material';
import { format } from 'date-fns';

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
            ? `linear-gradient(rgba(6, 9, 15, 0.75), rgba(6, 9, 15, 1)), url(https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop)`
            : `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.95)), url(https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop)`,
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
            content: '"FINANCE"',
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
        mb: 3,
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
    filterCard: (theme: Theme) => ({
        p: 3,
        borderRadius: 2,
        bgcolor: alpha(theme.palette.background.paper, 0.4),
        backdropFilter: 'blur(20px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        mb: 6
    }),
    statCard: (theme: Theme) => ({
        borderRadius: 2,
        bgcolor: alpha(theme.palette.background.paper, 0.4),
        backdropFilter: 'blur(20px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        p: 3,
        transition: 'all 0.3s ease',
        '&:hover': {
            borderColor: alpha(theme.palette.primary.main, 0.3),
            transform: 'translateY(-4px)'
        }
    }),
    tableContainer: (theme: Theme) => ({
        borderRadius: 2,
        bgcolor: alpha(theme.palette.background.paper, 0.4),
        backdropFilter: 'blur(20px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        mt: 4
    }),
    tableHead: (theme: Theme) => ({
        bgcolor: alpha(theme.palette.primary.main, 0.05),
        '& th': {
            fontWeight: 900,
            letterSpacing: '1px',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            color: theme.palette.primary.main,
            borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`
        }
    }),
    inputField: (theme: Theme) => ({
        '& .MuiOutlinedInput-root': {
            borderRadius: 1,
            bgcolor: alpha(theme.palette.background.paper, 0.5),
            '& fieldset': { borderColor: theme.palette.divider },
            '&:hover fieldset': { borderColor: 'primary.main' },
        }
    })
};

export default function FinancialReconciliationPage() {
    const theme = useTheme();
    const [studios, setStudios] = useState<Studio[]>([]);
    const [selectedStudioId, setSelectedStudioId] = useState('');
    const [report, setReport] = useState<ReconciliationReport | null>(null);
    const [loading, setLoading] = useState(false);
    const [studiosLoading, setStudiosLoading] = useState(true);

    const today = new Date();
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const [startDate, setStartDate] = useState(format(firstOfMonth, 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(today, 'yyyy-MM-dd'));

    useEffect(() => {
        const fetchStudios = async () => {
            try {
                const res = await studioService.getStudios();
                const studiosData: Studio[] = res.data?.studios || [];
                setStudios(studiosData);
                if (studiosData.length > 0) setSelectedStudioId(studiosData[0]._id);
            } catch (err) {
                console.error('Failed to fetch studios', err);
            } finally {
                setStudiosLoading(false);
            }
        };
        fetchStudios();
    }, []);

    const fetchReport = useCallback(async () => {
        if (!selectedStudioId) return;
        setLoading(true);
        try {
            const res = await studioService.getReconciliation(selectedStudioId, startDate, endDate);
            setReport(res.data?.report || res.data || null);
        } catch (err) {
            console.error('Failed to fetch reconciliation report', err);
        } finally {
            setLoading(false);
        }
    }, [selectedStudioId, startDate, endDate]);

    useEffect(() => {
        if (selectedStudioId) fetchReport();
    }, [selectedStudioId]);

    const statCards = report ? [
        {
            label: 'GROSS REVENUE',
            value: `₹${(report.totalRevenue || 0).toLocaleString()}`,
            icon: <AccountBalanceIcon />,
            color: theme.palette.success.main
        },
        {
            label: 'INSTRUCTOR PAYOUTS',
            value: `₹${(report.instructorShare || 0).toLocaleString()}`,
            icon: <PeopleIcon />,
            color: theme.palette.warning.main
        },
        {
            label: 'NET REVENUE',
            value: `₹${(report.netRevenue || 0).toLocaleString()}`,
            icon: <TrendingUpIcon />,
            color: theme.palette.primary.main
        },
        {
            label: 'MARGIN',
            value: report.totalRevenue > 0
                ? `${(((report.netRevenue || 0) / report.totalRevenue) * 100).toFixed(1)}%`
                : '0%',
            icon: <TrendingUpIcon />,
            color: theme.palette.info.main
        },
        {
            label: 'CROSS-LOC. PAYABLE',
            value: `₹${(report.crossLocation?.totalPayable || 0).toLocaleString()}`,
            icon: <AccountBalanceIcon />,
            color: theme.palette.error.main
        },
        {
            label: 'CROSS-LOC. RECEIVABLE',
            value: `₹${(report.crossLocation?.totalReceivable || 0).toLocaleString()}`,
            icon: <AccountBalanceIcon />,
            color: theme.palette.success.dark
        },
    ] : [];

    return (
        <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} sx={styles.pageContainer}>
            {/* Hero */}
            <Box sx={styles.headerHero(theme)}>
                <Box>
                    <Typography sx={styles.sectionLabel}>ADMIN INTELLIGENCE</Typography>
                    <Typography variant="h1" sx={styles.headerTitle(theme)}>
                        FINANCIAL <Box component="span">INTEL</Box>
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 600, fontWeight: 400, lineHeight: 1.6 }}>
                        Cross-studio revenue analysis. Track payables, receivables, and instructor compensation with surgical precision.
                    </Typography>
                </Box>
                <Chip
                    label="ADMIN ONLY"
                    color="warning"
                    size="small"
                    sx={{ fontWeight: 900, borderRadius: 0.5, letterSpacing: '1px', position: 'relative', zIndex: 1 }}
                />
            </Box>

            <Box sx={styles.contentWrapper}>
                {/* Filters */}
                <Box sx={styles.filterCard(theme)}>
                    <Typography sx={{ ...styles.sectionLabel, mb: 2 }}>FILTER PARAMETERS</Typography>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
                        <FormControl sx={{ minWidth: 220, ...styles.inputField(theme) }}>
                            <InputLabel>Studio</InputLabel>
                            <Select
                                value={selectedStudioId}
                                onChange={(e) => setSelectedStudioId(e.target.value)}
                                label="Studio"
                                disabled={studiosLoading}
                            >
                                {studios.map(s => (
                                    <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            label="Start Date"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            sx={styles.inputField(theme)}
                        />
                        <TextField
                            label="End Date"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            sx={styles.inputField(theme)}
                        />
                        <Button
                            variant="contained"
                            onClick={fetchReport}
                            startIcon={<RefreshIcon />}
                            disabled={loading || !selectedStudioId}
                            sx={{ fontWeight: 900, borderRadius: 1, letterSpacing: '1px', py: 1.5, px: 4, flexShrink: 0 }}
                        >
                            GENERATE REPORT
                        </Button>
                    </Stack>
                </Box>

                {loading ? (
                    <Box display="flex" justifyContent="center" py={10}>
                        <CircularProgress size={60} />
                    </Box>
                ) : report ? (
                    <>
                        {/* Stat Cards */}
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3, 1fr)' },
                                gap: 3,
                                mb: 4
                            }}
                        >
                            {statCards.map((card) => (
                                <motion.div
                                    key={card.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <Box sx={styles.statCard(theme)}>
                                        <Box sx={{ color: card.color, mb: 1.5 }}>{card.icon}</Box>
                                        <Typography variant="caption" fontWeight={900} letterSpacing="2px" color="text.secondary" display="block" mb={0.5}>
                                            {card.label}
                                        </Typography>
                                        <Typography variant="h4" fontWeight={950} sx={{ color: card.color, letterSpacing: '-1px' }}>
                                            {card.value}
                                        </Typography>
                                    </Box>
                                </motion.div>
                            ))}
                        </Box>

                        {/* Period info */}
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="body2" color="text.secondary" fontWeight={700}>
                                Period: {report.period?.start && format(new Date(report.period.start), 'dd MMM yyyy')} — {report.period?.end && format(new Date(report.period.end), 'dd MMM yyyy')}
                            </Typography>
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<DownloadIcon />}
                                sx={{ fontWeight: 900, borderRadius: 0.5, letterSpacing: '1px' }}
                                onClick={() => {
                                    const csv = [
                                        ['Instructor', 'Sessions', 'Payment'],
                                        ...(report.breakdown || []).map(b => [b.instructor, b.sessions, `₹${b.payment}`])
                                    ].map(row => row.join(',')).join('\n');
                                    const blob = new Blob([csv], { type: 'text/csv' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `reconciliation_${selectedStudioId}_${startDate}.csv`;
                                    a.click();
                                }}
                            >
                                EXPORT CSV
                            </Button>
                        </Box>

                        {/* Breakdown Table */}
                        <TableContainer component={Paper} sx={styles.tableContainer(theme)}>
                            <Table>
                                <TableHead sx={styles.tableHead(theme)}>
                                    <TableRow>
                                        <TableCell>Instructor</TableCell>
                                        <TableCell align="center">Sessions Taught</TableCell>
                                        <TableCell align="right">Payout Amount</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(report.breakdown || []).length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                                                No instructor payout data available for this period.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        (report.breakdown || []).map((row, i) => (
                                            <TableRow
                                                key={i}
                                                sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) } }}
                                            >
                                                <TableCell sx={{ fontWeight: 700 }}>{row.instructor}</TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        label={row.sessions}
                                                        size="small"
                                                        sx={{ fontWeight: 900, borderRadius: 0.5, minWidth: 40 }}
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography fontWeight={900} color="warning.main">
                                                        ₹{(row.payment || 0).toLocaleString()}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </>
                ) : (
                    <Box textAlign="center" py={10}>
                        <AccountBalanceIcon sx={{ fontSize: 80, color: 'primary.main', opacity: 0.2, mb: 3 }} />
                        <Typography variant="h6" color="text.secondary" fontWeight={700}>
                            Select a studio and generate a report to begin
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
}

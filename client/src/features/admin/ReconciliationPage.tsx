import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, CircularProgress,
    FormControl, InputLabel, Select, MenuItem, Button,
    useTheme, alpha, TextField, Chip
} from '@mui/material';
import { motion, type Variants } from 'framer-motion';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import FilterListIcon from '@mui/icons-material/FilterList';
import api from '../../services/api';
import { studioService } from '../../services/studio.service';
import type { Theme } from '@mui/material/styles';

interface ReconciliationLog {
    _id: string;
    homeStudio: { _id: string; name: string };
    hostStudio: { _id: string; name: string };
    member: { _id: string; fullName: string; email: string };
    amount: number;
    status: 'PENDING' | 'SETTLED';
    createdAt: string;
}

interface Studio {
    _id: string;
    name: string;
    address: string;
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
};

const styles = {
    pageContainer: {
        p: 0, bgcolor: 'background.default', minHeight: '100vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden'
    },
    headerHero: (theme: Theme) => ({
        pt: { xs: 10, md: 14 }, pb: { xs: 8, md: 12 }, px: { xs: 3, md: 6 },
        position: 'relative',
        backgroundImage: theme.palette.mode === 'dark'
            ? `linear-gradient(rgba(6, 9, 15, 0.8), rgba(6, 9, 15, 1)), url(https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2070&auto=format&fit=crop)`
            : `linear-gradient(rgba(255,255,255,0.85), rgba(255,255,255,0.98)), url(https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2070&auto=format&fit=crop)`,
        backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        flexWrap: 'wrap', gap: 4, borderBottom: `1px solid ${theme.palette.divider}`,
        '&::before': {
            content: '"FINANCE"',
            position: 'absolute', top: '20%', left: '5%',
            fontSize: { xs: '5rem', md: '12rem' }, fontWeight: 950,
            color: theme.palette.mode === 'dark' ? alpha('#fff', 0.02) : alpha('#000', 0.02),
            letterSpacing: '20px', zIndex: 0, pointerEvents: 'none', lineHeight: 0.8
        }
    }),
    headerTitle: (theme: Theme) => ({
        fontWeight: 950, fontSize: { xs: '3rem', md: '5.5rem' },
        lineHeight: 0.85, letterSpacing: '-4px', color: theme.palette.text.primary,
        textTransform: 'uppercase', mb: 2, position: 'relative', zIndex: 1,
        '& span': { color: theme.palette.primary.main }
    }),
    sectionLabel: {
        color: 'primary.main', fontWeight: 900, letterSpacing: '5px', mb: 4,
        display: 'block', textTransform: 'uppercase', fontSize: '0.7rem', opacity: 0.8
    },
    contentWrapper: {
        px: { xs: 3, md: 6 }, py: { xs: 4, md: 8 }, maxWidth: 1400,
        mx: 'auto', width: '100%', flexGrow: 1, zIndex: 1
    },
    card: (theme: Theme) => ({
        borderRadius: 2,
        background: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.4 : 0.8),
        backdropFilter: 'blur(24px) saturate(180%)',
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.palette.mode === 'dark'
            ? `inset 0 0 20px -10px ${alpha('#fff', 0.05)}, 0 20px 50px -20px rgba(0,0,0,0.5)`
            : `0 20px 50px -20px ${alpha(theme.palette.common.black, 0.08)}`,
        overflow: 'hidden'
    }),
    tableHead: (theme: Theme) => ({
        bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.05 : 0.08),
        '& .MuiTableCell-root': {
            color: 'primary.main', fontWeight: 950, letterSpacing: '2px',
            textTransform: 'uppercase', fontSize: '0.65rem', py: 2.5,
            borderBottom: `1px solid ${theme.palette.divider}`
        }
    }),
    filterRow: {
        p: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center',
        borderBottom: (theme: Theme) => `1px solid ${theme.palette.divider}`
    },
    inputField: (theme: Theme) => ({
        '& .MuiOutlinedInput-root': {
            borderRadius: 0,
            bgcolor: alpha(theme.palette.text.primary, 0.02),
            '& fieldset': { borderColor: theme.palette.divider },
            '&:hover fieldset': { borderColor: 'primary.main' },
        }
    }),
};

export default function ReconciliationPage() {
    const theme = useTheme();
    const [studios, setStudios] = useState<Studio[]>([]);
    const [selectedStudio, setSelectedStudio] = useState('');
    const [logs, setLogs] = useState<ReconciliationLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        const fetchStudios = async () => {
            try {
                const res = await studioService.getStudios();
                setStudios(res.studios || []);
            } catch (e) { console.error(e); }
        };
        fetchStudios();
    }, []);

    const fetchReconciliation = async () => {
        if (!selectedStudio) return;
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
            const res = await api.get(`/studios/${selectedStudio}/reconciliation?${params.toString()}`);
            const data = res.data?.data || res.data || {};
            setLogs(data.logs || []);
        } catch (e) {
            console.error(e);
            setLogs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedStudio) fetchReconciliation();
    }, [selectedStudio]);

    const totalPayable = logs
        .filter(l => l.homeStudio?._id === selectedStudio)
        .reduce((acc, l) => acc + (l.amount || 0), 0);
    const totalReceivable = logs
        .filter(l => l.hostStudio?._id === selectedStudio)
        .reduce((acc, l) => acc + (l.amount || 0), 0);

    return (
        <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible" sx={styles.pageContainer}>
            {/* Hero */}
            <Box sx={styles.headerHero(theme)}>
                <Box>
                    <Typography sx={styles.sectionLabel}>FINANCIAL OPS</Typography>
                    <Typography variant="h1" sx={styles.headerTitle(theme)}>
                        CROSS-LOCATION <Box component="span">RECONCILIATION</Box>
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 600, fontWeight: 400, lineHeight: 1.6, opacity: 0.8 }}>
                        Track inter-studio financial obligations. When members cross locations, this ledger captures all payables and receivables between studios.
                    </Typography>
                </Box>
            </Box>

            <Box sx={styles.contentWrapper}>
                {/* Summary Cards */}
                {selectedStudio && (
                    <motion.div variants={itemVariants}>
                        <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr 1fr' }} gap={3} mb={6}>
                            {[
                                {
                                    label: 'TOTAL PAYABLE',
                                    value: `₹${totalPayable.toFixed(2)}`,
                                    sublabel: `${selectedStudio ? studios.find(s => s._id === selectedStudio)?.name : ''} OWES OTHER STUDIOS`,
                                    color: theme.palette.error.main,
                                },
                                {
                                    label: 'TOTAL RECEIVABLE',
                                    value: `₹${totalReceivable.toFixed(2)}`,
                                    sublabel: 'OTHER STUDIOS OWE THIS STUDIO',
                                    color: theme.palette.success.main,
                                },
                                {
                                    label: 'NET BALANCE',
                                    value: `₹${(totalReceivable - totalPayable).toFixed(2)}`,
                                    sublabel: (totalReceivable - totalPayable) >= 0 ? 'NET RECEIVABLE' : 'NET PAYABLE',
                                    color: (totalReceivable - totalPayable) >= 0 ? theme.palette.success.main : theme.palette.error.main,
                                },
                            ].map(card => (
                                <Paper key={card.label} sx={{
                                    ...styles.card(theme), p: 3,
                                    borderTop: `3px solid ${card.color}`,
                                }}>
                                    <Typography variant="overline" sx={{ letterSpacing: '2px', fontWeight: 900, opacity: 0.6, display: 'block' }}>
                                        {card.label}
                                    </Typography>
                                    <Typography variant="h4" fontWeight={950} sx={{ color: card.color, letterSpacing: '-2px', my: 0.5 }}>
                                        {card.value}
                                    </Typography>
                                    <Typography variant="caption" fontWeight={700} sx={{ letterSpacing: '1px', opacity: 0.5 }}>
                                        {card.sublabel}
                                    </Typography>
                                </Paper>
                            ))}
                        </Box>
                    </motion.div>
                )}

                {/* Filter & Table */}
                <motion.div variants={itemVariants}>
                    <Paper sx={styles.card(theme)}>
                        {/* Filter Row */}
                        <Box sx={styles.filterRow}>
                            <FormControl size="small" sx={{ minWidth: 220, ...styles.inputField(theme) }}>
                                <InputLabel>SELECT STUDIO</InputLabel>
                                <Select
                                    value={selectedStudio}
                                    label="SELECT STUDIO"
                                    onChange={(e) => setSelectedStudio(e.target.value)}
                                    sx={{ borderRadius: 0 }}
                                >
                                    {studios.map(s => (
                                        <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>
                                    ))}
                                    {studios.length === 0 && <MenuItem disabled>No studios found</MenuItem>}
                                </Select>
                            </FormControl>
                            <TextField
                                size="small"
                                type="date"
                                label="FROM"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                sx={{ minWidth: 150, ...styles.inputField(theme) }}
                            />
                            <TextField
                                size="small"
                                type="date"
                                label="TO"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                sx={{ minWidth: 150, ...styles.inputField(theme) }}
                            />
                            <Button
                                variant="contained"
                                startIcon={<FilterListIcon />}
                                onClick={fetchReconciliation}
                                disabled={!selectedStudio || loading}
                                sx={{ borderRadius: 0, fontWeight: 900, letterSpacing: '2px', py: 1 }}
                            >
                                APPLY FILTER
                            </Button>
                        </Box>

                        {/* Table */}
                        {loading ? (
                            <Box display="flex" justifyContent="center" py={8}>
                                <CircularProgress color="primary" thickness={5} />
                            </Box>
                        ) : !selectedStudio ? (
                            <Box py={10} textAlign="center">
                                <AccountBalanceIcon sx={{ fontSize: 60, opacity: 0.1, mb: 2 }} />
                                <Typography variant="h6" fontWeight={900} sx={{ opacity: 0.3, textTransform: 'uppercase', letterSpacing: '3px' }}>
                                    SELECT A STUDIO TO VIEW RECONCILIATION DATA
                                </Typography>
                            </Box>
                        ) : logs.length === 0 ? (
                            <Box py={10} textAlign="center">
                                <SyncAltIcon sx={{ fontSize: 60, opacity: 0.1, mb: 2 }} />
                                <Typography variant="h6" fontWeight={900} sx={{ opacity: 0.3, textTransform: 'uppercase', letterSpacing: '3px' }}>
                                    NO CROSS-LOCATION TRANSACTIONS FOUND
                                </Typography>
                            </Box>
                        ) : (
                            <TableContainer>
                                <Table>
                                    <TableHead sx={styles.tableHead(theme)}>
                                        <TableRow>
                                            <TableCell>MEMBER</TableCell>
                                            <TableCell>HOME STUDIO</TableCell>
                                            <TableCell>HOST STUDIO (VISITED)</TableCell>
                                            <TableCell>AMOUNT</TableCell>
                                            <TableCell>TYPE</TableCell>
                                            <TableCell>STATUS</TableCell>
                                            <TableCell>DATE</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {logs.map(log => {
                                            const isPayable = log.homeStudio?._id === selectedStudio;
                                            return (
                                                <TableRow key={log._id} sx={{
                                                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) },
                                                    '& .MuiTableCell-root': {
                                                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                                                        fontSize: '0.85rem', fontWeight: 600, py: 2.5
                                                    }
                                                }}>
                                                    <TableCell>
                                                        <Typography variant="body2" fontWeight={900}>{log.member?.fullName?.toUpperCase()}</Typography>
                                                        <Typography variant="caption" sx={{ opacity: 0.5 }}>{log.member?.email}</Typography>
                                                    </TableCell>
                                                    <TableCell>{log.homeStudio?.name}</TableCell>
                                                    <TableCell>{log.hostStudio?.name}</TableCell>
                                                    <TableCell>
                                                        <Typography fontWeight={950} color={isPayable ? 'error.main' : 'success.main'}>
                                                            {isPayable ? '-' : '+'}₹{log.amount}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={isPayable ? 'PAYABLE' : 'RECEIVABLE'}
                                                            size="small"
                                                            sx={{
                                                                fontWeight: 950, fontSize: '0.6rem', borderRadius: 0, height: 22,
                                                                bgcolor: alpha(isPayable ? theme.palette.error.main : theme.palette.success.main, 0.1),
                                                                color: isPayable ? 'error.main' : 'success.main',
                                                                border: `1px solid ${alpha(isPayable ? theme.palette.error.main : theme.palette.success.main, 0.3)}`
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={log.status}
                                                            size="small"
                                                            sx={{
                                                                fontWeight: 950, fontSize: '0.6rem', borderRadius: 0, height: 22,
                                                                bgcolor: alpha(log.status === 'SETTLED' ? theme.palette.success.main : theme.palette.warning.main, 0.1),
                                                                color: log.status === 'SETTLED' ? 'success.main' : 'warning.main',
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ opacity: 0.7 }}>
                                                        {new Date(log.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Paper>
                </motion.div>
            </Box>
        </Box>
    );
}

import { useState, useEffect, useRef } from 'react';
import {
    Box, Typography, TextField, Button, CircularProgress,
    ToggleButton, ToggleButtonGroup, useTheme, alpha, Stack, Avatar, List,
    ListItem, ListItemAvatar, ListItemText, Divider, Chip, MenuItem, Select,
    FormControl, InputLabel,
    Paper
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PeopleIcon from '@mui/icons-material/People';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { bookingService } from '../../services/booking.service';
import { classService } from '../../services/class.service';
import { useToast } from '../../context/ToastContext';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import type { Theme } from '@mui/material/styles';
import type { ClassSession, Booking, User } from '../../types';
import { useAuth } from '../../context/AuthContext';

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
            ? `linear-gradient(rgba(6, 9, 15, 0.8), rgba(6, 9, 15, 1)), url(https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=2069&auto=format&fit=crop)`
            : `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.95)), url(https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=2069&auto=format&fit=crop)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'left',
        flexDirection: 'column',
        textAlign: 'left',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        '&::before': {
            content: '"ACCESS"',
            position: 'absolute',
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: { xs: '5rem', md: '12rem' },
            fontWeight: 950,
            color: theme.palette.mode === 'dark' ? alpha('#fff', 0.02) : alpha('#000', 0.02),
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
        color: theme.palette.mode === 'dark' ? '#fff' : theme.palette.text.primary,
        textTransform: 'uppercase',
        mb: 2,
        position: 'relative',
        zIndex: 1,
        '& span': {
            color: theme.palette.primary.main,
            textShadow: `0 0 40px ${alpha(theme.palette.primary.main, 0.5)}`
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
        opacity: 0.8,
        position: 'relative',
        zIndex: 1
    },
    contentWrapper: {
        px: { xs: 3, md: 6 },
        py: { xs: 4, md: 8 },
        maxWidth: 700,
        mx: 'auto',
        width: '100%',
        flexGrow: 1,
        position: 'relative',
        zIndex: 1
    },
    controlCard: (theme: Theme) => ({
        borderRadius: 2,
        background: alpha(theme.palette.background.paper, 0.4),
        backdropFilter: 'blur(24px) saturate(180%)',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: theme.palette.mode === 'dark'
            ? `inset 0 0 20px -10px ${alpha('#fff', 0.05)}, 0 20px 50px -20px rgba(0,0,0,0.5)`
            : `0 20px 50px -20px ${alpha(theme.palette.common.black, 0.05)}`,
        overflow: 'hidden'
    }),
    toggleButtonGroup: (theme: Theme) => ({
        bgcolor: alpha(theme.palette.background.default, 0.5),
        p: 1,
        borderRadius: 0,
        border: `1px solid ${theme.palette.divider}`,
        '& .MuiToggleButton-root': {
            flex: 1,
            py: 1.5,
            px: 3,
            borderRadius: 0,
            border: 'none',
            textTransform: 'uppercase',
            fontWeight: 950,
            fontSize: '0.65rem',
            letterSpacing: '2px',
            color: theme.palette.text.secondary,
            transition: 'all 0.3s ease',
            '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: theme.palette.mode === 'dark' ? '#fff' : theme.palette.primary.contrastText,
                boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                '&:hover': { bgcolor: 'primary.dark' }
            }
        }
    }),
    scannerContainer: (theme: Theme) => ({
        width: '100%',
        minHeight: 350,
        bgcolor: theme.palette.mode === 'dark' ? '#000' : 'background.paper',
        borderRadius: 0,
        position: 'relative',
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`,
        '& #reader': {
            width: '100% !important',
            border: 'none !important',
            '& video': { borderRadius: 0 }
        }
    }),
    manualField: (theme: Theme) => ({
        '& .MuiOutlinedInput-root': {
            borderRadius: 0,
            bgcolor: 'action.hover',
            height: 56,
            '& fieldset': { borderColor: theme.palette.divider },
            '&:hover fieldset': { borderColor: 'primary.main' },
        },
        '& .MuiInputLabel-root': {
            fontWeight: 800,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            fontSize: '0.7rem',
            color: theme.palette.text.secondary
        }
    }),
    actionButton: {
        borderRadius: 0,
        fontWeight: 950,
        letterSpacing: '2px',
        py: 2,
        textTransform: 'uppercase'
    },
    resultCard: (theme: Theme, success: boolean) => ({
        borderRadius: 0,
        background: alpha(success ? theme.palette.success.main : theme.palette.error.main, 0.05),
        border: `1px solid ${alpha(success ? theme.palette.success.main : theme.palette.error.main, 0.2)}`,
        textAlign: 'center',
        p: 6
    }),
    attendeeChip: {
        fontWeight: 950,
        letterSpacing: '1px',
        fontSize: '0.6rem',
        height: 24,
        borderRadius: 0,
    }
};

export default function CheckInPage() {
    const theme = useTheme();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [qrData, setQrData] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
    const [mode, setMode] = useState<'camera' | 'manual' | 'list'>('camera');
    const [classes, setClasses] = useState<ClassSession[]>([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [attendees, setAttendees] = useState<Booking[]>([]);
    const [lastScannedData, setLastScannedData] = useState('');
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        fetchTodayClasses();
    }, []);

    const fetchTodayClasses = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const response = await classService.getClasses({ startDate: today, endDate: today });
            setClasses(response.data?.classes || []);
        } catch (error) {
            console.error("Failed to fetch classes:", error);
        }
    };

    const fetchAttendees = async (classId: string) => {
        setLoading(true);
        try {
            const response = await bookingService.getClassBookings(classId);
            setAttendees(response.data?.bookings || []);
        } catch (error) {
            console.error("Failed to fetch attendees:", error);
            setAttendees([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedClassId) fetchAttendees(selectedClassId);
    }, [selectedClassId]);

    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(err => console.warn("Failed to clear scanner", err));
                scannerRef.current = null;
            }
        };
    }, [mode]);

    useEffect(() => {
        if (mode === 'camera' && !loading && !result) {
            const timer = setTimeout(() => {
                if (!scannerRef.current) {
                    try {
                        const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
                        scannerRef.current = scanner;
                        scanner.render(onScanSuccess, onScanFailure);
                    } catch (e) {
                        console.error("Error initializing scanner:", e);
                    }
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [mode, loading, result]);

    const onScanSuccess = (decodedText: string) => {
        if (scannerRef.current) scannerRef.current.pause(true);
        processCheckIn(decodedText);
    };

    const onScanFailure = () => { };

    const getCurrentLocation = (): Promise<{ lat: number; lng: number } | undefined> => {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                console.warn("Geolocation not supported");
                return resolve(undefined);
            }
            navigator.geolocation.getCurrentPosition(
                (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => {
                    console.warn("Geolocation error:", err);
                    resolve(undefined);
                },
                { timeout: 5000 }
            );
        });
    };

    const processCheckIn = async (data: string, override: boolean = false) => {
        setLoading(true);
        setLastScannedData(data);
        try {
            const location = await getCurrentLocation();
            const response = await bookingService.checkIn(data, location, override);
            const userName = response.data?.user?.fullName?.toUpperCase() || 'MEMBER';
            const className = response.data?.classSession?.title?.toUpperCase() || 'SESSION';

            setResult({
                success: true,
                message: `WELCOME, ${userName}! ACCESS GRANTED FOR ${className}.`
            });
            setQrData('');
        } catch (error: any) {
            setResult({
                success: false,
                message: error.message || 'ACCESS DENIED. INVALID CREDENTIALS OR BOOKING STATUS.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (qrData) processCheckIn(qrData);
    };

    const handleManualCheckIn = async (bookingId: string) => {
        try {
            await bookingService.manualCheckIn(bookingId);
            if (selectedClassId) fetchAttendees(selectedClassId);
            showToast('PROTOCOL SUCCESS: STUDENT VERIFIED', 'success');
        } catch (error: unknown) {
            showToast((error as Error).message || 'PROTOCOL FAILURE', 'error');
        }
    };

    const handleReset = () => {
        setResult(null);
        setQrData('');
        if (mode === 'camera' && scannerRef.current) scannerRef.current.resume();
    };

    return (
        <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible" sx={styles.pageContainer}>
            {/* Cinematic Hero */}
            <Box sx={styles.headerHero(theme)}>
                <Typography sx={styles.sectionLabel}>SECURITY CLEARANCE</Typography>
                <Typography variant="h1" sx={styles.headerTitle(theme)}>
                    POINT OF <Box component="span">ACCESS</Box>
                </Typography>
                <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 600, fontWeight: 400, lineHeight: 1.6 }}>
                    Initialize student induction. Scan QR credentials, authenticate manual keys, or verify attendance through the mission roster.
                </Typography>
            </Box>

            <Box sx={styles.contentWrapper}>
                <motion.div variants={itemVariants}>
                    <Box display="flex" justifyContent="center" mb={6}>
                        <ToggleButtonGroup
                            value={mode}
                            exclusive
                            onChange={(_, m) => m && (setMode(m), setResult(null))}
                            sx={styles.toggleButtonGroup(theme)}
                        >
                            <ToggleButton value="camera"><QrCodeScannerIcon sx={{ mr: 1, fontSize: '1rem' }} /> SCANNER</ToggleButton>
                            <ToggleButton value="manual"><KeyboardIcon sx={{ mr: 1, fontSize: '1rem' }} /> KEYPAD</ToggleButton>
                            <ToggleButton value="list"><PeopleIcon sx={{ mr: 1, fontSize: '1rem' }} /> ROSTER</ToggleButton>
                        </ToggleButtonGroup>
                    </Box>

                    <Paper sx={styles.controlCard(theme)}>
                        <AnimatePresence mode="wait">
                            {result ? (
                                <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.4 }}>
                                    <Box sx={styles.resultCard(theme, result.success)}>
                                        <Box mb={4}>
                                            {result.success ?
                                                <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', filter: 'drop-shadow(0 0 20px rgba(0,255,0,0.3))' }} /> :
                                                <ErrorIcon sx={{ fontSize: 80, color: 'error.main', filter: 'drop-shadow(0 0 20px rgba(255,0,0,0.3))' }} />
                                            }
                                        </Box>
                                        <Typography variant="h4" fontWeight={950} sx={{ letterSpacing: '-1.5px', color: 'text.primary', mb: 2 }}>
                                            {result.success ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, fontWeight: 600, maxWidth: 400, mx: 'auto', letterSpacing: '0.5px' }}>
                                            {result.message}
                                        </Typography>
                                        <Button variant="contained" fullWidth onClick={handleReset} sx={styles.actionButton}>
                                            NEXT SCAN
                                        </Button>
                                        {!result.success && (user?.role === 'STUDIO_ADMIN' || user?.role === 'INSTRUCTOR') && (
                                            <Button
                                                variant="outlined"
                                                color="warning"
                                                fullWidth
                                                onClick={() => processCheckIn(lastScannedData, true)}
                                                sx={{ ...styles.actionButton, mt: 2 }}
                                                disabled={loading}
                                            >
                                                {loading ? 'PROCESSING...' : 'FORCE OVERRIDE & CHECK-IN'}
                                            </Button>
                                        )}
                                    </Box>
                                </motion.div>
                            ) : (
                                <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <Box sx={{ p: { xs: 3, md: 6 } }}>
                                        {mode === 'camera' && (
                                            <Box>
                                                <Box sx={styles.scannerContainer(theme)}>
                                                    <div id="reader"></div>
                                                    <Box sx={{ position: 'absolute', inset: 0, border: '40px solid rgba(0,0,0,0.5)', pointerEvents: 'none' }} />
                                                </Box>
                                                <Typography variant="caption" sx={{ mt: 3, display: 'block', textAlign: 'center', color: 'primary.main', fontWeight: 950, letterSpacing: '2px' }}>
                                                    ALIGN QR CREDENTIALS WITHIN VIEWFINDER
                                                </Typography>
                                            </Box>
                                        )}

                                        {mode === 'manual' && (
                                            <form onSubmit={handleManualSubmit}>
                                                <Typography sx={{ fontWeight: 950, letterSpacing: '3px', textTransform: 'uppercase', fontSize: '1rem', color: 'text.primary', mb: 4 }}>
                                                    KEYPAD ENTRY
                                                </Typography>
                                                <TextField
                                                    fullWidth
                                                    label="BOOKING KEY / MEMBER ID"
                                                    value={qrData}
                                                    onChange={(e) => setQrData(e.target.value)}
                                                    sx={styles.manualField(theme)}
                                                    placeholder="E.G., BOOK-882291"
                                                    autoFocus
                                                />
                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    type="submit"
                                                    disabled={loading || !qrData}
                                                    sx={{ ...styles.actionButton, mt: 4 }}
                                                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                                                >
                                                    {loading ? 'AUTHENTICATING...' : 'PROCESS ACCESS'}
                                                </Button>
                                            </form>
                                        )}

                                        {mode === 'list' && (
                                            <Box>
                                                <FormControl fullWidth sx={{ mb: 4 }}>
                                                    <InputLabel sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.7rem' }}>SELECT CLASS SESSION</InputLabel>
                                                    <Select
                                                        value={selectedClassId}
                                                        label="SELECT CLASS SESSION"
                                                        onChange={(e) => setSelectedClassId(e.target.value)}
                                                        sx={{ borderRadius: 0, bgcolor: 'action.hover' }}
                                                    >
                                                        {classes.length === 0 ? (
                                                            <MenuItem disabled value="">NO MISSIONS SCHEDULED TODAY</MenuItem>
                                                        ) : (
                                                            classes.map((cls) => (
                                                                <MenuItem key={cls._id} value={cls._id}>
                                                                    {cls.title.toUpperCase()} ({new Date(cls.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })})
                                                                </MenuItem>
                                                            ))
                                                        )}
                                                    </Select>
                                                </FormControl>

                                                {selectedClassId && (
                                                    <Box>
                                                        <Typography sx={{ fontWeight: 950, letterSpacing: '3px', textTransform: 'uppercase', fontSize: '0.85rem', color: 'primary.main', mb: 3 }}>
                                                            MISSION ROSTER
                                                        </Typography>
                                                        <Box sx={{ border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
                                                            <List disablePadding>
                                                                {attendees.map((booking, idx) => (
                                                                    <Box key={booking._id}>
                                                                        <ListItem sx={{ py: 2.5, px: 3 }}>
                                                                            <ListItemAvatar>
                                                                                <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 950, fontSize: '0.875rem' }} src={user?.profileImage || ""}>
                                                                                    {(booking.user as User)?.fullName?.[0].toUpperCase()}
                                                                                </Avatar>
                                                                            </ListItemAvatar>
                                                                            <ListItemText
                                                                                primary={<Typography fontWeight={950} sx={{ color: 'text.primary', letterSpacing: '0.5px' }}>{(booking.user as User)?.fullName.toUpperCase()}</Typography>}
                                                                                secondary={<Typography sx={{ opacity: 0.6, fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary' }}>{(booking.user as User)?.email.toUpperCase()}</Typography>}
                                                                            />
                                                                            <Stack direction="row" spacing={2} alignItems="center">
                                                                                <Chip
                                                                                    label={booking.status.replace('_', ' ')}
                                                                                    size="small"
                                                                                    sx={{
                                                                                        ...styles.attendeeChip,
                                                                                        color: booking.status === 'CHECKED_IN' ? 'success.main' : 'primary.main',
                                                                                        bgcolor: alpha(booking.status === 'CHECKED_IN' ? theme.palette.success.main : theme.palette.primary.main, 0.05),
                                                                                        border: `1px solid ${alpha(booking.status === 'CHECKED_IN' ? theme.palette.success.main : theme.palette.primary.main, 0.2)}`
                                                                                    }}
                                                                                />
                                                                                {booking.status === 'CONFIRMED' && (
                                                                                    <Button
                                                                                        variant="contained"
                                                                                        size="small"
                                                                                        onClick={() => handleManualCheckIn(booking._id)}
                                                                                        sx={{ ...styles.actionButton, py: 0.5, px: 2, fontSize: '0.6rem' }}
                                                                                    >
                                                                                        RECOGNIZE
                                                                                    </Button>
                                                                                )}
                                                                            </Stack>
                                                                        </ListItem>
                                                                        {idx < attendees.length - 1 && <Divider />}
                                                                    </Box>
                                                                ))}
                                                                {attendees.length === 0 && (
                                                                    <Box py={6} textAlign="center">
                                                                        <Typography variant="caption" sx={{ fontWeight: 900, color: 'rgba(255,255,255,0.2)', letterSpacing: '2px' }}>
                                                                            NO BOOKINGS LOGGED FOR THIS SESSION
                                                                        </Typography>
                                                                    </Box>
                                                                )}
                                                            </List>
                                                        </Box>
                                                    </Box>
                                                )}
                                            </Box>
                                        )}
                                    </Box>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Paper>
                </motion.div>
            </Box>
        </Box>
    );
}
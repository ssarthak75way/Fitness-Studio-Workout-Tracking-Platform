import { useState, useEffect, useRef } from 'react';
import {
    Box, Typography, TextField, Button, Card, CardContent, CircularProgress,
    ToggleButton, ToggleButtonGroup, useTheme, alpha
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { bookingService } from '../../services/booking.service';
import { classService } from '../../services/class.service';
import { useToast } from '../../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import PeopleIcon from '@mui/icons-material/People';
import {
    List, ListItem, ListItemAvatar, Avatar, ListItemText,
    Divider, Chip, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import type { Theme } from '@mui/material';
import type { ClassSession, Booking, User } from '../../types';



export default function CheckInPage() {
    const theme = useTheme();
    const { showToast } = useToast();
    const [qrData, setQrData] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
    const [mode, setMode] = useState<'camera' | 'manual' | 'list'>('camera');
    const [classes, setClasses] = useState<ClassSession[]>([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [attendees, setAttendees] = useState<Booking[]>([]);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        fetchTodayClasses();
    }, []);

    const fetchTodayClasses = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const response = await classService.getClasses({
                startDate: today,
                endDate: today
            });
            setClasses(response.data.classes);
        } catch (error) {
            console.error("Failed to fetch classes:", error);
        }
    };

    const fetchAttendees = async (classId: string) => {
        setLoading(true);
        try {
            const response = await bookingService.getClassBookings(classId);
            setAttendees(response.data.bookings);
        } catch (error) {
            console.error("Failed to fetch attendees:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedClassId) {
            fetchAttendees(selectedClassId);
        }
    }, [selectedClassId]);

    useEffect(() => {
        // Cleanup function to clear scanner when component unmounts or mode changes
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(err => console.warn("Failed to clear scanner", err));
                scannerRef.current = null;
            }
        };
    }, [mode]);

    useEffect(() => {
        if (mode === 'camera' && !loading && !result) {
            // Small delay to ensure creating scanner after DOM is ready and previous one cleared
            const timer = setTimeout(() => {
                if (!scannerRef.current) {
                    try {
                        const scanner = new Html5QrcodeScanner(
                            "reader",
                            { fps: 10, qrbox: { width: 250, height: 250 } },
                            false
                        );
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
        if (scannerRef.current) {
            scannerRef.current.pause(true);
        }
        processCheckIn(decodedText);
    };

    const onScanFailure = () => {
        // quiet fail
    };

    const processCheckIn = async (data: string) => {
        setLoading(true);
        // Keep result null initially to possibly show loading state clearer if needed

        try {
            const response = await bookingService.checkIn(data);
            setResult({
                success: true,
                message: `Welcome, ${response.data.user?.fullName}! Checked in for ${response.data.classSession?.title || 'class'}.`
            });
            setQrData('');
        } catch (error: unknown) {
            setResult({
                success: false,
                message: (error as Error).message || 'Check-in failed. Invalid QR code or booking not found.'
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
            showToast('Student checked in successfully!', 'success');
        } catch (error: unknown) {
            showToast((error as Error).message || 'Check-in failed', 'error');
        }
    };

    const handleReset = () => {
        setResult(null);
        setQrData('');
        // When resetting, if in camera mode, the useEffect will re-initialize/resume
        if (mode === 'camera' && scannerRef.current) {
            scannerRef.current.resume();
        }
    };

    return (
        <Box maxWidth={600} mx="auto" px={2} py={4}>
            <Box mb={4} textAlign="center">
                <Typography variant="h3" fontWeight={800} sx={styles.pageTitle(theme)}>
                    Check-In
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Scan member QR code, enter code, or select from class list.
                </Typography>
            </Box>

            <Box display="flex" justifyContent="center" mb={4}>
                <ToggleButtonGroup
                    value={mode}
                    exclusive
                    onChange={(_, newMode) => {
                        if (newMode) {
                            setMode(newMode);
                            setResult(null); // Clear result on mode switch
                        }
                    }}
                    aria-label="check-in mode"
                    sx={styles.toggleButtonGroup(theme)}
                >
                    <ToggleButton value="camera" aria-label="camera scan">
                        <QrCodeScannerIcon sx={styles.toggleIcon} /> QR Scan
                    </ToggleButton>
                    <ToggleButton value="manual" aria-label="manual entry">
                        <KeyboardIcon sx={styles.toggleIcon} /> Code
                    </ToggleButton>
                    <ToggleButton value="list" aria-label="class list">
                        <PeopleIcon sx={styles.toggleIcon} /> Class List
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>

            <AnimatePresence mode="wait">
                {result ? (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                    >
                        <Card sx={styles.resultCard(theme, result.success)}>
                            <Box sx={styles.resultIconContainer(theme, result.success)}>
                                {result.success ? (
                                    <CheckCircleIcon sx={styles.resultIcon(theme, true)} />
                                ) : (
                                    <ErrorIcon sx={styles.resultIcon(theme, false)} />
                                )}
                            </Box>
                            <CardContent sx={{ pt: 3, pb: 4 }}>
                                <Typography variant="h5" fontWeight={700} gutterBottom>
                                    {result.success ? 'Success!' : 'Error'}
                                </Typography>
                                <Typography variant="body1" color="text.secondary" mb={3}>
                                    {result.message}
                                </Typography>
                                <Button
                                    variant="contained"
                                    color={result.success ? 'primary' : 'inherit'}
                                    onClick={handleReset}
                                    size="large"
                                    sx={styles.resultButton}
                                >
                                    Scan Next
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <Card sx={styles.contentCard(theme)}>
                            <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
                                {mode === 'camera' ? (
                                    <Box>
                                        <Box sx={styles.cameraContainer(theme)}>
                                            <div id="reader" style={{ width: '100%' }}></div>
                                        </Box>
                                        <Typography variant="caption" display="block" textAlign="center" color="text.secondary" mt={2}>
                                            Position the QR code within the frame.
                                        </Typography>
                                    </Box>
                                ) : mode === 'manual' ? (
                                    <form onSubmit={handleManualSubmit}>
                                        <Typography variant="h6" gutterBottom fontWeight={600}>
                                            Enter Code Manually
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" mb={3}>
                                            Type the alphanumeric code found below the member's QR code.
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            label="Booking Code / Member ID"
                                            variant="outlined"
                                            value={qrData}
                                            onChange={(e) => setQrData(e.target.value)}
                                            placeholder="e.g., BOOK-123456"
                                            sx={styles.manualField}
                                            InputProps={{ sx: styles.manualFieldInput }}
                                            autoFocus
                                        />
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            size="large"
                                            type="submit"
                                            disabled={loading || !qrData}
                                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                                            sx={styles.manualSubmitButton}
                                        >
                                            {loading ? 'Verifying...' : 'Check In'}
                                        </Button>
                                    </form>
                                ) : (
                                    <Box>
                                        <FormControl fullWidth sx={{ mb: 3 }}>
                                            <InputLabel id="class-select-label">Select Class Session</InputLabel>
                                            <Select
                                                labelId="class-select-label"
                                                id="class-select"
                                                value={selectedClassId}
                                                label="Select Class Session"
                                                onChange={(e) => setSelectedClassId(e.target.value)}
                                                sx={styles.classSelect}
                                            >
                                                {classes.length === 0 ? (
                                                    <MenuItem disabled value="">
                                                        No classes scheduled for today
                                                    </MenuItem>
                                                ) : (
                                                    classes.map((cls: ClassSession) => (
                                                        <MenuItem key={cls._id} value={cls._id}>
                                                            {cls.title} ({new Date(cls.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                                                        </MenuItem>
                                                    ))
                                                )}
                                            </Select>
                                        </FormControl>

                                        {selectedClassId && (
                                            <Box>
                                                <Typography variant="h6" gutterBottom fontWeight={600} display="flex" alignItems="center" gap={1}>
                                                    <PeopleIcon color="primary" /> Attendees
                                                </Typography>
                                                {loading && attendees.length === 0 ? (
                                                    <Box display="flex" justifyContent="center" py={4}>
                                                        <CircularProgress />
                                                    </Box>
                                                ) : attendees.length === 0 ? (
                                                    <Typography color="text.secondary" textAlign="center" py={4} bgcolor={alpha(theme.palette.background.default, 0.5)} borderRadius={2}>
                                                        No students booked for this class.
                                                    </Typography>
                                                ) : (
                                                    <List sx={styles.attendeesList(theme)}>
                                                        {attendees.map((booking: Booking, index: number) => (
                                                            <Box key={booking._id}>
                                                                <ListItem sx={{ py: 1.5 }}>
                                                                    <ListItemAvatar>
                                                                        <Avatar src={(booking.user as User)?.profileImage} sx={styles.attendeeAvatar(theme)}>
                                                                            {(booking.user as User)?.fullName?.[0]}
                                                                        </Avatar>
                                                                    </ListItemAvatar>
                                                                    <ListItemText
                                                                        primary={<Typography fontWeight={600}>{(booking.user as User)?.fullName}</Typography>}
                                                                        secondary={(booking.user as User)?.email}
                                                                        sx={{ mr: 2 }}
                                                                    />
                                                                    <Box display="flex" alignItems="center" gap={1}>
                                                                        <Chip
                                                                            label={booking.status.replace('_', ' ')}
                                                                            size="small"
                                                                            color={booking.status === 'CHECKED_IN' ? 'success' : booking.status === 'WAITLISTED' ? 'warning' : 'primary'}
                                                                            variant={booking.status === 'CHECKED_IN' ? 'filled' : 'outlined'}
                                                                            sx={styles.attendeeChip}
                                                                        />
                                                                        {booking.status === 'CONFIRMED' && (
                                                                            <Button
                                                                                size="small"
                                                                                variant="contained"
                                                                                onClick={() => handleManualCheckIn(booking._id)}
                                                                                disabled={loading}
                                                                                sx={styles.attendeeButton}
                                                                            >
                                                                                Check In
                                                                            </Button>
                                                                        )}
                                                                    </Box>
                                                                </ListItem>
                                                                {index < attendees.length - 1 && <Divider component="li" />}
                                                            </Box>
                                                        ))}
                                                    </List>
                                                )}
                                            </Box>
                                        )}
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </Box>
    );
}


const styles = {
    pageTitle: (theme: Theme) => ({
        background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        mb: 1
    }),
    toggleButtonGroup: (theme: Theme) => ({
        bgcolor: theme.palette.background.paper,
        boxShadow: theme.shadows[1],
        borderRadius: 2,
        '& .MuiToggleButton-root': {
            px: 3,
            py: 1,
            borderRadius: 2,
            border: 'none',
            textTransform: 'none',
            fontWeight: 600,
            '&.Mui-selected': {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                }
            }
        }
    }),
    toggleIcon: { mr: 1 },
    resultCard: (theme: Theme, success: boolean) => ({
        borderRadius: 4,
        boxShadow: theme.shadows[4],
        textAlign: 'center',
        overflow: 'hidden',
        border: `1px solid ${success ? theme.palette.success.light : theme.palette.error.light}`
    }),
    resultIconContainer: (theme: Theme, success: boolean) => ({
        bgcolor: success ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1),
        py: 4
    }),
    resultIcon: (theme: Theme, success: boolean) => ({
        fontSize: 80,
        color: success ? theme.palette.success.main : theme.palette.error.main
    }),
    resultButton: { borderRadius: 2, px: 4 },
    contentCard: (theme: Theme) => ({
        borderRadius: 4,
        boxShadow: theme.shadows[2],
        overflow: 'hidden',
        background: theme.palette.background.paper
    }),
    cameraContainer: (theme: Theme) => ({
        borderRadius: 2,
        overflow: 'hidden',
        border: `2px dashed ${theme.palette.divider}`,
        bgcolor: '#000',
        minHeight: 300,
        position: 'relative'
    }),
    manualField: { mb: 3 },
    manualFieldInput: { borderRadius: 2 },
    manualSubmitButton: { borderRadius: 2, py: 1.5, fontWeight: 700 },
    classSelect: { borderRadius: 2 },
    attendeesList: (theme: Theme) => ({
        bgcolor: theme.palette.background.paper,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden'
    }),
    attendeeAvatar: (theme: Theme) => ({ bgcolor: theme.palette.primary.main }),
    attendeeChip: { fontWeight: 700, fontSize: '0.65rem', borderRadius: 1 },
    attendeeButton: { borderRadius: 1.5, minWidth: 80, fontSize: '0.75rem' }
};
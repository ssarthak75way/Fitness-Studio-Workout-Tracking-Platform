import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Chip,
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions,
    Tabs,
    Tab,
    Grid,
    useTheme,
    alpha,
    IconButton,
    Stack
} from '@mui/material';
import type { Theme } from '@mui/material';
import {
    Event as EventIcon,
    LocationOn as LocationOnIcon,
    Person as PersonIcon,
    QrCode as QrCodeIcon,
    Cancel as CancelIcon,
    AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { bookingService } from '../../services/booking.service';
import { useToast } from '../../context/ToastContext';
import { useNavigate, Link } from 'react-router-dom';

interface Booking {
    _id: string;
    status: 'CONFIRMED' | 'WAITLISTED' | 'CANCELLED' | 'CHECKED_IN';
    classSession: {
        _id: string;
        title: string;
        type: string;
        location: string;
        startTime: string;
        endTime: string;
        instructor?: {
            _id: string;
            fullName: string;
        };
    };
    qrCodeUrl?: string;
}

const styles = {
    pageContainer: { maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 3 } },
    headerTitle: (theme: Theme) => ({
        background: `linear-gradient(45deg, ${theme.palette.text.primary} 30%, ${theme.palette.primary.main} 90%)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    }),
    tabsContainer: { borderBottom: 1, borderColor: 'divider', mb: 3 },
    card: (theme: Theme) => ({
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[4]
        },
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 3
    }),
    cardContent: { flexGrow: 1, p: 3 },
    chip: { fontWeight: 600, borderRadius: 1 },
    qrIconButton: (theme: Theme) => ({
        bgcolor: alpha(theme.palette.primary.main, 0.1),
        color: 'primary.main',
        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
    }),
    instructorLink: { textDecoration: 'none', color: 'inherit' },
    instructorText: { fontWeight: 500, '&:hover': { textDecoration: 'underline' } },
    button: { borderRadius: 2 },
    noBookingsContainer: { textAlign: 'center', py: 8, opacity: 0.7 },
    noBookingsIcon: { fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 },
    qrDialogContent: { textAlign: 'center', py: 4 },
    qrWrapper: { p: 2, bgcolor: 'white', borderRadius: 2, display: 'inline-block', mb: 2 },
    qrImage: { width: 200, height: 200 }
};

export default function BookingsPage() {
    const theme = useTheme();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [tabValue, setTabValue] = useState(0);
    const [selectedQR, setSelectedQR] = useState('');
    const [openQR, setOpenQR] = useState(false);
    const [cancelId, setCancelId] = useState<string | null>(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await bookingService.getMyBookings();
            setBookings(response.data.bookings);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
            showToast('Failed to load bookings', 'error');
        }
    };

    const handleCancelBooking = async () => {
        if (!cancelId) return;
        try {
            await bookingService.cancelBooking(cancelId);
            showToast('Booking cancelled successfully', 'success');
            fetchBookings();
            setCancelId(null);
        } catch (error) {
            console.error('Failed to cancel booking:', error);
            showToast((error as Error).message || 'Failed to cancel booking', 'error');
        }
    };

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const getFilteredBookings = () => {
        const now = new Date();
        return bookings.filter(booking => {
            const startTime = new Date(booking?.classSession?.startTime);
            const isCancelled = booking?.status === 'CANCELLED';

            if (tabValue === 0) { // Upcoming
                return !isCancelled && startTime > now && booking?.status !== 'CHECKED_IN';
            } else if (tabValue === 1) { // History
                return !isCancelled && (startTime <= now || booking?.status === 'CHECKED_IN');
            } else { // Cancelled
                return isCancelled;
            }
        }).sort((a, b) => {
            const dateA = new Date(a?.classSession?.startTime).getTime();
            const dateB = new Date(b?.classSession?.startTime).getTime();
            return tabValue === 0 ? dateA - dateB : dateB - dateA; // Upcoming asc, others desc
        });
    };

    const getStatusColor = (status: Booking['status']): 'success' | 'warning' | 'info' | 'error' | 'default' => {
        switch (status) {
            case 'CONFIRMED': return 'success';
            case 'WAITLISTED': return 'warning';
            case 'CHECKED_IN': return 'info';
            case 'CANCELLED': return 'error';
            default: return 'default';
        }
    };

    const filteredBookings = getFilteredBookings();

    return (
        <Box sx={styles.pageContainer}>
            <Box mb={4}>
                <Typography variant="h4" fontWeight="800" gutterBottom sx={styles.headerTitle(theme)}>
                    My Bookings
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Manage your upcoming classes and view your booking history.
                </Typography>
            </Box>

            <Box sx={styles.tabsContainer}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="booking tabs">
                    <Tab label="Upcoming" />
                    <Tab label="History" />
                    <Tab label="Cancelled" />
                </Tabs>
            </Box>

            <Grid container spacing={3}>
                {filteredBookings.map((booking) => (
                    <Grid size={{ xs: 12, md: 6, lg: 4 }} key={booking._id}>
                        <Card sx={styles.card(theme)}>
                            <CardContent sx={styles.cardContent}>
                                <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                                    <Chip
                                        label={booking.status}
                                        color={getStatusColor(booking.status)}
                                        size="small"
                                        variant="filled"
                                        sx={styles.chip}
                                    />
                                    {booking.status === 'CONFIRMED' && booking.qrCodeUrl && (
                                        <IconButton
                                            size="small"
                                            onClick={() => {
                                                setSelectedQR(booking.qrCodeUrl!);
                                                setOpenQR(true);
                                            }}
                                            sx={styles.qrIconButton(theme)}
                                        >
                                            <QrCodeIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                </Box>

                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                    {booking?.classSession?.title || "NA"}
                                </Typography>

                                <Stack spacing={1.5} mt={2}>
                                    <Box display="flex" alignItems="center" gap={1.5}>
                                        <AccessTimeIcon color="action" fontSize="small" />
                                        <Typography variant="body2" color="text.secondary">
                                            {new Date(booking?.classSession?.startTime).toLocaleString(undefined, {
                                                weekday: 'short', month: 'short', day: 'numeric',
                                                hour: 'numeric', minute: '2-digit'
                                            })}
                                        </Typography>
                                    </Box>
                                    <Box display="flex" alignItems="center" gap={1.5}>
                                        <PersonIcon color="action" fontSize="small" />
                                        {booking?.classSession?.instructor ? (
                                            <Link to={`/instructors/${booking.classSession.instructor._id}`} style={styles.instructorLink}>
                                                <Typography variant="body2" color="primary" sx={styles.instructorText}>
                                                    {booking.classSession.instructor.fullName}
                                                </Typography>
                                            </Link>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">
                                                TBA
                                            </Typography>
                                        )}
                                    </Box>
                                    <Box display="flex" alignItems="center" gap={1.5}>
                                        <LocationOnIcon color="action" fontSize="small" />
                                        <Typography variant="body2" color="text.secondary">
                                            {booking?.classSession?.location || 'NA'}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </CardContent>

                            <Box sx={{ p: 2, pt: 0 }}>
                                {tabValue === 0 && (booking.status === 'CONFIRMED' || booking.status === 'WAITLISTED') && (
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        fullWidth
                                        startIcon={<CancelIcon />}
                                        onClick={() => setCancelId(booking._id)}
                                        sx={styles.button}
                                    >
                                        Cancel Booking
                                    </Button>
                                )}
                                {tabValue !== 0 && (
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        fullWidth
                                        onClick={() => navigate('/schedule')}
                                        sx={styles.button}
                                    >
                                        Book Again
                                    </Button>
                                )}
                            </Box>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {filteredBookings.length === 0 && (
                <Box sx={styles.noBookingsContainer}>
                    <EventIcon sx={styles.noBookingsIcon} />
                    <Typography variant="h6" color="text.secondary">
                        No {tabValue === 0 ? 'upcoming' : tabValue === 1 ? 'past' : 'cancelled'} bookings found.
                    </Typography>
                    {tabValue === 0 && (
                        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/schedule')}>
                            Browse Schedule
                        </Button>
                    )}
                </Box>
            )}

            {/* QR Code Dialog */}
            <Dialog open={openQR} onClose={() => setOpenQR(false)} maxWidth="xs" fullWidth>
                <DialogContent sx={styles.qrDialogContent}>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                        Check-in QR Code
                    </Typography>
                    <Box sx={styles.qrWrapper}>
                        {selectedQR && <img src={selectedQR} alt="QR Code" style={styles.qrImage} />}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        Scan this at the studio front desk.
                    </Typography>
                    <Button onClick={() => setOpenQR(false)} sx={{ mt: 2 }}>Close</Button>
                </DialogContent>
            </Dialog>

            {/* Cancel Confirmation Dialog */}
            <Dialog open={!!cancelId} onClose={() => setCancelId(null)}>
                <DialogTitle>Cancel Booking?</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to cancel this booking? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCancelId(null)} color="inherit">Keep Booking</Button>
                    <Button onClick={handleCancelBooking} color="error" variant="contained" autoFocus>
                        Yes, Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

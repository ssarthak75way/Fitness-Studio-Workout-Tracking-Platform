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
    AccessTime as AccessTimeIcon,
    ContentCopy as ContentCopyIcon
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
            ? `linear-gradient(rgba(6, 9, 15, 0.75), rgba(6, 9, 15, 1)), url(https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=2075&auto=format&fit=crop)`
            : `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.95)), url(https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=2075&auto=format&fit=crop)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        flexWrap: 'wrap',
        gap: 4,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        '&::before': {
            content: '"SESSIONS"',
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
            textShadow: `0 0 40px ${alpha(theme.palette.primary.main, 0.5)}`
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
    tabsContainer: {
        mb: 6,
        '& .MuiTabs-indicator': {
            height: 4,
            borderRadius: 0,
            bgcolor: 'primary.main',
            boxShadow: (theme: Theme) => `0 -4px 20px ${alpha(theme.palette.primary.main, 0.6)}`
        },
        '& .MuiTab-root': {
            fontWeight: 900,
            letterSpacing: '2px',
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            color: 'text.secondary',
            py: 3,
            '&.Mui-selected': {
                color: 'text.primary'
            }
        }
    },
    card: (theme: Theme) => ({
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 2,
        border: '1px solid',
        borderColor: theme.palette.divider,
        bgcolor: alpha(theme.palette.background.paper, 0.6),
        backdropFilter: 'blur(24px) saturate(160%)',
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: theme.palette.mode === 'dark'
            ? `inset 0 0 20px -10px ${alpha('#fff', 0.05)}, 0 10px 30px -15px ${alpha('#000', 0.5)}`
            : `0 10px 30px -15px ${alpha(theme.palette.common.black, 0.1)}`,
        '&:hover': {
            transform: 'translateY(-10px) scale(1.02)',
            borderColor: alpha(theme.palette.primary.main, 0.4),
            boxShadow: `inset 0 0 30px -10px ${alpha(theme.palette.primary.main, 0.1)}, 0 20px 50px -20px ${alpha(theme.palette.primary.main, 0.4)}`,
            '& .qr-btn': {
                bgcolor: theme.palette.primary.main,
                color: '#fff',
                boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.6)}`
            }
        }
    }),
    cardContent: { p: 4 },
    chip: {
        fontWeight: 900,
        borderRadius: 0,
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        fontSize: '0.65rem',
        height: 24
    },
    qrIconButton: (theme: Theme) => ({
        borderRadius: 0,
        bgcolor: alpha(theme.palette.primary.main, 0.08),
        color: 'primary.main',
        width: 44,
        height: 44,
        transition: 'all 0.3s ease',
        '&:hover': {
            bgcolor: theme.palette.primary.main,
            color: '#fff',
            boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.4)}`
        }
    }),
    instructorLink: { textDecoration: 'none', color: 'inherit' },
    instructorText: { fontWeight: 900, color: 'primary.main', '&:hover': { textDecoration: 'underline' } },
    bookingButton: {
        borderRadius: 0,
        fontWeight: 900,
        py: 1.5,
        letterSpacing: '1px',
        transition: 'all 0.3s ease'
    },
    noBookingsContainer: {
        textAlign: 'center',
        py: 12,
        bgcolor: alpha('#fff', 0.02),
        border: '1px dashed rgba(255,255,255,0.1)',
        borderRadius: 2
    },
    noBookingsIcon: { fontSize: 80, color: 'primary.main', mb: 3, opacity: 0.2 },
    dialogPaper: (theme: Theme) => ({
        borderRadius: 2,
        bgcolor: 'background.default',
        backgroundImage: theme.palette.mode === 'dark'
            ? `linear-gradient(rgba(6, 9, 15, 0.8), rgba(6, 9, 15, 1))`
            : `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 1))`,
        border: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden'
    }),
    qrDialogContent: { textAlign: 'center', py: 6, px: 4 },
    qrWrapper: {
        p: 3,
        bgcolor: 'white',
        borderRadius: 1.5,
        display: 'inline-block',
        mb: 4,
        boxShadow: `0 0 40px ${alpha('#fff', 0.1)}`
    },
    qrImage: { width: 220, height: 220 },
    manualCodeBox: (theme: Theme) => ({
        mt: 4,
        p: 3,
        bgcolor: alpha(theme.palette.background.paper, 0.4),
        border: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
        borderRadius: 1.5
    }),
    heroSubtitle: {
        color: 'text.secondary',
        maxWidth: 600,
        fontWeight: 400,
        lineHeight: 1.6
    },
    newBookingButton: (theme: Theme) => ({
        borderRadius: 0,
        py: 2.5, px: 6,
        fontWeight: 900,
        letterSpacing: '2px',
        bgcolor: 'white',
        color: 'secondary.main',
        '&:hover': {
            bgcolor: 'primary.main',
            color: 'white',
            boxShadow: `0 0 30px ${alpha(theme.palette.primary.main, 0.5)}`
        }
    }),
    bookingTitle: {
        letterSpacing: '-1px',
        color: 'text.primary',
        mb: 3
    },
    icon: {
        color: 'primary.main',
        fontSize: '1.2rem'
    },
    infoText: {
        fontWeight: 700,
        color: 'text.secondary'
    },
    tbaText: {
        fontWeight: 700,
        opacity: 0.5
    },
    actionButtonContainer: {
        p: 4,
        pt: 0
    },
    rebookButton: {
        borderRadius: 0,
        fontWeight: 900,
        py: 1.5,
        letterSpacing: '1px',
        transition: 'all 0.3s ease',
        bgcolor: 'primary.main'
    },
    cancelButton: {
        borderRadius: 0,
        fontWeight: 900,
        py: 1.5,
        letterSpacing: '1px',
        transition: 'all 0.3s ease'
    },
    noBookingsText: {
        opacity: 0.5,
        letterSpacing: '2px',
        textTransform: 'uppercase'
    },
    browseIntelButton: {
        mt: 4,
        borderRadius: 0,
        fontWeight: 900,
        py: 2,
        px: 6,
        letterSpacing: '2px'
    },
    checkinTitle: {
        letterSpacing: '-1.5px',
        color: 'text.primary',
        mb: 4
    },
    qrInstructionText: {
        color: 'text.secondary',
        fontWeight: 500,
        mb: 4
    },
    manualVerificationLabel: {
        color: 'primary.main',
        fontWeight: 900,
        letterSpacing: '3px',
        display: 'block',
        mb: 2
    },
    manualCodeText: {
        fontFamily: 'monospace',
        fontWeight: 950,
        letterSpacing: '4px',
        color: 'text.primary'
    },
    copyButton: {
        color: 'primary.main'
    },
    closeSecureViewButton: {
        mt: 6,
        borderRadius: 0,
        fontWeight: 900,
        letterSpacing: '2px'
    },
    dialogTitle: {
        letterSpacing: '-1px'
    },
    dialogContentText: {
        color: 'rgba(255,255,255,0.7)',
        fontWeight: 500
    },
    stayAthleteButton: {
        fontWeight: 900
    },
    terminateButton: {
        borderRadius: 0,
        fontWeight: 900,
        px: 4
    },
    dialogTitleBox: {
        p: 4,
        pb: 2
    },
    dialogContentBox: {
        px: 4
    },
    dialogActionsBox: {
        p: 4
    }
};

export default function BookingsPage() {
    const theme = useTheme();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [tabValue, setTabValue] = useState(0);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [openQR, setOpenQR] = useState(false);
    const [cancelId, setCancelId] = useState<string | null>(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await bookingService.getMyBookings();
            const bookingsData = response.data?.bookings || [];

            if (!response.data?.bookings) {
                console.log('No bookings found in API response or data structure mismatch');
            }

            setBookings(bookingsData);
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
            {/* Cinematic Hero */}
            <Box sx={styles.headerHero(theme)}>
                <Box>
                    <Typography sx={styles.sectionLabel}>YOUR MISSION</Typography>
                    <Typography variant="h1" sx={styles.headerTitle(theme)}>
                        MY <Box component="span">BOOKINGS</Box>
                    </Typography>
                    <Typography variant="h6" sx={styles.heroSubtitle}>
                        Track your evolution. Your roadmap to peak performance, documented and verified in the elite FITNESS STUDIO network.
                    </Typography>
                </Box>
                <Box>
                    <Button
                        variant="contained"
                        onClick={() => navigate('/schedule')}
                        sx={styles.newBookingButton(theme)}
                    >
                        NEW BOOKING
                    </Button>
                </Box>
            </Box>

            <Box sx={styles.contentWrapper}>
                <Typography sx={styles.sectionLabel}>FILTER SESSIONS</Typography>
                <Box sx={styles.tabsContainer}>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="booking tabs">
                        <Tab label="Upcoming" />
                        <Tab label="History" />
                        <Tab label="Cancelled" />
                    </Tabs>
                </Box>

                <Grid container spacing={4}>
                    {filteredBookings.map((booking) => (
                        <Grid size={{ xs: 12, md: 6, lg: 4 }} key={booking._id}>
                            <Card sx={styles.card(theme)}>
                                <CardContent sx={styles.cardContent}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                                        <Chip
                                            label={booking.status}
                                            color={getStatusColor(booking.status)}
                                            size="small"
                                            variant="filled"
                                            sx={styles.chip}
                                        />
                                        {booking.status === 'CONFIRMED' && booking.qrCodeUrl && (
                                            <IconButton
                                                className="qr-btn"
                                                size="medium"
                                                onClick={() => {
                                                    setSelectedBooking(booking);
                                                    setOpenQR(true);
                                                }}
                                                sx={styles.qrIconButton(theme)}
                                            >
                                                <QrCodeIcon fontSize="small" />
                                            </IconButton>
                                        )}
                                    </Box>

                                    <Typography variant="h5" fontWeight={950} sx={styles.bookingTitle}>
                                        {booking?.classSession?.title || "ELITE SESSION"}
                                    </Typography>

                                    <Stack spacing={2}>
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <AccessTimeIcon sx={styles.icon} />
                                            <Typography variant="body2" sx={styles.infoText}>
                                                {new Date(booking?.classSession?.startTime).toLocaleString(undefined, {
                                                    weekday: 'short', month: 'short', day: 'numeric',
                                                    hour: 'numeric', minute: '2-digit'
                                                })}
                                            </Typography>
                                        </Box>
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <PersonIcon sx={styles.icon} />
                                            {booking?.classSession?.instructor ? (
                                                <Link to={`/instructors/${booking.classSession.instructor._id}`} style={styles.instructorLink}>
                                                    <Typography variant="body2" sx={styles.instructorText}>
                                                        {booking.classSession.instructor.fullName.toUpperCase()}
                                                    </Typography>
                                                </Link>
                                            ) : (
                                                <Typography variant="body2" sx={styles.tbaText}>
                                                    TBA
                                                </Typography>
                                            )}
                                        </Box>
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <LocationOnIcon sx={styles.icon} />
                                            <Typography variant="body2" sx={styles.infoText}>
                                                {booking?.classSession?.location?.toUpperCase() || 'MAIN STUDIO'}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </CardContent>

                                <Box sx={styles.actionButtonContainer}>
                                    {tabValue === 0 && (booking.status === 'CONFIRMED' || booking.status === 'WAITLISTED') && (
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            fullWidth
                                            startIcon={<CancelIcon />}
                                            onClick={() => setCancelId(booking._id)}
                                            sx={styles.cancelButton}
                                        >
                                            CANCEL MISSION
                                        </Button>
                                    )}
                                    {tabValue !== 0 && (
                                        <Button
                                            variant="contained"
                                            fullWidth
                                            onClick={() => navigate('/schedule')}
                                            sx={styles.rebookButton}
                                        >
                                            RE-BOOK
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
                        <Typography variant="h5" fontWeight={900} color="text.secondary" sx={styles.noBookingsText}>
                            ZERO {tabValue === 0 ? 'UPCOMING' : tabValue === 1 ? 'PAST' : 'CANCELLED'} MISSIONS
                        </Typography>
                        {tabValue === 0 && (
                            <Button
                                variant="contained"
                                sx={styles.browseIntelButton}
                                onClick={() => navigate('/schedule')}
                            >
                                BROWSE INTEL
                            </Button>
                        )}
                    </Box>
                )}
            </Box>

            {/* QR Code Dialog */}
            <Dialog
                open={openQR}
                onClose={() => setOpenQR(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: styles.dialogPaper(theme) }}
            >
                <DialogContent sx={styles.qrDialogContent}>
                    <Typography variant="subtitle2" sx={styles.sectionLabel}>AUTHENTICATION</Typography>
                    <Typography variant="h4" fontWeight={950} sx={styles.checkinTitle}>
                        CHECK-IN <Box component="span" sx={{ color: 'primary.main' }}>QR</Box>
                    </Typography>

                    <Box sx={styles.qrWrapper}>
                        {selectedBooking?.qrCodeUrl && <img src={selectedBooking.qrCodeUrl} alt="QR Code" style={styles.qrImage} />}
                    </Box>

                    <Typography variant="body2" sx={styles.qrInstructionText}>
                        Present this high-fidelity token at the elite studio command for instant verification.
                    </Typography>

                    <Box sx={styles.manualCodeBox(theme)}>
                        <Typography variant="overline" sx={styles.manualVerificationLabel}>
                            MANUAL VERIFICATION
                        </Typography>
                        <Stack direction="row" alignItems="center" justifyContent="center" spacing={2}>
                            <Typography variant="h4" sx={styles.manualCodeText}>
                                {selectedBooking?._id.slice(-6).toUpperCase()}
                            </Typography>
                            <IconButton
                                size="small"
                                onClick={() => {
                                    if (selectedBooking?._id) {
                                        navigator.clipboard.writeText(selectedBooking._id);
                                        showToast('Intel copied to clipboard', 'success');
                                    }
                                }}
                                sx={styles.copyButton}
                            >
                                <ContentCopyIcon />
                            </IconButton>
                        </Stack>
                    </Box>

                    <Button
                        onClick={() => setOpenQR(false)}
                        sx={styles.closeSecureViewButton}
                        fullWidth
                        variant="outlined"
                        color="inherit"
                    >
                        CLOSE SECURE VIEW
                    </Button>
                </DialogContent>
            </Dialog>

            {/* Cancel Confirmation Dialog */}
            <Dialog
                open={!!cancelId}
                onClose={() => setCancelId(null)}
                PaperProps={{ sx: styles.dialogPaper(theme) }}
            >
                <DialogTitle sx={styles.dialogTitleBox}>
                    <Typography variant="h5" fontWeight={950} sx={styles.dialogTitle}>ABORT MISSION?</Typography>
                </DialogTitle>
                <DialogContent sx={styles.dialogContentBox}>
                    <Typography sx={styles.dialogContentText}>
                        Are you sure you want to terminate this high-performance session? This action is permanent and cannot be reversed.
                    </Typography>
                </DialogContent>
                <DialogActions sx={styles.dialogActionsBox}>
                    <Button onClick={() => setCancelId(null)} color="inherit" sx={styles.stayAthleteButton}>STAY ATHLETE</Button>
                    <Button
                        onClick={handleCancelBooking}
                        color="error"
                        variant="contained"
                        autoFocus
                        sx={styles.terminateButton}
                    >
                        YES, TERMINATE
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

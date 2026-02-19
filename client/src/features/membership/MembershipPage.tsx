import { useState, useEffect } from 'react';
import {
    Box, Typography, Card, CardContent, Button, Chip, Divider,
    List, ListItem, ListItemIcon, ListItemText, useTheme, alpha, Grid
} from '@mui/material';
import { membershipService } from '../../services/index';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ScheduleIcon from '@mui/icons-material/Schedule';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import { motion, type Variants } from 'framer-motion';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import type { Theme } from '@mui/material';
import type { Membership } from '../../types';

const PLANS = [
    {
        type: 'MONTHLY',
        name: 'Monthly Unlimited',
        price: '₹99',
        period: '/month',
        description: 'Perfect for consistent training.',
        features: ['Unlimited classes', 'Access to all locations', 'Free towel service', '1 Guest pass/month'],
        popular: false,
        color: '#3b82f6'
    },
    {
        type: 'ANNUAL',
        name: 'Annual Unlimited',
        price: '₹999',
        period: '/year',
        description: 'Best value for committed athletes.',
        features: ['All Monthly benefits', 'Save $189/year', 'Exlusive workshops', 'Priority booking', 'Free merchandise pack'],
        popular: true,
        color: '#8b5cf6'
    },
    {
        type: 'CLASS_PACK_10',
        name: '10 Class Pack',
        price: '₹150',
        period: '',
        description: 'Flexible option for busy schedules.',
        features: ['10 class credits', 'Never expires', 'Shareable with 1 friend', 'Valid at home location'],
        popular: false,
        color: '#10b981'
    },
];

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
            ? `linear-gradient(rgba(6, 9, 15, 0.75), rgba(6, 9, 15, 1)), url(https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop)`
            : `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.95)), url(https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop)`,
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
            content: '"ACCESS"',
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
        mb: 4,
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
    statusGrid: {
        mb: 8
    },
    currentMembershipCard: (theme: Theme, isActive: boolean) => ({
        borderRadius: 2,
        border: '1px solid',
        borderColor: isActive ? alpha(theme.palette.success.main, 0.2) : theme.palette.divider,
        bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.4 : 0.8),
        backdropFilter: 'blur(24px) saturate(160%)',
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: isActive
            ? `inset 0 0 30px ${alpha(theme.palette.success.main, 0.05)}, 0 20px 50px -20px ${alpha(theme.palette.success.main, 0.2)}`
            : theme.palette.mode === 'dark'
                ? `inset 0 0 20px -10px ${alpha('#fff', 0.05)}, 0 10px 30px -15px ${alpha('#000', 0.5)}`
                : `0 10px 30px -15px ${alpha(theme.palette.common.black, 0.1)}`,
        overflow: 'visible',
        position: 'relative'
    }),
    activeBadge: (theme: Theme) => ({
        position: 'absolute',
        top: -14,
        right: 40,
        bgcolor: theme.palette.success.main,
        color: theme.palette.success.contrastText,
        px: 3,
        py: 0.75,
        borderRadius: 0,
        fontWeight: 900,
        fontSize: '0.7rem',
        letterSpacing: '2px',
        boxShadow: `0 8px 16px ${alpha(theme.palette.success.main, 0.4)}`,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        zIndex: 2
    }),
    planCard: (theme: Theme, popular: boolean) => ({
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        position: 'relative',
        overflow: 'visible',
        border: '1px solid',
        borderColor: popular ? alpha(theme.palette.secondary.main, 0.3) : theme.palette.divider,
        bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.3 : 0.7),
        backdropFilter: 'blur(20px)',
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: popular
            ? `0 20px 60px -20px ${alpha(theme.palette.secondary.main, 0.3)}`
            : theme.palette.mode === 'dark'
                ? `0 10px 30px -15px ${alpha('#000', 0.5)}`
                : `0 10px 30px -15px ${alpha(theme.palette.common.black, 0.08)}`,
        '&:hover': {
            transform: 'translateY(-10px) scale(1.02)',
            borderColor: popular ? theme.palette.secondary.main : alpha(theme.palette.primary.main, 0.4),
            boxShadow: popular
                ? `0 30px 80px -20px ${alpha(theme.palette.secondary.main, 0.5)}`
                : `0 25px 60px -20px ${alpha(theme.palette.primary.main, 0.3)}`,
        }
    }),
    popularBadge: (theme: Theme) => ({
        position: 'absolute',
        top: -16,
        left: '50%',
        transform: 'translateX(-50%)',
        bgcolor: theme.palette.secondary.main,
        color: theme.palette.secondary.contrastText,
        px: 3,
        py: 0.75,
        borderRadius: 0,
        fontWeight: 900,
        fontSize: '0.7rem',
        letterSpacing: '3px',
        boxShadow: `0 8px 30px ${alpha(theme.palette.secondary.main, 0.5)}`,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        zIndex: 2
    }),
    planPrice: {
        fontSize: '3.5rem',
        fontWeight: 950,
        letterSpacing: '-2px',
        lineHeight: 1,
        mb: 1
    },
    actionButton: {
        borderRadius: 0,
        fontWeight: 900,
        letterSpacing: '2px',
        py: 2,
        px: 4,
        transition: 'all 0.3s ease'
    },
    featureIcon: (color: string) => ({
        fontSize: '1.2rem',
        color: color,
        opacity: 0.8
    }),
    membershipDetailItem: (theme: Theme) => ({
        p: 3,
        bgcolor: alpha(theme.palette.text.primary, 0.03),
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
    })
};

export default function MembershipPage() {
    const theme = useTheme();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [membership, setMembership] = useState<Membership | null>(null);
    const [loading, setLoading] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; type: string | null }>({ open: false, type: null });

    useEffect(() => {
        fetchMembership();
    }, []);

    const fetchMembership = async () => {
        try {
            const response = await membershipService.getMyMembership();
            setMembership(response.data.membership);
        } catch (error) {
            console.error('Failed to fetch membership:', error);
            showToast('Failed to load membership details', 'error');
        }
    };

    const initiatePurchase = (type: string) => {
        setConfirmDialog({ open: true, type });
    };

    const handlePurchaseConfirm = async () => {
        if (!confirmDialog.type) return;
        const type = confirmDialog.type;
        setConfirmDialog({ open: false, type: null });
        setLoading(true);

        try {
            if (!window.Razorpay) {
                showToast('Razorpay SDK failed to load. Please check your connection.', 'error');
                setLoading(false);
                return;
            }

            const orderRes = await api.post('/memberships/create-order', { type });
            const { order, key } = orderRes.data.data;

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || key,
                amount: order.amount,
                currency: order.currency,
                name: "FITNESS STUDIO",
                description: `ELITE ACCESS: ${type.replace('_', ' ')}`,
                order_id: order.id,
                handler: async (response: any) => {
                    try {
                        await api.post('/memberships/verify-payment', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            type
                        });
                        showToast('ELITE STATUS ACTIVATED', 'success');
                        fetchMembership();
                    } catch (verifyError) {
                        showToast('Verification failed. Contact command.', 'error');
                    }
                },
                prefill: {
                    name: user?.fullName || "ATHLETE",
                    email: user?.email || "",
                },
                theme: { color: theme.palette.primary.main },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error: any) {
            showToast(error.message || 'Payment initiation failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    const isExpiringSoon = membership?.endDate &&
        (new Date(membership.endDate).getTime() - new Date().getTime()) < (7 * 24 * 60 * 60 * 1000);

    return (
        <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible" sx={styles.pageContainer}>
            {/* Cinematic Hero */}
            <Box sx={styles.headerHero(theme)}>
                <Box>
                    <Typography sx={styles.sectionLabel}>ELITE ACCESS</Typography>
                    <Typography variant="h1" sx={styles.headerTitle(theme)}>
                        MEMBERSHIP <Box component="span">STATUS</Box>
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 600, fontWeight: 400, lineHeight: 1.6 }}>
                        Unlock the full potential of your performance. Choose your tier of dominance and claim your place among the elite.
                    </Typography>
                </Box>
            </Box>

            <Box sx={styles.contentWrapper}>
                {/* Current Membership Card */}
                <Typography sx={styles.sectionLabel}>YOUR CLEARANCE</Typography>
                <motion.div variants={itemVariants} style={{ marginBottom: theme.spacing(8) }}>
                    <Card sx={styles.currentMembershipCard(theme, !!membership?.isActive)}>
                        {membership?.isActive && (
                            <Box sx={styles.activeBadge(theme)}>
                                <WorkspacePremiumIcon sx={{ fontSize: '1rem' }} /> VERIFIED ELITE
                            </Box>
                        )}
                        <CardContent sx={{ p: { xs: 4, md: 6 } }}>
                            <Grid container spacing={6} alignItems="center">
                                <Grid size={{ xs: 12, md: 5 }}>
                                    <Typography variant="overline" color="primary.main" fontWeight={900} letterSpacing={4}>
                                        ACTIVE TIER
                                    </Typography>
                                    <Typography variant="h2" fontWeight={950} sx={{ letterSpacing: '-2px', color: 'text.primary', mt: 1, mb: 2 }}>
                                        {membership?.isActive ? membership.type.replace('_', ' ') : 'CORE ACCESS'}
                                    </Typography>
                                    <Chip
                                        icon={membership?.isActive ? (isExpiringSoon ? <ScheduleIcon /> : <CheckCircleIcon />) : <ErrorIcon />}
                                        label={membership?.isActive ? (isExpiringSoon ? 'VELOCITY REDUCING' : 'OPTIMAL STATUS') : 'ACCESS DENIED'}
                                        color={membership?.isActive ? (isExpiringSoon ? 'warning' : 'success') : 'error'}
                                        sx={{ borderRadius: 0, fontWeight: 900, letterSpacing: '1px' }}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, md: 7 }}>
                                    {membership ? (
                                        <Grid container spacing={2}>
                                            <Grid size={{ xs: 12, sm: 4 }}>
                                                <Box sx={styles.membershipDetailItem(theme)}>
                                                    <Typography variant="overline" color="text.secondary" fontWeight={900}>TERMINATION</Typography>
                                                    <Typography variant="h6" fontWeight={900}>
                                                        {new Date(membership.endDate!).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 4 }}>
                                                <Box sx={styles.membershipDetailItem(theme)}>
                                                    <Typography variant="overline" color="text.secondary" fontWeight={900}>CAPACITY</Typography>
                                                    <Typography variant="h6" fontWeight={900} color="primary.main">
                                                        {membership.creditsRemaining ?? '∞'} MISSIONS
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 4 }}>
                                                <Box sx={styles.membershipDetailItem(theme)}>
                                                    <Typography variant="overline" color="text.secondary" fontWeight={900}>INDUCTION</Typography>
                                                    <Typography variant="h6" fontWeight={900}>
                                                        {new Date(membership.startDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }).toUpperCase()}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    ) : (
                                        <Box sx={{ p: 4, bgcolor: alpha(theme.palette.text.primary, 0.02), border: `1px dashed ${theme.palette.divider}`, textAlign: 'center' }}>
                                            <FitnessCenterIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2, opacity: 0.3 }} />
                                            <Typography variant="body1" sx={{ fontWeight: 700, opacity: 0.5, letterSpacing: '1px', color: 'text.secondary' }}>
                                                ZERO ACTIVE SUBSCRIPTIONS DETECTED. SELECT A MISSION TIER BELOW.
                                            </Typography>
                                        </Box>
                                    )}
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Available Plans */}
                <Typography sx={styles.sectionLabel} textAlign="center">MISSION ARCHITECTURE</Typography>
                <Typography variant="h2" fontWeight={950} textAlign="center" sx={{ color: 'text.primary', letterSpacing: '-3px', mb: 8 }}>
                    AVAILABLE <Box component="span" sx={{ color: 'primary.main' }}>TIERS</Box>
                </Typography>

                <Grid container spacing={4} alignItems="stretch">
                    {PLANS.map((plan) => (
                        <Grid size={{ xs: 12, md: 4 }} key={plan.type}>
                            <motion.div variants={itemVariants} style={{ height: '100%' }}>
                                <Card sx={styles.planCard(theme, plan.popular)}>
                                    {plan.popular && (
                                        <Box sx={styles.popularBadge(theme)}>
                                            <WorkspacePremiumIcon sx={{ fontSize: '1rem' }} /> ELITE SPEC
                                        </Box>
                                    )}
                                    <CardContent sx={{ flexGrow: 1, p: 5, pt: plan.popular ? 8 : 6 }}>
                                        <Box textAlign="center" mb={4}>
                                            <Typography variant="overline" fontWeight={950} sx={{ color: plan.color, letterSpacing: '4px' }}>
                                                {plan.name.toUpperCase()}
                                            </Typography>
                                            <Box display="flex" justifyContent="center" alignItems="baseline" mt={2}>
                                                <Typography sx={styles.planPrice} color="text.primary">
                                                    {plan.price}
                                                </Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 900, color: 'text.secondary', ml: 1 }}>
                                                    {plan.period.toUpperCase()}
                                                </Typography>
                                            </Box>
                                            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, fontWeight: 500, opacity: 0.7 }}>
                                                {plan.description.toUpperCase()}
                                            </Typography>
                                        </Box>

                                        <Divider sx={{ mb: 4, borderColor: theme.palette.divider }} />

                                        <List disablePadding>
                                            {plan.features.map((feature, idx) => (
                                                <ListItem key={idx} disableGutters sx={{ py: 1.5 }}>
                                                    <ListItemIcon sx={{ minWidth: 40 }}>
                                                        <CheckCircleIcon sx={styles.featureIcon(plan.color)} />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={feature.toUpperCase()}
                                                        primaryTypographyProps={{ variant: 'caption', fontWeight: 900, letterSpacing: '1px', color: 'text.primary', sx: { opacity: 0.8 } }}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </CardContent>
                                    <Box sx={{ p: 5, pt: 0 }}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            onClick={() => initiatePurchase(plan.type)}
                                            disabled={loading || (membership?.isActive && membership?.type === plan.type)}
                                            sx={{
                                                ...styles.actionButton,
                                                bgcolor: plan.popular ? 'secondary.main' : alpha(theme.palette.primary.main, 0.9),
                                                color: plan.popular ? 'secondary.contrastText' : 'primary.contrastText',
                                                '&:hover': {
                                                    bgcolor: plan.popular ? 'secondary.dark' : 'primary.main',
                                                    boxShadow: `0 10px 30px ${alpha(plan.popular ? theme.palette.secondary.main : theme.palette.primary.main, 0.4)}`
                                                }
                                            }}
                                        >
                                            {membership?.isActive && membership?.type === plan.type ? 'ACTIVE STATION' : 'INITIATE ACCESS'}
                                        </Button>
                                    </Box>
                                </Card>
                            </motion.div>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            <ConfirmationDialog
                open={confirmDialog.open}
                title="MEMBERSHIP INDUCTION"
                message={`Are you prepared to commit to the ${confirmDialog.type?.replace('_', ' ').toUpperCase()} mission profile? This induction will unlock advanced studio clearances.`}
                onConfirm={handlePurchaseConfirm}
                onCancel={() => setConfirmDialog({ open: false, type: null })}
                confirmText="INITIALIZE PAYMENT"
            />
        </Box>
    );
}

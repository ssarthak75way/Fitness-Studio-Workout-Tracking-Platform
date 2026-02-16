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
import { motion } from 'framer-motion';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';

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
        price: '₹10',
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

const styles = {
    pageContainer: {
        maxWidth: 1200,
        mx: 'auto',
        px: { xs: 2, md: 4 },
        py: 4
    },
    pageHeader: { mb: 6, textAlign: 'center' },
    pageTitle: (theme: any) => ({
        background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        mb: 1
    }),
    currentMembershipCard: (theme: any, isActive: boolean) => ({
        mb: 8,
        borderRadius: 4,
        overflow: 'visible',
        border: `1px solid ${isActive ? alpha(theme.palette.success.main, 0.3) : theme.palette.divider}`,
        background: theme.palette.background.paper,
        boxShadow: isActive ? `0 8px 32px ${alpha(theme.palette.success.main, 0.1)}` : theme.shadows[1],
        position: 'relative'
    }),
    activeBadge: (theme: any) => ({
        position: 'absolute',
        top: -12,
        left: '50%',
        transform: 'translateX(-50%)',
        bgcolor: theme.palette.success.main,
        color: 'white',
        px: 2,
        py: 0.5,
        borderRadius: 10,
        fontWeight: 700,
        fontSize: '0.75rem',
        letterSpacing: '0.05em',
        boxShadow: theme.shadows[4],
        display: 'flex',
        alignItems: 'center',
        gap: 0.5
    }),
    badgeIcon: { fontSize: 16 },
    membershipDetailsBox: (theme: any) => ({
        bgcolor: alpha(theme.palette.background.default, 0.5),
        p: 3,
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`
    }),
    noMembershipBox: (theme: any) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        mt: { xs: 2, md: 0 },
        p: 2,
        borderRadius: 2,
        bgcolor: alpha(theme.palette.info.main, 0.05)
    }),
    noMembershipIcon: { fontSize: 40, opacity: 0.8 },
    planCard: (theme: any, popular: boolean) => ({
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 4,
        position: 'relative',
        overflow: 'visible',
        border: popular ? `2px solid ${theme.palette.secondary.main}` : `1px solid ${theme.palette.divider}`,
        boxShadow: popular ? `0 12px 48px ${alpha(theme.palette.secondary.main, 0.15)}` : theme.shadows[2],
    }),
    popularBadge: (theme: any) => ({
        position: 'absolute',
        top: -16,
        left: '50%',
        transform: 'translateX(-50%)',
        bgcolor: theme.palette.secondary.main,
        color: 'white',
        px: 3,
        py: 0.75,
        borderRadius: 10,
        fontWeight: 700,
        fontSize: '0.875rem',
        letterSpacing: '0.05em',
        boxShadow: theme.shadows[4],
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        zIndex: 1
    }),
    popularBadgeIcon: { fontSize: 18 },
    planName: (color: string) => ({
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        fontSize: '0.85rem',
        mb: 1,
        color: color
    }),
    planFeatureItem: { py: 0.75 },
    planFeatureIcon: (color: string) => ({ fontSize: 20, color: color }),
    purchaseButton: (theme: any, popular: boolean) => ({
        py: 1.5,
        fontWeight: 700,
        borderRadius: 2,
        boxShadow: popular ? theme.shadows[4] : 'none',
        borderWidth: popular ? 0 : 2,
        '&:hover': {
            borderWidth: popular ? 0 : 2,
        }
    })
};

export default function MembershipPage() {
    const theme = useTheme();
    const { user } = useAuth();
    const [membership, setMembership] = useState<any>(null);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchMembership();
    }, []);

    const fetchMembership = async () => {
        try {
            const response = await membershipService.getMyMembership();
            setMembership(response.data.membership);
        } catch (error: any) {
            console.error('Failed to fetch membership:', error);
        }
    };

    const { showToast } = useToast();
    const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; type: string | null }>({ open: false, type: null });

    const initiatePurchase = (type: string) => {
        setConfirmDialog({ open: true, type });
    };

    const handlePurchaseConfirm = async () => {
        if (!confirmDialog.type) return;
        const type = confirmDialog.type;
        setConfirmDialog({ open: false, type: null });
        setLoading(true);

        try {
            // 0. Check if Razorpay is loaded
            if (!(window as any).Razorpay) {
                showToast('Razorpay SDK failed to load. Please check your internet connection.', 'error');
                setLoading(false);
                return;
            }

            // 1. Create Order
            const orderRes = await api.post('/memberships/create-order', { type });
            const { order, key } = orderRes.data.data;

            // 2. Open Razorpay
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || key,
                amount: order.amount,
                currency: order.currency,
                name: "Fitness Studio",
                description: `Membership: ${type.replace('_', ' ')}`,
                order_id: order.id,
                handler: async (response: any) => {
                    try {
                        // 3. Verify Payment
                        await api.post('/memberships/verify-payment', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            type
                        });
                        showToast('Membership activated successfully!', 'success');
                        fetchMembership();
                    } catch (verifyError) {
                        console.error(verifyError);
                        showToast('Payment verification failed. Please contact support.', 'error');
                    }
                },
                prefill: {
                    name: user?.fullName || "User",
                    email: user?.email || "",
                },
                theme: {
                    color: theme.palette.primary.main,
                },
            };

            const rzp = new (window as any).Razorpay(options);

            rzp.on('payment.failed', (response: any) => {
                console.error('Razorpay Payment Failed:', response.error);
                showToast(`Payment failed: ${response.error.description}`, 'error');
            });

            rzp.open();

        } catch (error: any) {
            console.error(error);
            showToast(error.response?.data?.message || 'Failed to initiate payment', 'error');
        } finally {
            setLoading(false);
        }
    };

    const isExpiringSoon = membership?.endDate &&
        (new Date(membership.endDate).getTime() - new Date().getTime()) < (7 * 24 * 60 * 60 * 1000);

    return (
        <Box sx={styles.pageContainer}>
            <Box sx={styles.pageHeader}>
                <Typography variant="h3" fontWeight={800} sx={styles.pageTitle(theme)}>
                    Membership & Plans
                </Typography>
                <Typography variant="h6" color="text.secondary" fontWeight={400}>
                    Choose the plan that fits your fitness journey.
                </Typography>
            </Box>

            {/* Current Membership Card */}
            <Card sx={styles.currentMembershipCard(theme, membership?.isActive)}>
                {membership?.isActive && (
                    <Box sx={styles.activeBadge(theme)}>
                        <CheckCircleIcon sx={styles.badgeIcon} /> ACTIVE MEMBERSHIP
                    </Box>
                )}
                <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                    <Grid container spacing={4} alignItems="center">
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Typography variant="overline" color="text.secondary" fontWeight={700} letterSpacing="0.1em">
                                CURRENT STATUS
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1.5} mt={1} mb={0.5}>
                                <Typography variant="h4" fontWeight={800}>
                                    {membership?.isActive ? membership.type.replace('_', ' ') : 'No Active Plan'}
                                </Typography>
                            </Box>
                            {membership && (
                                <Chip
                                    icon={membership.isActive ? (isExpiringSoon ? <ScheduleIcon /> : <CheckCircleIcon />) : <ErrorIcon />}
                                    label={membership.isActive ? (isExpiringSoon ? 'Expiring Soon' : 'Active') : 'Expired'}
                                    color={membership.isActive ? (isExpiringSoon ? 'warning' : 'success') : 'error'}
                                    variant="filled"
                                    sx={{ fontWeight: 700, borderRadius: 1.5 }}
                                />
                            )}
                        </Grid>

                        <Grid size={{ xs: 12, md: 8 }}>
                            {membership ? (
                                <Box sx={styles.membershipDetailsBox(theme)}>
                                    <Grid container spacing={3}>
                                        {membership.endDate && (
                                            <Grid size={{ xs: 12, sm: 4 }}>
                                                <Box display="flex" flexDirection="column">
                                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>EXPIRATION DATE</Typography>
                                                    <Typography variant="h6" fontWeight={700}>
                                                        {new Date(membership.endDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        )}
                                        {membership.creditsRemaining !== undefined && (
                                            <Grid size={{ xs: 12, sm: 4 }}>
                                                <Box display="flex" flexDirection="column">
                                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>REMAINING CREDITS</Typography>
                                                    <Typography variant="h6" fontWeight={700} color="primary.main">
                                                        {membership.creditsRemaining} Classes
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        )}
                                        <Grid size={{ xs: 12, sm: 4 }}>
                                            <Box display="flex" flexDirection="column">
                                                <Typography variant="caption" color="text.secondary" fontWeight={600}>MEMBER SINCE</Typography>
                                                <Typography variant="h6" fontWeight={700}>
                                                    {new Date(membership.startDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Box>
                            ) : (
                                <Box sx={styles.noMembershipBox(theme)}>
                                    <FitnessCenterIcon color="primary" sx={styles.noMembershipIcon} />
                                    <Typography variant="body1" color="text.secondary">
                                        You don't have an active membership yet. Select a plan below to unlock your full potential!
                                    </Typography>
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Typography variant="h4" gutterBottom fontWeight={800} textAlign="center" mb={6}>
                Available Plans
            </Typography>

            <Grid container spacing={4} alignItems="stretch">
                {PLANS.map((plan) => (
                    <Grid size={{ xs: 12, md: 4 }} key={plan.type}>
                        <motion.div
                            whileHover={{ y: -8 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                            style={{ height: '100%' }}
                        >
                            <Card sx={styles.planCard(theme, plan.popular)}>
                                {plan.popular && (
                                    <Box sx={styles.popularBadge(theme)}>
                                        <WorkspacePremiumIcon sx={styles.popularBadgeIcon} /> MOST POPULAR
                                    </Box>
                                )}
                                <CardContent sx={{ flexGrow: 1, p: 4, pt: plan.popular ? 5 : 4 }}>
                                    <Box textAlign="center" mb={3}>
                                        <Typography variant="h6" fontWeight={700} sx={styles.planName(plan.color)}>
                                            {plan.name}
                                        </Typography>
                                        <Box display="flex" justifyContent="center" alignItems="baseline">
                                            <Typography variant="h3" fontWeight={800} color="text.primary">
                                                {plan.price}
                                            </Typography>
                                            <Typography variant="h6" color="text.secondary" fontWeight={500}>
                                                {plan.period}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" mt={1}>
                                            {plan.description}
                                        </Typography>
                                    </Box>

                                    <Divider sx={{ mb: 3 }} />

                                    <List disablePadding>
                                        {plan.features.map((feature, idx) => (
                                            <ListItem key={idx} disableGutters sx={styles.planFeatureItem}>
                                                <ListItemIcon sx={{ minWidth: 32 }}>
                                                    <CheckCircleIcon sx={styles.planFeatureIcon(plan.color)} />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={feature}
                                                    primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </CardContent>
                                <Box sx={{ p: 4, pt: 0 }}>
                                    <Button
                                        fullWidth
                                        variant={plan.popular ? "contained" : "outlined"}
                                        color={plan.popular ? "secondary" : "primary"}
                                        onClick={() => initiatePurchase(plan.type)}
                                        disabled={loading || (membership?.isActive && membership?.type === plan.type)}
                                        size="large"
                                        sx={styles.purchaseButton(theme, plan.popular)}
                                    >
                                        {membership?.isActive && membership?.type === plan.type ? 'Current Plan' : 'Choose Plan'}
                                    </Button>
                                </Box>
                            </Card>
                        </motion.div>
                    </Grid>
                ))}
            </Grid>

            <ConfirmationDialog
                open={confirmDialog.open}
                title="Confirm Purchase"
                message={`Are you sure you want to purchase the ${confirmDialog.type?.replace('_', ' ')} plan?`}
                onConfirm={handlePurchaseConfirm}
                onCancel={() => setConfirmDialog({ open: false, type: null })}
                confirmText="Proceed to Pay"
            />
        </Box>
    );
}

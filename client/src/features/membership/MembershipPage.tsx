import { useState, useEffect } from 'react';
import {
    Box, Typography, Card, CardContent, Button, Chip, Divider,
    List, ListItem, ListItemIcon, ListItemText, useTheme, Grid,
    TextField, InputAdornment, alpha
} from '@mui/material';
import { membershipService } from '../../services/index';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ScheduleIcon from '@mui/icons-material/Schedule';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import { motion, type Variants } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

import { useToast } from '../../context/ToastContext';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import type { Membership } from '../../types';
import { styles } from './MembershipPageStyle';

interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}
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

const CORPORATE_CODES: Record<string, number> = {
    'GOOGLE60': 0.6,
    'AMAZON50': 0.5,
    'META40': 0.4,
    'CORP30': 0.3,
};

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



export default function MembershipPage() {
    const theme = useTheme();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [membership, setMembership] = useState<Membership | null>(null);
    const [loading, setLoading] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; type: string | null }>({ open: false, type: null });
    const [discountCode, setDiscountCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState<number | null>(null);
    const [codeError, setCodeError] = useState('');

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

        interface PurchaseResponseData {
            order?: { id: string; amount: number; currency: string };
            key?: string;
            membership?: Membership;
            amount?: number;
        }

        try {
            if (!window.Razorpay) {
                showToast('Razorpay SDK failed to load.', 'error');
                setLoading(false);
                return;
            }

            // Decide between fresh purchase or plan change
            let response;
            if (membership?.isActive) {
                response = await membershipService.changePlan(type);
            } else {
                response = await membershipService.createOrder(type);
            }

            const data = response.data as PurchaseResponseData;
            const { order, key, membership: updatedMembership, amount } = data;


            // If amount is 0 or updatingMembership is returned, it was an instant switch (credit/zero cost)
            if (updatedMembership || (amount !== undefined && amount === 0)) {
                showToast('PLAN UPDATED SUCCESSFULLY', 'success');
                fetchMembership();
                return;
            }

            if (!order) {
                showToast('Failed to initialize payment gateway', 'error');
                return;
            }

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || key,
                amount: order.amount,
                currency: order.currency,
                name: "FITNESS STUDIO",
                description: `TIER TRANSITION: ${type.replace('_', ' ')}`,
                order_id: order.id,
                handler: async (response: RazorpayResponse) => {
                    try {
                        await membershipService.verifyPayment({
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
        } catch (error: unknown) {
            showToast((error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to process upgrade.', 'error');
        } finally {
            setLoading(false);
        }
    };


    const applyDiscountCode = () => {
        const code = discountCode.trim().toUpperCase();
        if (CORPORATE_CODES[code]) {
            setAppliedDiscount(CORPORATE_CODES[code]);
            setCodeError('');
            showToast(`CORPORATE DISCOUNT APPLIED: ${Math.round(CORPORATE_CODES[code] * 100)}% OFF`, 'success');
        } else {
            setCodeError('Invalid or unrecognized corporate code.');
            setAppliedDiscount(null);
        }
    };

    const getDiscountedPrice = (basePrice: string): string => {
        if (!appliedDiscount) return basePrice;
        const numericPrice = parseFloat(basePrice.replace('₹', '').replace(',', ''));
        const discounted = Math.round(numericPrice * (1 - appliedDiscount));
        return `₹${discounted}`;
    };

    const isExpiringSoon = membership?.endDate &&
        (new Date(membership.endDate).getTime() - new Date().getTime()) < (7 * 24 * 60 * 60 * 1000);

    return (
        <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible" sx={styles.pageContainer}>
            {/* Cinematic Hero */}
            <Box sx={styles.headerHero(theme)}>
                <Box>
                    <Typography sx={styles.sectionLabel(theme)}>ELITE ACCESS</Typography>
                    <Typography variant="h1" sx={styles.headerTitle(theme)}>
                        MEMBERSHIP <Box component="span">STATUS</Box>
                    </Typography>
                    <Typography variant="h6" sx={styles.headerSubtitle}>
                        Unlock the full potential of your performance. Choose your tier of dominance and claim your place among the elite.
                    </Typography>
                </Box>
            </Box>

            <Box sx={styles.contentWrapper}>
                {/* Current Membership Card */}
                <Typography sx={styles.sectionLabel(theme)}>YOUR CLEARANCE</Typography>
                <motion.div variants={itemVariants} style={{ marginBottom: theme.spacing(8) }}>
                    <Card sx={styles.currentMembershipCard(theme, !!membership?.isActive)}>
                        {membership?.isActive && (
                            <Box sx={styles.activeBadge(theme)}>
                                <WorkspacePremiumIcon sx={{ fontSize: '1rem' }} /> VERIFIED ELITE
                            </Box>
                        )}
                        <CardContent sx={styles.cardContent}>
                            <Grid container spacing={6} alignItems="center">
                                <Grid size={{ xs: 12, md: 5 }}>
                                    <Typography variant="overline" color="primary.main" fontWeight={900} letterSpacing={4}>
                                        ACTIVE TIER
                                    </Typography>
                                    <Typography variant="h2" fontWeight={950} sx={styles.activeTierTitle}>
                                        {membership?.isActive ? membership.type.replace('_', ' ') : 'CORE ACCESS'}
                                    </Typography>
                                    <Chip
                                        icon={membership?.isActive ? (isExpiringSoon ? <ScheduleIcon /> : <CheckCircleIcon />) : <ErrorIcon />}
                                        label={membership?.isActive ? (isExpiringSoon ? 'VELOCITY REDUCING' : 'OPTIMAL STATUS') : 'ACCESS DENIED'}
                                        color={membership?.isActive ? (isExpiringSoon ? 'warning' : 'success') : 'error'}
                                        sx={styles.statusChip}
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
                                        <Box sx={styles.noMembershipBox(theme)}>
                                            <FitnessCenterIcon sx={styles.noMembershipIcon} />
                                            <Typography variant="body1" sx={styles.noMembershipText}>
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
                <Typography sx={styles.sectionLabel(theme)} textAlign="center">MISSION ARCHITECTURE</Typography>
                <Typography variant="h2" fontWeight={950} textAlign="center" sx={styles.availableTiersTitle}>
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
                                    <CardContent sx={styles.planHeader(plan.popular)}>
                                        <Box textAlign="center" mb={4}>
                                            <Typography variant="overline" fontWeight={950} sx={styles.planName(plan.color)}>
                                                {plan.name.toUpperCase()}
                                            </Typography>
                                            <Box display="flex" justifyContent="center" alignItems="baseline" mt={2}>
                                                <Typography sx={styles.planPrice} color="text.primary">
                                                    {plan.price}
                                                </Typography>
                                                <Typography variant="h6" sx={styles.planPeriod}>
                                                    {plan.period.toUpperCase()}
                                                </Typography>
                                            </Box>
                                            <Typography variant="body2" sx={styles.planDescription}>
                                                {plan.description.toUpperCase()}
                                            </Typography>
                                        </Box>

                                        <Divider sx={styles.divider(theme)} />

                                        <List disablePadding>
                                            {plan.features.map((feature, idx) => (
                                                <ListItem key={idx} disableGutters sx={styles.featureItem}>
                                                    <ListItemIcon sx={styles.featureIconWrapper}>
                                                        <CheckCircleIcon sx={styles.featureIcon(plan.color)} />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={feature.toUpperCase()}
                                                        sx={{ ...styles.featureText }}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </CardContent>
                                    <Box sx={styles.planActionBox}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            onClick={() => initiatePurchase(plan.type)}
                                            disabled={loading || (membership?.isActive && membership?.type === plan.type)}
                                            sx={styles.planActionButton(theme, plan.popular)}
                                        >
                                            {membership?.isActive && membership?.type === plan.type ? 'ACTIVE STATION' : 'INITIATE ACCESS'}
                                        </Button>
                                    </Box>
                                </Card>
                            </motion.div>
                        </Grid>
                    ))}
                </Grid>

                {/* Pricing & Policies */}
                <Box mt={12}>
                    <Typography sx={styles.sectionLabel(theme)} textAlign="center">PROTOCOLS & POLICIES</Typography>
                    <Typography variant="h3" fontWeight={950} textAlign="center" sx={{ mb: 6 }}>
                        TRANSITION <Box component="span" sx={{ color: 'primary.main' }}>LOGIC</Box>
                    </Typography>

                    <Grid container spacing={4}>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Card sx={{ ...styles.card(theme), p: 4 }}>
                                <Typography variant="h6" fontWeight={900} color="primary" gutterBottom>PRORATED BILLING</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                                    UPGRADING MID-CYCLE? WE AUTOMATICALLY CALCULATE THE UNUSED VALUE OF YOUR CURRENT TIER AND APPLY IT AS CREDIT TOWARDS YOUR NEW ELITE STATUS. YOU ONLY PAY THE REMAINDER for THE CURRENT PERIOD.
                                </Typography>
                            </Card>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Card sx={{ ...styles.card(theme), p: 4 }}>
                                <Typography variant="h6" fontWeight={900} color="secondary" gutterBottom>COOLING PERIOD</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                                    TIER DOWNGRADES OR TRANSITIONS REQUIRE A 30-DAY STABILIZATION PERIOD. THIS ENSURES OPERATIONAL CONSISTENCY AND PREVENTS HIGH-FREQUENCY ALTERATIONS TO YOUR PERFORMANCE PROFILE.
                                </Typography>
                            </Card>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Card sx={{ ...styles.card(theme), p: 4 }}>
                                <Typography variant="h6" fontWeight={900} color="info" gutterBottom>CLASS PACK FLEX</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                                    CONVERTING UNUSED CREDITS? CLASS PACKS RETAIN THEIR VALUE. WHEN SWITCHING TO UNLIMITED TIERS, YOUR REMAINING CREDITS ARE CONVERTED TO ACCOUNT CREDIT FOR YOUR INITIAL INDUCTION.
                                </Typography>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>

                {/* Corporate Wellness Section */}
                <Box sx={{ mt: 8, mb: 4 }}>
                    <Typography sx={styles.sectionLabel(theme)}>CORPORATE WELLNESS</Typography>
                    <Card sx={{ ...styles.card(theme), p: 4, border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}` }}>
                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                            <WorkspacePremiumIcon sx={{ color: 'warning.main', fontSize: '2rem' }} />
                            <Box>
                                <Typography variant="h6" fontWeight={900} color="warning.main">EMPLOYER WELLNESS BENEFIT</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Have an employer wellness code? Apply it to unlock subsidized rates on any plan.
                                </Typography>
                            </Box>
                        </Box>
                        <Box display="flex" gap={2} flexWrap="wrap" alignItems="flex-start">
                            <TextField
                                label="CORPORATE CODE"
                                placeholder="e.g. GOOGLE60"
                                value={discountCode}
                                onChange={(e) => { setDiscountCode(e.target.value); setCodeError(''); }}
                                error={!!codeError}
                                helperText={codeError || (appliedDiscount ? `${Math.round(appliedDiscount * 100)}% corporate discount active` : ' ')}
                                FormHelperTextProps={{ sx: { color: appliedDiscount ? 'success.main' : 'error.main', fontWeight: 700 } }}
                                InputProps={{
                                    endAdornment: appliedDiscount ? (
                                        <InputAdornment position="end">
                                            <Chip label="ACTIVE" color="success" size="small" sx={{ fontWeight: 900, borderRadius: 0.5 }} />
                                        </InputAdornment>
                                    ) : undefined
                                }}
                                sx={{
                                    minWidth: 220,
                                    '& .MuiOutlinedInput-root': {
                                        fontWeight: 700,
                                        letterSpacing: '1px',
                                        borderColor: appliedDiscount ? 'success.main' : undefined
                                    }
                                }}
                            />
                            <Button
                                variant="contained"
                                color="warning"
                                onClick={applyDiscountCode}
                                disabled={!discountCode.trim()}
                                sx={{ fontWeight: 900, borderRadius: 1, py: 1.8, px: 4, letterSpacing: '1px' }}
                            >
                                APPLY CODE
                            </Button>
                            {appliedDiscount && (
                                <Button
                                    variant="outlined"
                                    color="inherit"
                                    onClick={() => { setAppliedDiscount(null); setDiscountCode(''); }}
                                    sx={{ fontWeight: 900, borderRadius: 1, py: 1.8, px: 3, letterSpacing: '1px' }}
                                >
                                    REMOVE
                                </Button>
                            )}
                        </Box>
                        {appliedDiscount && (
                            <Box mt={2} p={2} bgcolor={alpha(theme.palette.success.main, 0.07)} borderRadius={1} border={`1px solid ${alpha(theme.palette.success.main, 0.2)}`}>
                                <Typography variant="caption" fontWeight={900} letterSpacing="1px" color="success.main">
                                    DISCOUNTED PRICES APPLIED — MONTHLY: {getDiscountedPrice('₹99')} / ANNUAL: {getDiscountedPrice('₹999')} / CLASS PACK: {getDiscountedPrice('₹150')}
                                </Typography>
                            </Box>
                        )}
                    </Card>
                </Box>
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

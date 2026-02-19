import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Grid,
    alpha,
    useTheme,
    Stack
} from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { format } from 'date-fns';
import type { Payment } from '../../types';

interface PaymentDetailModalProps {
    open: boolean;
    onClose: () => void;
    payment: Payment;
}

const styles = {
    dialogPaper: {
        borderRadius: 2,
        bgcolor: 'background.default',
        backgroundImage: `linear-gradient(rgba(6, 9, 15, 0.8), rgba(6, 9, 15, 1))`,
        border: '1px solid rgba(255,255,255,0.08)',
        overflow: 'hidden',
        backdropFilter: 'blur(20px)'
    },
    sectionLabel: {
        color: 'primary.main',
        fontWeight: 950,
        letterSpacing: '4px',
        mb: 2,
        display: 'block',
        textTransform: 'uppercase',
        fontSize: '0.65rem',
        opacity: 0.8
    },
    detailBox: {
        p: 2.5,
        bgcolor: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.05)',
        mb: 2
    },
    valueText: {
        color: '#fff',
        fontWeight: 900,
        letterSpacing: '-0.5px',
        fontSize: '1rem'
    },
    captionText: {
        color: 'rgba(255,255,255,0.4)',
        fontWeight: 700,
        letterSpacing: '1px',
        fontSize: '0.65rem',
        mb: 0.5
    },
    actionButton: {
        borderRadius: 0,
        fontWeight: 900,
        letterSpacing: '2px',
        py: 2,
        transition: 'all 0.3s ease'
    }
};

export default function PaymentDetailModal({ open, onClose, payment }: PaymentDetailModalProps) {
    const theme = useTheme();

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{ sx: styles.dialogPaper }}
        >
            <DialogTitle sx={{ p: 4, pb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <ReceiptLongIcon sx={{ color: 'primary.main', fontSize: '2rem' }} />
                <Box>
                    <Typography sx={styles.sectionLabel} mb={0.5}>MISSION DATA</Typography>
                    <Typography variant="h5" fontWeight={950} sx={{ letterSpacing: '-1px', color: '#fff' }}>
                        PAYMENT INTEL
                    </Typography>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ px: 4, py: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} p={2} borderLeft="4px solid" borderColor={payment.status === 'SUCCESS' ? 'success.main' : 'error.main'} bgcolor={alpha(payment.status === 'SUCCESS' ? theme.palette.success.main : theme.palette.error.main, 0.05)}>
                    <Typography sx={styles.captionText} mb={0}>CLEARANCE STATUS</Typography>
                    <Typography fontWeight={950} color={payment.status === 'SUCCESS' ? 'success.main' : 'error.main'} sx={{ letterSpacing: '1px', fontSize: '0.8rem' }}>
                        {payment.status.toUpperCase()}
                    </Typography>
                </Box>

                <Stack spacing={2}>
                    <Grid container spacing={2}>
                        <Grid size={6}>
                            <Box sx={styles.detailBox}>
                                <Typography sx={styles.captionText}>MISSION PLAN</Typography>
                                <Typography sx={styles.valueText}>{payment.planType.replace('_', ' ').toUpperCase()}</Typography>
                            </Box>
                        </Grid>
                        <Grid size={6}>
                            <Box sx={styles.detailBox}>
                                <Typography sx={styles.captionText}>PAYLOAD</Typography>
                                <Typography sx={styles.valueText} color="primary.main !important">₹{payment.amount}</Typography>
                            </Box>
                        </Grid>
                    </Grid>

                    <Box sx={styles.detailBox}>
                        <Typography sx={styles.captionText}>PAYMENT SIGNATURE</Typography>
                        <Typography variant="body2" sx={{ wordBreak: 'break-all', fontFamily: 'monospace', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
                            {payment.razorpayPaymentId || 'UNREGISTERED_DATA'}
                        </Typography>
                    </Box>

                    <Box sx={styles.detailBox}>
                        <Typography sx={styles.captionText}>ORDER REFERENCE</Typography>
                        <Typography variant="body2" sx={{ wordBreak: 'break-all', fontFamily: 'monospace', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
                            {payment.razorpayOrderId}
                        </Typography>
                    </Box>

                    <Box sx={styles.detailBox}>
                        <Typography sx={styles.captionText}>CHRONO STAMP</Typography>
                        <Typography sx={styles.valueText}>
                            {format(new Date(payment.createdAt), 'PPP p').toUpperCase()}
                        </Typography>
                    </Box>
                </Stack>

                <Box
                    sx={{
                        mt: 4,
                        p: 3,
                        border: '1px dashed rgba(255,255,255,0.1)',
                        bgcolor: alpha(theme.palette.primary.main, 0.02)
                    }}
                >
                    <Typography variant="caption" align="center" sx={{ color: 'primary.main', fontWeight: 900, display: 'block', letterSpacing: '2px' }}>
                        VERIFIED TRANSACTION ARCHIVE
                    </Typography>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 4, pt: 2 }}>
                <Button
                    onClick={onClose}
                    variant="contained"
                    fullWidth
                    sx={{ ...styles.actionButton, bgcolor: 'primary.main', color: '#fff' }}
                >
                    CLOSE REPORT
                </Button>
            </DialogActions>
        </Dialog>
    );
}

import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    CircularProgress,
    alpha,
    useTheme
} from '@mui/material';
import type { Theme } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { format } from 'date-fns';
import { paymentService } from '../../services/payment.service';
import PaymentDetailModal from './PaymentDetailModal';
import type { Payment } from '../../types';

const styles = {
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center',
        py: 8
    },
    tableContainer: {
        borderRadius: 0,
        overflow: 'hidden',
        bgcolor: 'transparent',
        boxShadow: 'none',
        border: '1px solid rgba(255,255,255,0.08)'
    },
    tableHeader: (theme: Theme) => ({
        bgcolor: alpha(theme.palette.primary.main, 0.05),
        '& .MuiTableCell-root': {
            color: 'primary.main',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            fontWeight: 900,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            fontSize: '0.65rem',
            py: 2
        }
    }),
    emptyRow: {
        py: 6
    },
    emptyText: {
        opacity: 0.4,
        fontWeight: 700,
        letterSpacing: '1px'
    },
    tableRow: (theme: Theme) => ({
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        '&:hover': {
            bgcolor: alpha(theme.palette.primary.main, 0.03),
            '& .MuiTableCell-root': { color: 'primary.main' }
        },
        '& .MuiTableCell-root': {
            borderBottom: '1px solid rgba(255,255,255,0.03)',
            color: theme.palette.text.primary,
            fontWeight: 600,
            fontSize: '0.85rem',
            py: 2.5
        }
    }),
    dateCell: {
        fontWeight: 800
    },
    amountCell: {
        fontWeight: 900
    },
    statusChip: (theme: Theme, status: string) => ({
        borderRadius: 0,
        fontWeight: 900,
        fontSize: '0.6rem',
        letterSpacing: '1px',
        bgcolor: status === 'SUCCESS' ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1),
        color: status === 'SUCCESS' ? 'success.main' : 'error.main',
        border: `1px solid ${alpha(status === 'SUCCESS' ? theme.palette.success.main : theme.palette.error.main, 0.2)}`
    }),
    actionIcon: {
        color: 'primary.main'
    },
    visibilityIcon: {
        fontSize: '1.2rem'
    }
};

export default function PaymentHistory() {
    const theme = useTheme();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const response = await paymentService.getMyPayments();
                setPayments(response.data.payments);
            } catch (error) {
                console.error('Failed to fetch payments:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, []);

    const handleViewDetails = (payment: Payment) => {
        setSelectedPayment(payment);
        setIsModalOpen(true);
    };

    if (loading) {
        return (
            <Box sx={styles.loadingContainer}>
                <CircularProgress color="primary" thickness={5} />
            </Box>
        );
    }

    return (
        <Box>
            <TableContainer sx={styles.tableContainer}>
                <Table>
                    <TableHead sx={styles.tableHeader(theme)}>
                        <TableRow>
                            <TableCell>CHRONO DATE</TableCell>
                            <TableCell>MISSION PLAN</TableCell>
                            <TableCell>PAYLOAD</TableCell>
                            <TableCell>STATUS</TableCell>
                            <TableCell align="right">INTEL</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {payments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={styles.emptyRow}>
                                    <Typography variant="body2" sx={styles.emptyText}>
                                        NO TRANSACTION DATA ARCHIVED.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            payments.map((payment) => (
                                <TableRow
                                    key={payment._id}
                                    sx={styles.tableRow(theme)}
                                    onClick={() => handleViewDetails(payment)}
                                >
                                    <TableCell sx={styles.dateCell}>
                                        {format(new Date(payment.createdAt), 'MMM dd, yyyy').toUpperCase()}
                                    </TableCell>
                                    <TableCell>
                                        {payment.planType.replace('_', ' ').toUpperCase()}
                                    </TableCell>
                                    <TableCell sx={styles.amountCell}>
                                        ₹{payment.amount}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={payment.status.toUpperCase()}
                                            size="small"
                                            sx={styles.statusChip(theme, payment.status)}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton size="small" sx={styles.actionIcon}>
                                            <VisibilityIcon sx={styles.visibilityIcon} />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {selectedPayment && (
                <PaymentDetailModal
                    open={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    payment={selectedPayment}
                />
            )}
        </Box>
    );
}

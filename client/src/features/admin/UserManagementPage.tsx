import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, CircularProgress,
    TextField, InputAdornment, IconButton, TablePagination, Button,
    useTheme, alpha, Avatar
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import type { User } from '../../types';

import type { Theme } from '@mui/material/styles';

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
            ? `linear-gradient(rgba(6, 9, 15, 0.8), rgba(6, 9, 15, 1)), url(https://images.unsplash.com/photo-1574680077505-ff096163f9ef?q=80&w=2070&auto=format&fit=crop)`
            : `linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.98)), url(https://images.unsplash.com/photo-1574680077505-ff096163f9ef?q=80&w=2070&auto=format&fit=crop)`,
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
            content: '"COMMAND"',
            position: 'absolute',
            top: '20%',
            left: '5%',
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
        maxWidth: 1400,
        mx: 'auto',
        width: '100%',
        flexGrow: 1,
        position: 'relative',
        zIndex: 1
    },
    consoleCard: (theme: Theme) => ({
        borderRadius: 2,
        background: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.4 : 0.8),
        backdropFilter: 'blur(24px) saturate(180%)',
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.palette.mode === 'dark'
            ? `inset 0 0 20px -10px ${alpha('#fff', 0.05)}, 0 20px 50px -20px rgba(0,0,0,0.5)`
            : `0 20px 50px -20px ${alpha(theme.palette.common.black, 0.1)}`,
        overflow: 'hidden'
    }),
    toolbar: (theme: Theme) => ({
        p: 3,
        background: alpha(theme.palette.background.paper, 0.2),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 4,
        borderBottom: `1px solid ${theme.palette.divider}`
    }),
    searchInput: (theme: Theme) => ({
        width: { xs: '100%', sm: 350 },
        '& .MuiOutlinedInput-root': {
            borderRadius: 0,
            bgcolor: alpha(theme.palette.text.primary, 0.03),
            height: 48,
            '& fieldset': { borderColor: theme.palette.divider },
            '&:hover fieldset': { borderColor: 'primary.main' },
        }
    }),
    tableHead: (theme: Theme) => ({
        bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.05 : 0.08),
        '& .MuiTableCell-root': {
            color: 'primary.main',
            fontWeight: 950,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            fontSize: '0.65rem',
            py: 2.5,
            borderBottom: `1px solid ${theme.palette.divider}`
        }
    }),
    tableRow: (theme: Theme) => ({
        transition: 'all 0.3s ease',
        '&:hover': {
            bgcolor: alpha(theme.palette.primary.main, 0.02),
        },
        '& .MuiTableCell-root': {
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
            color: 'text.secondary',
            fontWeight: 600,
            fontSize: '0.85rem',
            py: 2.5
        }
    }),
    avatar: (theme: Theme) => ({
        bgcolor: theme.palette.primary.main,
        fontWeight: 950,
        boxShadow: `0 4px 15px -5px ${theme.palette.primary.main}`,
        fontSize: '0.875rem'
    }),
    statusChip: {
        fontWeight: 950,
        letterSpacing: '1px',
        fontSize: '0.6rem',
        height: 24,
        borderRadius: 0,
    },
    actionButton: {
        borderRadius: 0,
        fontWeight: 900,
        letterSpacing: '1px',
        fontSize: '0.65rem',
        textTransform: 'uppercase'
    },
    pagination: (theme: Theme) => ({
        borderTop: `1px solid ${theme.palette.divider}`,
        background: alpha(theme.palette.background.paper, 0.2),
        '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
            fontWeight: 700,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: 'text.secondary',
            opacity: 0.6
        }
    })
};

export default function UserManagementPage() {
    const theme = useTheme();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();
    const { impersonate } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; user: User | null }>({
        open: false,
        user: null
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleImpersonate = async (userId: string) => {
        try {
            await impersonate(userId);
            showToast('IMPERSONATION PROTOCOL STARTED', 'success');
        } catch (err: unknown) {
            if (userId === confirmDialog.user?._id) { // Assuming 'user' refers to confirmDialog.user
                showToast('You cannot resent welcome email to yourself.', 'error'); // Changed toast.showToast to showToast
            } else {
                showToast((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to resend welcome email', 'error'); // Changed toast.showToast to showToast
            }
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/users');
            const nonAdminUsers = response.data.data.users.filter((user: User) =>
                user.role !== 'STUDIO_ADMIN'
            );
            setUsers(nonAdminUsers);
        } catch (err: unknown) {
            showToast((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to start impersonation', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatusClick = (user: User) => {
        setConfirmDialog({ open: true, user });
    };

    const handleConfirmToggle = async () => {
        if (!confirmDialog.user) return;
        const user = confirmDialog.user;
        setConfirmDialog({ open: false, user: null });

        try {
            const response = await api.patch(`/users/${user._id}/toggle-status`);
            const updatedUser = response.data.data.user;
            setUsers(users.map(u => u._id === updatedUser._id ? updatedUser : u));
            showToast(`STATUS PROTOCOL UPDATED`, 'success');
        } catch (err: unknown) {
            showToast((err as Error).message || `Protocol failure`, 'error');
        }
    };

    const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const filteredUsers = users.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <CircularProgress color="primary" thickness={5} />
        </Box>
    );

    return (
        <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible" sx={styles.pageContainer}>
            {/* Cinematic Hero */}
            <Box sx={styles.headerHero(theme)}>
                <Box>
                    <Typography sx={styles.sectionLabel}>ADMINISTRATIVE CONSOLE</Typography>
                    <Typography variant="h1" sx={styles.headerTitle(theme)}>
                        USER <Box component="span">CONTROL</Box>
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 600, fontWeight: 400, lineHeight: 1.6, opacity: 0.8 }}>
                        Monitor and manage all personnel within the elite ecosystem. Review active clearances, manage status protocols, and maintain operational security.
                    </Typography>
                </Box>
            </Box>

            <Box sx={styles.contentWrapper}>
                <motion.div variants={itemVariants}>
                    <Paper sx={styles.consoleCard(theme)}>
                        {/* Toolbar */}
                        <Box sx={styles.toolbar(theme)}>
                            <Typography sx={{ fontWeight: 950, letterSpacing: '3px', textTransform: 'uppercase', fontSize: '1rem', color: 'text.primary' }}>
                                PERSONNEL DATABASE
                            </Typography>
                            <Box display="flex" gap={2} alignItems="center" width={{ xs: '100%', sm: 'auto' }}>
                                <TextField
                                    placeholder="SEARCH AGENTS..."
                                    variant="outlined"
                                    size="small"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    sx={styles.searchInput(theme)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon sx={{ color: 'primary.main' }} />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                                <IconButton sx={{ bgcolor: alpha(theme.palette.text.primary, 0.03), border: `1px solid ${theme.palette.divider}`, borderRadius: 0 }}>
                                    <FilterListIcon sx={{ color: 'text.secondary' }} />
                                </IconButton>
                            </Box>
                        </Box>

                        <TableContainer>
                            <Table sx={{ minWidth: 800 }}>
                                <TableHead sx={styles.tableHead(theme)}>
                                    <TableRow>
                                        <TableCell>AGENT IDENTITY</TableCell>
                                        <TableCell>COMM CHANNEL</TableCell>
                                        <TableCell>CLEARANCE</TableCell>
                                        <TableCell>OPERATIONAL STATUS</TableCell>
                                        <TableCell>ENLISTMENT DATE</TableCell>
                                        <TableCell align="right">PROTOCOLS</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <AnimatePresence mode="popLayout">
                                        {filteredUsers
                                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                            .map((user) => (
                                                <TableRow
                                                    key={user._id}
                                                    component={motion.tr}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    sx={styles.tableRow(theme)}
                                                >
                                                    <TableCell>
                                                        <Box display="flex" alignItems="center" gap={2}>
                                                            <Avatar sx={styles.avatar(theme)}
                                                                src={user?.profileImage || ""}
                                                            >
                                                                {user.fullName.charAt(0).toUpperCase()}
                                                            </Avatar>
                                                            <Typography variant="body1" fontWeight={700} sx={{ color: 'text.primary', letterSpacing: '0.5px' }}>
                                                                {user.fullName.toUpperCase()}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>{user.email.toUpperCase()}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={user.role.replace('_', ' ')}
                                                            size="small"
                                                            sx={{
                                                                ...styles.statusChip,
                                                                bgcolor: alpha(user.role === 'INSTRUCTOR' ? theme.palette.primary.main : theme.palette.text.secondary, 0.1),
                                                                color: user.role === 'INSTRUCTOR' ? 'primary.main' : 'text.secondary',
                                                                border: `1px solid ${alpha(user.role === 'INSTRUCTOR' ? theme.palette.primary.main : theme.palette.text.secondary, 0.2)}`
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={user.isActive ? 'VERIFIED ACTIVE' : 'LOCKED'}
                                                            size="small"
                                                            sx={{
                                                                ...styles.statusChip,
                                                                color: user.isActive ? 'success.main' : 'error.main',
                                                                bgcolor: alpha(user.isActive ? theme.palette.success.main : theme.palette.error.main, 0.05),
                                                                border: `1px solid ${alpha(user.isActive ? theme.palette.success.main : theme.palette.error.main, 0.2)}`
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ fontWeight: 800 }}>
                                                        {new Date(user.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' }).toUpperCase()}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Box display="flex" gap={1} justifyContent="flex-end">
                                                            {user.role === 'MEMBER' && (
                                                                <Button
                                                                    variant="outlined"
                                                                    color="primary"
                                                                    size="small"
                                                                    onClick={() => handleImpersonate(user._id)}
                                                                    sx={styles.actionButton}
                                                                >
                                                                    IMPERSONATE
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant={user.isActive ? "outlined" : "contained"}
                                                                color={user.isActive ? "error" : "success"}
                                                                size="small"
                                                                onClick={() => handleToggleStatusClick(user)}
                                                                startIcon={user.isActive ? <BlockIcon /> : <CheckCircleIcon />}
                                                                sx={styles.actionButton}
                                                            >
                                                                {user.isActive ? "DEACTIVATE" : "RECOVER"}
                                                            </Button>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </AnimatePresence>
                                    {filteredUsers.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                                                <Typography variant="body1" sx={{ color: alpha(theme.palette.text.primary, 0.2), fontWeight: 900, letterSpacing: '3px', textTransform: 'uppercase' }}>
                                                    NO PERSONNEL MATCHES SEARCH STRING
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={filteredUsers.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            sx={styles.pagination(theme)}
                        />
                    </Paper>
                </motion.div>
            </Box>

            <ConfirmationDialog
                open={confirmDialog.open}
                title={confirmDialog.user?.isActive ? "SECURITY LOCKOUT" : "PROTOCOL CLEARANCE"}
                message={`ARE YOU SURE YOU WANT TO ${confirmDialog.user?.isActive ? 'DEACTIVATE' : 'ACTIVATE'} AGENT ${confirmDialog.user?.fullName.toUpperCase()}? THIS ACTION IS LOGGED.`}
                onConfirm={handleConfirmToggle}
                onCancel={() => setConfirmDialog({ open: false, user: null })}
                confirmText={confirmDialog.user?.isActive ? "PROCEED TO LOCKOUT" : "RESTORE CLEARANCE"}
                severity={confirmDialog.user?.isActive ? "error" : "warning"}
            />
        </Box>
    );
}

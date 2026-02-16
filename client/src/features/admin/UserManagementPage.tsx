import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, CircularProgress,
    TextField, InputAdornment, IconButton, Tooltip, TablePagination, Button,
    useTheme, alpha, Avatar
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import type { User } from '../../types';
import type { Theme } from '@mui/material';

// Local interface removed in favor of global User from types

const styles = {
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh'
    },
    loadingSpinner: (theme: Theme) => ({ color: theme.palette.primary.main }),
    pageContainer: {
        maxWidth: 1200,
        mx: 'auto',
        px: { xs: 2, md: 4 },
        py: 4
    },
    headerTitle: (theme: Theme) => ({
        background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        mb: 1
    }),
    paper: (theme: Theme) => ({
        borderRadius: 4,
        boxShadow: theme.shadows[2],
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`
    }),
    toolbar: (theme: Theme) => ({
        p: 3,
        bgcolor: alpha(theme.palette.background.default, 0.4),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2
    }),
    searchInput: (theme: Theme) => ({
        borderRadius: 3,
        bgcolor: theme.palette.background.paper,
        width: { xs: '100%', sm: 300 }
    }),
    tableHead: (theme: Theme) => ({ bgcolor: alpha(theme.palette.primary.main, 0.05) }),
    tableCellHead: { fontWeight: 700, py: 2 },
    tableRow: { '&:last-child td, &:last-child th': { border: 0 } },
    avatar: (theme: Theme) => ({ bgcolor: theme.palette.primary.light, fontWeight: 700 }),
    roleChip: { fontWeight: 600, borderRadius: 1.5 },
    statusChip: { fontWeight: 600, borderRadius: 1.5 },
    actionButton: { borderRadius: 2, textTransform: 'none', fontWeight: 600 },
    noUsersCell: { py: 6 }
};

export default function UserManagementPage() {
    const theme = useTheme();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/users');
            // Filter out STUDIO_ADMIN only, show both active and inactive
            const nonAdminUsers = response.data.data.users.filter((user: User) =>
                user.role !== 'STUDIO_ADMIN'
            );
            setUsers(nonAdminUsers);
        } catch (err: unknown) { // axios error catch is usually any or unknown
            showToast((err as Error).message || 'Failed to fetch users', 'error');
        } finally {
            setLoading(false);
        }
    };

    const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; user: User | null }>({
        open: false,
        user: null
    });

    const handleToggleStatusClick = (user: User) => {
        setConfirmDialog({ open: true, user });
    };

    const handleConfirmToggle = async () => {
        if (!confirmDialog.user) return;
        const user = confirmDialog.user;
        const action = user.isActive ? 'deactivate' : 'activate';

        setConfirmDialog({ open: false, user: null });

        try {
            const response = await api.patch(`/users/${user._id}/toggle-status`);
            const updatedUser = response.data.data.user;
            setUsers(users.map(u => u._id === updatedUser._id ? updatedUser : u));
            showToast(`User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`, 'success');
        } catch (err: unknown) {
            showToast((err as Error).message || `Failed to ${action} user`, 'error');
        }
    };

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const filteredUsers = users.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredUsers.length) : 0;

    if (loading) return (
        <Box sx={styles.loadingContainer}>
            <CircularProgress sx={styles.loadingSpinner(theme)} />
        </Box>
    );

    return (
        <Box sx={styles.pageContainer}>
            <Box mb={5}>
                <Typography variant="h3" fontWeight={800} sx={styles.headerTitle(theme)}>
                    User Management
                </Typography>
                <Typography variant="h6" color="text.secondary" fontWeight={400}>
                    Overview of all Instructors and Members.
                </Typography>
            </Box>


            <Paper sx={styles.paper(theme)}>
                {/* Toolbar */}
                <Box sx={styles.toolbar(theme)}>
                    <TextField
                        placeholder="Search users..."
                        variant="outlined"
                        size="small"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                            sx: styles.searchInput(theme)
                        }}
                    />
                    <Tooltip title="Filter list">
                        <IconButton>
                            <FilterListIcon />
                        </IconButton>
                    </Tooltip>
                </Box>

                <TableContainer>
                    <Table sx={{ minWidth: 650 }} aria-label="user table">
                        <TableHead sx={styles.tableHead(theme)}>
                            <TableRow>
                                <TableCell sx={styles.tableCellHead}>User</TableCell>
                                <TableCell sx={styles.tableCellHead}>Email</TableCell>
                                <TableCell sx={styles.tableCellHead}>Role</TableCell>
                                <TableCell sx={styles.tableCellHead}>Status</TableCell>
                                <TableCell sx={styles.tableCellHead}>Joined Date</TableCell>
                                <TableCell align="right" sx={styles.tableCellHead}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredUsers
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((user) => (
                                    <TableRow
                                        key={user._id}
                                        hover
                                        component={motion.tr}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.2 }}
                                        sx={styles.tableRow}
                                    >
                                        <TableCell component="th" scope="row">
                                            <Box display="flex" alignItems="center" gap={2}>
                                                <Avatar sx={styles.avatar(theme)}>
                                                    {user.fullName.charAt(0)}
                                                </Avatar>
                                                <Typography variant="body1" fontWeight={600}>
                                                    {user.fullName}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={user.role.replace('_', ' ')}
                                                size="small"
                                                color={
                                                    user.role === 'INSTRUCTOR' ? 'primary' : 'default'
                                                }
                                                variant="filled"
                                                sx={styles.roleChip}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={user.isActive ? 'Active' : 'Inactive'}
                                                size="small"
                                                color={user.isActive ? 'success' : 'error'}
                                                variant="outlined"
                                                sx={styles.statusChip}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {new Date(user.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Button
                                                variant={user.isActive ? "outlined" : "contained"}
                                                color={user.isActive ? "error" : "success"}
                                                size="small"
                                                onClick={() => handleToggleStatusClick(user)}
                                                startIcon={user.isActive ? <BlockIcon /> : <CheckCircleIcon />}
                                                sx={styles.actionButton}
                                            >
                                                {user.isActive ? "Deactivate" : "Activate"}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            {emptyRows > 0 && (
                                <TableRow style={{ height: 73 * emptyRows }}>
                                    <TableCell colSpan={6} />
                                </TableRow>
                            )}
                            {filteredUsers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={styles.noUsersCell}>
                                        <Typography variant="body1" color="text.secondary">
                                            No users found matching "{searchTerm}"
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
                />
            </Paper>

            <ConfirmationDialog
                open={confirmDialog.open}
                title={confirmDialog.user?.isActive ? "Deactivate User" : "Activate User"}
                message={`Are you sure you want to ${confirmDialog.user?.isActive ? 'deactivate' : 'activate'} ${confirmDialog.user?.fullName}?`}
                onConfirm={handleConfirmToggle}
                onCancel={() => setConfirmDialog({ open: false, user: null })}
                confirmText={confirmDialog.user?.isActive ? "Deactivate" : "Activate"}
                severity={confirmDialog.user?.isActive ? "error" : "warning"}
            />
        </Box>
    );
}

import { Box, Typography, Paper, Avatar, Chip, Divider, Button } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useTheme, alpha } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import BadgeIcon from '@mui/icons-material/Badge';

export default function ProfilePage() {
    const { user } = useAuth();
    const theme = useTheme();

    if (!user) return null;

    return (
        <Box maxWidth={1000} mx="auto" px={{ xs: 2, md: 4 }} py={4}>
            {/* Header */}
            <Box mb={5}>
                <Typography variant="h3" fontWeight={800} sx={{
                    background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1
                }}>
                    My Profile
                </Typography>
                <Typography variant="h6" color="text.secondary" fontWeight={400}>
                    Manage your personal information and account settings.
                </Typography>
            </Box>

            <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={4}>
                {/* Left Column: User Card */}
                <Box flex={{ xs: '1 1 100%', md: '0 0 350px' }}>
                    <Paper sx={{
                        p: 4,
                        borderRadius: 4,
                        textAlign: 'center',
                        boxShadow: theme.shadows[3],
                        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.default, 0.9)} 100%)`,
                        backdropFilter: 'blur(20px)',
                        border: `1px solid ${theme.palette.divider}`
                    }}>
                        <Avatar
                            sx={{
                                width: 120,
                                height: 120,
                                mx: 'auto',
                                mb: 2,
                                bgcolor: theme.palette.primary.main,
                                fontSize: '3rem',
                                fontWeight: 700,
                                boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`
                            }}
                        >
                            {user.fullName.charAt(0)}
                        </Avatar>
                        <Typography variant="h5" fontWeight={700} gutterBottom>
                            {user.fullName}
                        </Typography>
                        <Chip
                            label={user.role.replace('_', ' ')}
                            color="secondary"
                            size="small"
                            sx={{ fontWeight: 600, mb: 3 }}
                        />

                        <Divider sx={{ my: 3 }} />

                        <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={1} color="text.secondary">
                            <EmailIcon fontSize="small" />
                            <Typography variant="body2">{user.email}</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" justifyContent="center" gap={1} color="text.secondary">
                            <CalendarTodayIcon fontSize="small" />
                            <Typography variant="body2">
                                Member since {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                            </Typography>
                        </Box>

                        <Button
                            variant="outlined"
                            startIcon={<EditIcon />}
                            fullWidth
                            sx={{ mt: 4, borderRadius: 2 }}
                        // Planned: onClick={() => navigate('/settings')}
                        >
                            Edit Profile
                        </Button>
                    </Paper>
                </Box>

                {/* Right Column: Details & Stats */}
                <Box flex={1}>
                    <Paper sx={{
                        p: 4,
                        borderRadius: 4,
                        boxShadow: theme.shadows[2],
                        height: '100%',
                        border: `1px solid ${theme.palette.divider}`
                    }}>
                        <Box display="flex" alignItems="center" gap={2} mb={3}>
                            <BadgeIcon color="primary" />
                            <Typography variant="h6" fontWeight={700}>
                                Account Details
                            </Typography>
                        </Box>

                        <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={3}>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Full Name
                                </Typography>
                                <Typography variant="body1" fontWeight={500}>
                                    {user.fullName}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Email Address
                                </Typography>
                                <Typography variant="body1" fontWeight={500}>
                                    {user.email}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Role
                                </Typography>
                                <Typography variant="body1" fontWeight={500}>
                                    {user.role}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Status
                                </Typography>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <VerifiedUserIcon color="success" fontSize="small" />
                                    <Typography variant="body1" fontWeight={500} color="success.main">
                                        Active
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        <Box mt={6}>
                            <Typography variant="body2" color="text.secondary">
                                * To update your personal information or change your password, please visit the Settings page.
                            </Typography>
                        </Box>
                    </Paper>
                </Box>
            </Box>
        </Box>
    );
}

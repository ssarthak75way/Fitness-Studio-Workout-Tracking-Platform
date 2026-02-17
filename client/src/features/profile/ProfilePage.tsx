import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, Avatar, Chip, Divider, Button, TextField } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services/auth.service';
import { useTheme, alpha } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import BadgeIcon from '@mui/icons-material/Badge';

const styles = {
    pageContainer: {
        maxWidth: 1000,
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
    userCard: (theme: Theme) => ({
        p: 4,
        borderRadius: 4,
        textAlign: 'center',
        boxShadow: theme.shadows[3],
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.default, 0.9)} 100%)`,
        backdropFilter: 'blur(20px)',
        border: `1px solid ${theme.palette.divider}`
    }),
    avatar: (theme: Theme) => ({
        width: 120,
        height: 120,
        mx: 'auto',
        mb: 2,
        bgcolor: theme.palette.primary.main,
        fontSize: '3rem',
        fontWeight: 700,
        boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`
    }),
    roleChip: { fontWeight: 600, mb: 3 },
    divider: { my: 3 },
    infoBox: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1, color: 'text.secondary' },
    infoBoxAlt: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, color: 'text.secondary' },
    editButton: { mt: 4, borderRadius: 2 },
    detailsCard: (theme: Theme) => ({
        p: 4,
        borderRadius: 4,
        boxShadow: theme.shadows[2],
        height: '100%',
        border: `1px solid ${theme.palette.divider}`
    }),
    detailsHeader: { display: 'flex', alignItems: 'center', gap: 2, mb: 3 },
    detailsGrid: { display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 },
    statusBox: { display: 'flex', alignItems: 'center', gap: 1 },
    footerNote: { mt: 6 }
};

export default function ProfilePage() {
    const { user } = useAuth(); // login is restart to update user context
    const theme = useTheme();
    const { showToast } = useToast();

    const [image, setImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        bio: '',
        specialties: '',
        certifications: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                bio: user.bio || '',
                specialties: user.specialties?.join(', ') || '',
                certifications: user.certifications?.join(', ') || ''
            });
        }
    }, [user]);

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancelClick = () => {
        setIsEditing(false);
        // Reset form
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                bio: user.bio || '',
                specialties: user.specialties?.join(', ') || '',
                certifications: user.certifications?.join(', ') || ''
            });
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSaveClick = async () => {
        setLoading(true);
        try {
            const updateData: any = { fullName: formData.fullName };

            if (user?.role === 'INSTRUCTOR') {
                updateData.bio = formData.bio;
                updateData.specialties = formData.specialties.split(',').map(s => s.trim()).filter(Boolean);
                updateData.certifications = formData.certifications.split(',').map(s => s.trim()).filter(Boolean);
            }

            await authService.updateProfile(updateData);


            showToast('Profile updated successfully', 'success');
            setIsEditing(false);
            window.location.reload(); // Simple reload to refresh context for now
        } catch (error) {
            console.error('Failed to update profile:', error);
            showToast('Failed to update profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const savedImage = sessionStorage.getItem("profileImage");
        if (savedImage) {
            setImage(savedImage);
        }
    }, []);
    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();

            reader.onloadend = () => {
                const base64String = reader.result as string;
                setImage(base64String);

                // Save to sessionStorage
                sessionStorage.setItem("profileImage", base64String);
            };

            reader.readAsDataURL(file);
        }
    };

    if (!user) return null;

    return (
        <Box sx={styles.pageContainer}>
            {/* Header */}
            <Box mb={5}>
                <Typography variant="h3" fontWeight={800} sx={styles.headerTitle(theme)}>
                    My Profile
                </Typography>
                <Typography variant="h6" color="text.secondary" fontWeight={400}>
                    Manage your personal information and account settings.
                </Typography>
            </Box>

            <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={4}>
                {/* Left Column: User Card */}
                <Box flex={{ xs: '1 1 100%', md: '0 0 350px' }}>
                    <Paper sx={styles.userCard(theme)}>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept="image/*"
                            onChange={handleImageChange}
                        />

                        <Box position="relative" display="inline-block">
                            <Avatar
                                src={image || ""}
                                sx={{
                                    ...styles.avatar(theme),
                                    cursor: isEditing ? 'pointer' : 'default',
                                    opacity: isEditing ? 0.8 : 1,
                                    transition: '0.2s',
                                    '&:hover': isEditing ? { opacity: 0.6 } : {}
                                }}
                                onClick={() => isEditing && fileInputRef.current?.click()}
                            >
                                {!image && user?.fullName?.charAt(0)}
                            </Avatar>
                            {isEditing && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        bottom: 20,
                                        right: 0,
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        borderRadius: '50%',
                                        p: 0.5,
                                        pointerEvents: 'none'
                                    }}
                                >
                                    <EditIcon fontSize="small" />
                                </Box>
                            )}
                        </Box>

                        {isEditing ? (
                            <Box mb={2}>
                                <TextField
                                    fullWidth
                                    label="Full Name"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    variant="outlined"
                                    size="small"
                                />
                            </Box>
                        ) : (
                            <Typography variant="h5" fontWeight={700} gutterBottom>
                                {user.fullName}
                            </Typography>
                        )}

                        <Chip
                            label={user.role.replace('_', ' ')}
                            color="secondary"
                            size="small"
                            sx={styles.roleChip}
                        />

                        <Divider sx={styles.divider} />

                        <Box sx={styles.infoBox}>
                            <EmailIcon fontSize="small" />
                            <Typography variant="body2">{user.email}</Typography>
                        </Box>
                        <Box sx={styles.infoBoxAlt}>
                            <CalendarTodayIcon fontSize="small" />
                            <Typography variant="body2">
                                Member since {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                            </Typography>
                        </Box>

                        {!isEditing ? (
                            <Button
                                variant="outlined"
                                startIcon={<EditIcon />}
                                fullWidth
                                sx={styles.editButton}
                                onClick={handleEditClick}
                            >
                                Edit Profile
                            </Button>
                        ) : (
                            <Box display="flex" gap={2} mt={4}>
                                <Button
                                    variant="outlined"
                                    color="inherit"
                                    fullWidth
                                    onClick={handleCancelClick}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    onClick={handleSaveClick}
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : 'Save'}
                                </Button>
                            </Box>
                        )}
                    </Paper>
                </Box>

                {/* Right Column: Details & Stats */}
                <Box flex={1}>
                    <Paper sx={styles.detailsCard(theme)}>
                        <Box sx={styles.detailsHeader}>
                            <BadgeIcon color="primary" />
                            <Typography variant="h6" fontWeight={700}>
                                Account Details
                            </Typography>
                        </Box>

                        <Box sx={styles.detailsGrid}>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Full Name
                                </Typography>
                                <Typography variant="body1" fontWeight={500}>
                                    {isEditing ? formData.fullName : user.fullName}
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
                                <Box sx={styles.statusBox}>
                                    <VerifiedUserIcon color="success" fontSize="small" />
                                    <Typography variant="body1" fontWeight={500} color="success.main">
                                        Active
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Instructor Fields (Example) */}
                            {user.role === 'INSTRUCTOR' && (
                                <>
                                    <Box sx={{ gridColumn: '1 / -1' }}>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                            Bio
                                        </Typography>
                                        {isEditing ? (
                                            <TextField
                                                fullWidth
                                                multiline
                                                rows={3}
                                                name="bio"
                                                value={formData.bio}
                                                onChange={handleInputChange}
                                                placeholder="Tell us about yourself..."
                                            />
                                        ) : (
                                            <Typography variant="body1" fontWeight={500}>
                                                {user.bio || 'No bio provided.'}
                                            </Typography>
                                        )}
                                    </Box>
                                </>
                            )}
                        </Box>

                        <Box sx={styles.footerNote}>
                            <Typography variant="body2" color="text.secondary">
                                * To update your email or change your password, please visit the Settings page.
                            </Typography>
                        </Box>
                    </Paper>
                </Box>
            </Box>
        </Box>
    );
}

import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, Avatar, Chip, Divider, Button, TextField, useTheme, alpha, Stack, Grid } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services/auth.service';
import type { Theme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import PaymentHistory from './PaymentHistory';
import { motion, type Variants } from 'framer-motion';

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
            ? `linear-gradient(rgba(6, 9, 15, 0.75), rgba(6, 9, 15, 1)), url(https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop)`
            : `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.95)), url(https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop)`,
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
            content: '"IDENTITY"',
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
    heroSubtitle: {
        color: 'text.secondary',
        maxWidth: 600,
        fontWeight: 400,
        lineHeight: 1.6
    },
    sectionLabel: () => ({
        color: 'primary.main',
        fontWeight: 900,
        letterSpacing: '5px',
        mb: 4,
        display: 'block',
        textTransform: 'uppercase',
        fontSize: '0.7rem',
        opacity: 0.8
    }),
    contentWrapper: {
        px: { xs: 3, md: 6 },
        py: { xs: 4, md: 8 },
        flexGrow: 1,
        position: 'relative',
        zIndex: 1
    },
    profileSidebar: {
        flex: { xs: '1 1 100%', lg: '0 0 380px' }
    },
    userCard: (theme: Theme) => ({
        p: 4,
        borderRadius: 2,
        textAlign: 'center',
        border: '1px solid',
        borderColor: theme.palette.divider,
        bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.4 : 0.8),
        backdropFilter: 'blur(24px) saturate(160%)',
        boxShadow: theme.palette.mode === 'dark'
            ? `inset 0 0 20px -10px ${alpha('#fff', 0.05)}, 0 10px 30px -15px ${alpha('#000', 0.5)}`
            : `0 10px 30px -15px ${alpha(theme.palette.common.black, 0.1)}`,
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        '&:hover': {
            borderColor: alpha(theme.palette.primary.main, 0.4),
            boxShadow: `inset 0 0 30px -10px ${alpha(theme.palette.primary.main, 0.1)}, 0 20px 50px -20px ${alpha(theme.palette.primary.main, 0.4)}`,
        }
    }),
    avatarWrapper: {
        position: 'relative',
        display: 'inline-block',
        mb: 2
    },
    avatar: (theme: Theme) => ({
        width: 140,
        height: 140,
        mx: 'auto',
        mb: 3,
        bgcolor: theme.palette.primary.main,
        fontSize: '4rem',
        fontWeight: 950,
        boxShadow: `0 20px 40px -10px ${alpha(theme.palette.primary.main, 0.5)}`,
        border: `4px solid ${alpha(theme.palette.text.primary, 0.1)}`,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: `0 30px 60px -10px ${alpha(theme.palette.primary.main, 0.6)}`
        }
    }),
    cameraIconWrapper: (theme: Theme) => ({
        position: 'absolute',
        bottom: 10,
        right: 10,
        bgcolor: 'primary.main',
        color: theme.palette.primary.contrastText,
        borderRadius: '50%',
        p: 1.5,
        boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.5)}`,
        cursor: 'pointer',
        zIndex: 2,
        transition: 'transform 0.2s',
        '&:hover': { transform: 'scale(1.1)' }
    }),
    nameDisplay: {
        letterSpacing: '-1.5px',
        color: 'text.primary',
        mb: 1
    },
    roleChip: {
        fontWeight: 900,
        mb: 3,
        borderRadius: 0,
        letterSpacing: '2px',
        fontSize: '0.7rem',
        height: 28
    },
    divider: (theme: Theme) => ({
        my: 4,
        borderColor: theme.palette.divider
    }),
    infoBox: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
        mb: 1.5,
        color: 'text.secondary',
        fontWeight: 600,
        fontSize: '0.875rem'
    },
    icon: {
        fontSize: '1.2rem',
        color: 'primary.main'
    },
    infoText: {
        letterSpacing: '1px'
    },
    editButton: (theme: Theme) => ({
        borderRadius: 0,
        fontWeight: 900,
        letterSpacing: '2px',
        py: 1.5,
        mt: 3,
        transition: 'all 0.3s ease',
        borderColor: theme.palette.divider,
        color: 'text.primary'
    }),
    cancelButton: (theme: Theme) => ({
        borderRadius: 0,
        fontWeight: 900,
        letterSpacing: '2px',
        py: 1.5,
        mt: 3,
        transition: 'all 0.3s ease',
        color: 'text.secondary',
        borderColor: theme.palette.divider
    }),
    saveButton: {
        borderRadius: 0,
        fontWeight: 900,
        letterSpacing: '2px',
        py: 1.5,
        mt: 3,
        transition: 'all 0.3s ease',
        bgcolor: 'primary.main',
        color: 'primary.contrastText'
    },
    inputField: (theme: Theme) => ({
        '& .MuiOutlinedInput-root': {
            borderRadius: 0,
            bgcolor: alpha(theme.palette.text.primary, 0.03),
            '& fieldset': { borderColor: theme.palette.divider },
            '&:hover fieldset': { borderColor: 'primary.main' },
        },
        '& .MuiInputLabel-root': { fontWeight: 700, letterSpacing: '1px' }
    }),
    nameInput: (theme: Theme) => ({
        '& .MuiOutlinedInput-root': {
            borderRadius: 0,
            bgcolor: alpha(theme.palette.text.primary, 0.03),
            '& fieldset': { borderColor: theme.palette.divider },
            '&:hover fieldset': { borderColor: 'primary.main' },
        },
        '& .MuiInputLabel-root': { fontWeight: 700, letterSpacing: '1px' },
        mb: 3
    }),
    bioInput: (theme: Theme) => ({
        '& .MuiOutlinedInput-root': {
            borderRadius: 0,
            bgcolor: alpha(theme.palette.text.primary, 0.03),
            '& fieldset': { borderColor: theme.palette.divider },
            '&:hover fieldset': { borderColor: 'primary.main' },
        },
        '& .MuiInputLabel-root': { fontWeight: 700, letterSpacing: '1px' },
        mt: 1
    }),
    detailsCard: (theme: Theme) => ({
        p: 4,
        borderRadius: 2,
        border: '1px solid',
        borderColor: theme.palette.divider,
        bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.3 : 0.7),
        backdropFilter: 'blur(20px)',
        boxShadow: theme.palette.mode === 'dark'
            ? `0 20px 50px -20px ${alpha('#000', 0.4)}`
            : `0 20px 50px -20px ${alpha(theme.palette.common.black, 0.08)}`
    }),
    detailsSection: {
        flex: 1
    },
    detailLabel: {
        color: 'text.secondary',
        fontWeight: 900,
        letterSpacing: 2
    },
    detailValue: {
        fontWeight: 900,
        color: 'text.primary'
    },
    detailValueHighlight: {
        fontWeight: 900,
        color: 'primary.main'
    },
    verifiedIcon: {
        color: 'success.main',
        fontSize: '1.2rem'
    },
    bioText: {
        color: 'text.secondary',
        fontWeight: 500,
        mt: 1,
        opacity: 0.8
    },
    sectionDivider: (theme: Theme) => ({
        mb: 6,
        borderColor: theme.palette.divider
    }),
    securityNoticeBox: (theme: Theme) => ({
        mt: 6,
        p: 3,
        borderLeft: '4px solid',
        borderColor: 'primary.main',
        bgcolor: alpha(theme.palette.text.primary, 0.02)
    }),
    securityNoticeText: {
        color: 'text.secondary',
        fontWeight: 700,
        letterSpacing: '1px',
        opacity: 0.5
    }
};

export default function ProfilePage() {
    const { user, updateUser } = useAuth();
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

    const handleEditClick = () => setIsEditing(true);
    const handleCancelClick = () => {
        setIsEditing(false);
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
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSaveClick = async () => {
        setLoading(true);
        try {
            const updateData: Record<string, string | string[]> = { fullName: formData.fullName };
            if (user?.role === 'INSTRUCTOR') {
                updateData.bio = formData.bio;
                updateData.specialties = formData.specialties.split(',').map(s => s.trim()).filter(Boolean);
                updateData.certifications = formData.certifications.split(',').map(s => s.trim()).filter(Boolean);
            }
            const response = await authService.updateProfile(updateData);

            if (response.data?.user) {
                updateUser(response.data.user);
            }

            showToast('Profile evolved successfully', 'success');
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update profile:', error);
            showToast('Evolution failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                // Optimistic preview
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImage(reader.result as string);
                };
                reader.readAsDataURL(file);

                const response = await authService.uploadProfileImage(file);

                // Update context immediately
                if (response.data?.user) {
                    updateUser(response.data.user);
                    setImage(null);
                }

                showToast('Identity visualized & archived', 'success');
            } catch (error) {
                console.error("Upload failed:", error);
                showToast('Visual archive failed', 'error');
                setImage(null); // Revert preview on error
            }
        }
    };

    if (!user) return null;

    return (
        <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible" sx={styles.pageContainer}>
            {/* Cinematic Hero */}
            <Box sx={styles.headerHero(theme)}>
                <Box>
                    <Typography sx={styles.sectionLabel}>ATHLETE IDENTITY</Typography>
                    <Typography variant="h1" sx={styles.headerTitle(theme)}>
                        ELITE <Box component="span">IDENTITY</Box>
                    </Typography>
                    <Typography variant="h6" sx={styles.heroSubtitle}>
                        Manage your verified performance profile. Your identity is your contract with greatness. Stay optimized, stay elite.
                    </Typography>
                </Box>
            </Box>

            <Box sx={styles.contentWrapper}>
                <Box display="flex" flexDirection={{ xs: 'column', lg: 'row' }} gap={4}>
                    {/* Profile Sidebar */}
                    <Box sx={styles.profileSidebar}>
                        <motion.div variants={itemVariants}>
                            <Paper sx={styles.userCard(theme)}>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />

                                <Box sx={styles.avatarWrapper}>
                                    <Avatar
                                        src={image || user?.profileImage || ""}
                                        sx={styles.avatar(theme)}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {!image && !user?.profileImage && user?.fullName?.charAt(0)}
                                    </Avatar>

                                    <Box
                                        sx={styles.cameraIconWrapper(theme)}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            fileInputRef.current?.click();
                                        }}
                                    >
                                        <CameraAltIcon fontSize="small" />
                                    </Box>
                                </Box>

                                {isEditing ? (
                                    <TextField
                                        fullWidth
                                        label="ATHLETE NAME"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        sx={styles.nameInput(theme)}
                                    />
                                ) : (
                                    <Typography variant="h4" fontWeight={950} sx={styles.nameDisplay}>
                                        {user.fullName.toUpperCase()}
                                    </Typography>
                                )}

                                <Chip
                                    label={user.role.replace('_', ' ')}
                                    color="primary"
                                    sx={styles.roleChip}
                                />

                                <Divider sx={styles.divider(theme)} />

                                <Stack spacing={2}>
                                    <Box sx={styles.infoBox}>
                                        <EmailIcon sx={styles.icon} />
                                        <Typography sx={styles.infoText}>{user.email.toUpperCase()}</Typography>
                                    </Box>
                                    <Box sx={styles.infoBox}>
                                        <CalendarTodayIcon sx={styles.icon} />
                                        <Typography sx={styles.infoText}>
                                            ENLISTED {new Date(user.createdAt || Date.now()).toLocaleDateString().toUpperCase()}
                                        </Typography>
                                    </Box>
                                </Stack>

                                {!isEditing ? (
                                    <Button
                                        variant="outlined"
                                        startIcon={<EditIcon />}
                                        fullWidth
                                        sx={styles.editButton(theme)}
                                        onClick={handleEditClick}
                                    >
                                        RECONFIGURE IDENTITY
                                    </Button>
                                ) : (
                                    <Stack direction="row" spacing={2} mt={3}>
                                        <Button
                                            variant="outlined"
                                            fullWidth
                                            sx={styles.cancelButton(theme)}
                                            onClick={handleCancelClick}
                                            disabled={loading}
                                        >
                                            ABORT
                                        </Button>
                                        <Button
                                            variant="contained"
                                            fullWidth
                                            sx={styles.saveButton}
                                            onClick={handleSaveClick}
                                            disabled={loading}
                                        >
                                            COMMIT
                                        </Button>
                                    </Stack>
                                )}
                            </Paper>
                        </motion.div>
                    </Box>

                    {/* Account Details & History */}
                    <Box sx={styles.detailsSection}>
                        <motion.div variants={itemVariants}>
                            <Paper sx={styles.detailsCard(theme)}>
                                <Typography sx={styles.sectionLabel} mb={3}>COMMAND DETAILS</Typography>

                                <Grid container spacing={4} mb={6}>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Typography variant="overline" sx={styles.detailLabel}>LEGAL DESIGNATION</Typography>
                                        <Typography variant="h6" sx={styles.detailValue}>
                                            {isEditing ? formData.fullName.toUpperCase() : user.fullName.toUpperCase()}
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Typography variant="overline" sx={styles.detailLabel}>COMM CHANNEL</Typography>
                                        <Typography variant="h6" sx={styles.detailValue}>{user.email.toUpperCase()}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Typography variant="overline" sx={styles.detailLabel}>AUTHORITY LEVEL</Typography>
                                        <Typography variant="h6" sx={styles.detailValueHighlight}>{user.role}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Typography variant="overline" sx={styles.detailLabel}>CLEARANCE STATUS</Typography>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <VerifiedUserIcon sx={styles.verifiedIcon} />
                                            <Typography variant="h6" fontWeight={900} color="success.main">VERIFIED ACTIVE</Typography>
                                        </Stack>
                                    </Grid>

                                    {user.role === 'INSTRUCTOR' && (
                                        <Grid size={{ xs: 12 }}>
                                            <Typography variant="overline" sx={styles.detailLabel}>MISSION OBJECTIVES (BIO)</Typography>
                                            {isEditing ? (
                                                <TextField
                                                    fullWidth
                                                    multiline
                                                    rows={4}
                                                    name="bio"
                                                    value={formData.bio}
                                                    onChange={handleInputChange}
                                                    sx={styles.bioInput(theme)}
                                                />
                                            ) : (
                                                <Typography variant="body1" sx={styles.bioText}>
                                                    {user.bio || 'NO MISSION PROFILE LOGGED.'}
                                                </Typography>
                                            )}
                                        </Grid>
                                    )}
                                </Grid>

                                <Divider sx={styles.sectionDivider(theme)} />

                                <Typography sx={styles.sectionLabel} mb={3}>TRANSACTION CHRONICLE</Typography>
                                <PaymentHistory />

                                <Box sx={styles.securityNoticeBox(theme)}>
                                    <Typography variant="caption" sx={styles.securityNoticeText}>
                                        * SECURITY NOTICE: TO UPDATE CORE CREDENTIALS OR SECURITY PROTOCOLS, ACCESS THE 'SETTINGS' COMMAND MODAL.
                                    </Typography>
                                </Box>
                            </Paper>
                        </motion.div>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

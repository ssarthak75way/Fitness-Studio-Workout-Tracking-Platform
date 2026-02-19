import { Box, Container, Grid, Typography, useTheme, Link, alpha, IconButton, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Logo } from './common/Logo';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import FacebookIcon from '@mui/icons-material/Facebook';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useAuth } from '../context/AuthContext';
import type { Theme } from '@mui/material/styles';
export default function Footer() {
    const theme = useTheme();
    const { isAuthenticated } = useAuth();
    const currentYear = new Date().getFullYear();

    const socialLinks = [
        { icon: <InstagramIcon />, url: 'https://instagram.com' },
        { icon: <TwitterIcon />, url: 'https://twitter.com' },
        { icon: <FacebookIcon />, url: 'https://facebook.com' },
        { icon: <LinkedInIcon />, url: 'https://linkedin.com' },
    ];

    const platformLinks = [
        { label: 'Dashboard', path: '/dashboard', auth: true },
        { label: 'Membership', path: '/membership', auth: true },
        { label: 'Profile', path: '/profile', auth: true },
        { label: 'Classes', path: '/classes', auth: true },
        { label: 'Login', path: '/login', auth: false },
        { label: 'Join Now', path: '/login', auth: false },
    ];

    const supportLinks = [
        { label: 'About Us', path: '/about' },
        { label: 'Contact', path: '/contact' },
        { label: 'Privacy Policy', path: '/privacy' },
        { label: 'Terms of Service', path: '/terms' },
    ];

    return (
        <Box component="footer" sx={styles.footer(theme)}>
            <Container maxWidth="lg">
                <Grid container spacing={8}>
                    {/* Column 1: Branding */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Logo variant="primary" size="medium" sx={{ mb: 3 }} />
                        <Typography variant="body2" sx={styles.brandDescription}>
                            The definitive operating system for elite fitness. Elevate your performance with bio-analytics and precision scheduling.
                        </Typography>
                        <Stack direction="row" spacing={1}>
                            {socialLinks.map((social, i) => (
                                <IconButton
                                    key={i}
                                    size="small"
                                    sx={styles.socialButton(theme)}
                                >
                                    {social.icon}
                                </IconButton>
                            ))}
                        </Stack>
                    </Grid>

                    {/* Column 2: Platform */}
                    <Grid size={{ xs: 6, md: 2 }}>
                        <Typography variant="subtitle1" fontWeight={700} color="text.primary" gutterBottom>
                            PLATFORM
                        </Typography>
                        <Stack spacing={1.5} sx={{ mt: 2 }}>
                            {platformLinks
                                .filter(link => link.auth === isAuthenticated)
                                .map((link, i) => (
                                    <Link
                                        key={i}
                                        component={RouterLink}
                                        to={link.path}
                                        sx={styles.link}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                        </Stack>
                    </Grid>

                    {/* Column 3: Support */}
                    <Grid size={{ xs: 6, md: 2 }}>
                        <Typography variant="subtitle1" fontWeight={700} color="text.primary" gutterBottom>
                            SUPPORT
                        </Typography>
                        <Stack spacing={1.5} sx={{ mt: 2 }}>
                            {supportLinks.map((link, i) => (
                                <Link
                                    key={i}
                                    component={RouterLink}
                                    to={link.path}
                                    sx={styles.link}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </Stack>
                    </Grid>

                    {/* Column 4: Location & Map */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Typography variant="subtitle1" fontWeight={700} color="text.primary" gutterBottom>
                            HEADQUARTERS
                        </Typography>
                        <Stack spacing={2} sx={{ mt: 2, mb: 3 }}>
                            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                                <LocationOnIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                                <Typography variant="body2">75 Elite Avenue, NY 10001</Typography>
                            </Box>
                        </Stack>
                        <Box sx={styles.mapContainer(theme)}>
                            <iframe
                                title="FITNESS STUDIO Headquarters"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.2528082187!2d-74.11976373926838!3d40.69766374874431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                                width="100%"
                                height="100%"
                                style={{
                                    border: 0,
                                    filter: theme.palette.mode === 'dark'
                                        ? 'grayscale(1) invert(0.9) opacity(0.8)'
                                        : 'grayscale(1) opacity(0.8)'
                                }}
                                loading="lazy"
                            />
                        </Box>
                    </Grid>
                </Grid>

                <Box sx={styles.copyrightContainer(theme)}>
                    <Typography variant="caption" sx={{ opacity: 0.5 }}>
                        &copy; {currentYear} FITNESS STUDIO. BUILT FOR PRECISION. ALL RIGHTS RESERVED.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}

const styles = {
    footer: (theme: Theme) => ({
        py: 10,
        bgcolor: theme.palette.mode === 'dark' ? 'secondary.main' : 'background.paper',
        borderTop: `1px solid ${theme.palette.divider}`,
        color: 'text.secondary',
        position: 'relative',
        zIndex: 10
    }),
    brandDescription: {
        lineHeight: 1.8,
        mb: 4,
        maxWidth: 300
    },
    socialButton: (theme: Theme) => ({
        color: 'text.secondary',
        '&:hover': { color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.1) }
    }),
    link: {
        color: 'inherit',
        textDecoration: 'none',
        fontSize: '0.9rem',
        '&:hover': { color: 'primary.main' }
    },
    mapContainer: (theme: Theme) => ({
        height: 160,
        width: '100%',
        bgcolor: theme.palette.mode === 'dark' ? alpha('#000', 0.2) : alpha('#000', 0.04),
        borderRadius: 1,
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`
    }),
    copyrightContainer: (theme: Theme) => ({
        mt: 10,
        pt: 4,
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
        textAlign: 'center'
    })
};

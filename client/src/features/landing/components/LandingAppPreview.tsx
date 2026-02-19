import { Box, Container, Grid, Typography, Button, Paper, useTheme } from '@mui/material';
import type { Theme } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const UN_APP_PREVIEW = "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=2070&auto=format&fit=crop";

const styles = {
    wrapper: {
        py: 20,
        position: 'relative',
        bgcolor: 'background.paper',
        overflow: 'hidden'
    },
    bgOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: `url(${UN_APP_PREVIEW})`,
        backgroundSize: 'cover',
        opacity: 0.1,
        pointerEvents: 'none'
    },
    title: (theme: Theme) => ({
        mt: 2,
        mb: 4,
        color: theme.palette.primary.main,
        fontSize: { xs: '3rem', md: '4rem' }
    }),
    description: {
        color: 'text.secondary',
        mb: 6,
        fontWeight: 400,
        lineHeight: 1.8
    },
    ctaButton: {
        borderRadius: 0,
        py: 2,
        px: 6
    },
    imageContainer: (theme: Theme) => ({
        p: 2,
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
        backdropFilter: 'blur(20px)',
        border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : `1px solid ${theme.palette.divider}`,
        borderRadius: 0,
        position: 'relative',
        '&::before': {
            content: '""',
            position: 'absolute',
            top: -20,
            left: -20,
            width: 100,
            height: 100,
            borderLeft: '4px solid #FF5722',
            borderTop: '4px solid #FF5722'
        }
    }),
    appImage: {
        width: '100%',
        filter: 'invert(1) hue-rotate(180deg) brightness(0.8)',
        display: 'block'
    }
};

const LandingAppPreview = ({ isAuthenticated }: { isAuthenticated?: boolean }) => {
    const theme = useTheme();
    const navigate = useNavigate();

    return (
        <Box sx={styles.wrapper}>
            <Box sx={styles.bgOverlay} />
            <Container maxWidth="lg">
                <Grid container spacing={10} alignItems="center">
                    <Grid size={{ xs: 12, md: 6 }}>
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <Typography variant="overline" color="primary.main" fontWeight={900} letterSpacing={4}>
                                A NEW STANDARD
                            </Typography>
                            <Typography variant="h2" fontWeight={900} sx={styles.title(theme)}>
                                INSIDE THE <br /> ENGINE
                            </Typography>
                            <Typography variant="h6" sx={styles.description}>
                                Experience the world's most intuitive fitness dashboard. Real-time metrics, automated scheduling, and one-tap check-ins. It's not just an app; it's your performance command center.
                            </Typography>
                            <Button
                                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
                                size="large"
                                variant="contained"
                                sx={styles.ctaButton}
                            >
                                {isAuthenticated ? 'GO TO DASHBOARD' : 'GET STARTED'}
                            </Button>
                        </motion.div>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                            viewport={{ once: true }}
                            transition={{ type: 'spring', damping: 20 }}
                        >
                            <Paper
                                elevation={24}
                                sx={styles.imageContainer(theme)}
                            >
                                <Box
                                    component="img"
                                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop"
                                    sx={styles.appImage}
                                />
                            </Paper>
                        </motion.div>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default LandingAppPreview;

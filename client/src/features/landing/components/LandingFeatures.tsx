import { Box, Container, Grid, Typography, useTheme } from '@mui/material';
import type { Theme } from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import { motion } from 'framer-motion';

const styles = {
    sectionContainer: {
        py: 20
    },
    headerBox: {
        mb: 15,
        textAlign: 'center'
    },
    headerTitle: {
        letterSpacing: '-2px',
        textTransform: 'uppercase'
    },
    headerUnderline: {
        width: 100,
        height: 4,
        bgcolor: 'primary.main',
        mx: 'auto',
        mt: 2
    },
    cardContainer: (theme: Theme) => ({
        position: 'relative',
        height: 450,
        overflow: 'hidden',
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: theme.shadows[4],
        '&:hover .feature-bg': { transform: 'scale(1.1)' },
        '&:hover .feature-overlay': {
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.6)'
        },
        '&:hover .feature-content': { transform: 'translateY(0)' }
    }),
    cardBg: (theme: Theme, bgUrl: string) => ({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: `url(${bgUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        filter: theme.palette.mode === 'dark' ? 'grayscale(1) opacity(0.3)' : 'grayscale(0) opacity(0.2)'
    }),
    cardOverlay: (theme: Theme) => ({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.85)',
        transition: 'all 0.4s ease'
    }),
    cardContent: {
        position: 'relative',
        height: '100%',
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        transition: 'all 0.4s ease',
        transform: 'translateY(20px)'
    },
    iconBox: {
        width: 60,
        height: 60,
        bgcolor: 'primary.main',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mb: 3,
        borderRadius: 1
    },
    cardTitle: {
        color: 'text.primary',
        mb: 2
    },
    cardDesc: {
        color: 'text.secondary',
        mb: 2
    }
};

export const LandingFeatures = () => {
    const theme = useTheme();
    const features = [
        {
            title: 'Precision Scheduling',
            description: 'Intelligent booking that synchronizes with your personal calendar and recovery needs.',
            icon: <CalendarMonthIcon sx={{ fontSize: 32 }} />,
            bg: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop"
        },
        {
            title: 'Elite Workouts',
            description: 'Access the same training protocols used by professionals, adapted to your goals.',
            icon: <FitnessCenterIcon sx={{ fontSize: 32 }} />,
            bg: "https://images.unsplash.com/photo-1584863265045-f9d10ca7fa61?q=80&w=687&auto=format&fit=crop"
        },
        {
            title: 'Bio-Analytics',
            description: 'Track volume, intensity, and streaks with beautiful, data-rich visualizations.',
            icon: <TrendingUpIcon sx={{ fontSize: 32 }} />,
            bg: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop"
        },
        {
            title: 'Global Access',
            description: 'One membership, zero barriers. Train at any of our 120+ elite partner studios.',
            icon: <CardMembershipIcon sx={{ fontSize: 32 }} />,
            bg: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=2070&auto=format&fit=crop"
        }
    ];

    return (
        <Box sx={styles.sectionContainer}>
            <Container maxWidth="xl">
                <Box sx={styles.headerBox}>
                    <Typography variant="h2" fontWeight={900} sx={styles.headerTitle}>
                        UNRIVALED ECOSYSTEM
                    </Typography>
                    <Box sx={styles.headerUnderline} />
                </Box>
                <Grid container spacing={4}>
                    {features.map((feature, i) => (
                        <Grid size={{ xs: 12, md: 6, lg: 3 }} key={i}>
                            <motion.div
                                whileHover={{ y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Box sx={styles.cardContainer(theme)}>
                                    <Box
                                        className="feature-bg"
                                        sx={styles.cardBg(theme, feature.bg)}
                                    />
                                    <Box
                                        className="feature-overlay"
                                        sx={styles.cardOverlay(theme)}
                                    />
                                    <Box
                                        className="feature-content"
                                        sx={styles.cardContent}
                                    >
                                        <Box sx={styles.iconBox}>
                                            {feature.icon}
                                        </Box>
                                        <Typography variant="h4" fontWeight={900} sx={styles.cardTitle}>{feature.title}</Typography>
                                        <Typography variant="body1" sx={styles.cardDesc}>{feature.description}</Typography>
                                    </Box>
                                </Box>
                            </motion.div>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};

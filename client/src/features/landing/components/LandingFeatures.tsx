import { Box, Container, Grid, Typography, useTheme } from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import { motion } from 'framer-motion';

export const LandingFeatures = () => {
    const theme = useTheme();
    const features = [
        {
            title: 'Precision Scheduling',
            description: 'Intelligent booking that synchronizes with your personal calendar and recovery needs.',
            icon: <CalendarMonthIcon sx={{ fontSize: 32 }} />,
            color: '#FF5722',
            bg: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop"
        },
        {
            title: 'Elite Workouts',
            description: 'Access the same training protocols used by professionals, adapted to your goals.',
            icon: <FitnessCenterIcon sx={{ fontSize: 32 }} />,
            color: '#4CAF50',
            bg: "https://images.unsplash.com/photo-1584863265045-f9d10ca7fa61?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        },
        {
            title: 'Bio-Analytics',
            description: 'Track volume, intensity, and streaks with beautiful, data-rich visualizations.',
            icon: <TrendingUpIcon sx={{ fontSize: 32 }} />,
            color: '#2196F3',
            bg: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop"
        },
        {
            title: 'Global Access',
            description: 'One membership, zero barriers. Train at any of our 120+ elite partner studios.',
            icon: <CardMembershipIcon sx={{ fontSize: 32 }} />,
            color: '#9C27B0',
            bg: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=2070&auto=format&fit=crop"
        }
    ];

    return (
        <Box sx={{ py: 20 }}>
            <Container maxWidth="xl">
                <Box sx={{ mb: 15, textAlign: 'center' }}>
                    <Typography variant="h2" fontWeight={900} sx={{ letterSpacing: '-2px', textTransform: 'uppercase' }}>
                        UNRIVALED ECOSYSTEM
                    </Typography>
                    <Box sx={{ width: 100, height: 4, bgcolor: 'primary.main', mx: 'auto', mt: 2 }} />
                </Box>
                <Grid container spacing={4}>
                    {features.map((feature, i) => (
                        <Grid size={{ xs: 12, md: 6, lg: 3 }} key={i}>
                            <motion.div
                                whileHover={{ y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Box
                                    sx={{
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
                                    }}
                                >
                                    <Box
                                        className="feature-bg"
                                        sx={{
                                            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                            backgroundImage: `url(${feature.bg})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                                            filter: theme.palette.mode === 'dark' ? 'grayscale(1) opacity(0.3)' : 'grayscale(0) opacity(0.2)'
                                        }}
                                    />
                                    <Box
                                        className="feature-overlay"
                                        sx={{
                                            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.85)',
                                            transition: 'all 0.4s ease'
                                        }}
                                    />
                                    <Box
                                        className="feature-content"
                                        sx={{
                                            position: 'relative', height: '100%', p: 4, display: 'flex', flexDirection: 'column',
                                            justifyContent: 'flex-end', transition: 'all 0.4s ease', transform: 'translateY(20px)'
                                        }}
                                    >
                                        <Box sx={{ width: 60, height: 60, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3, borderRadius: 1 }}>
                                            {feature.icon}
                                        </Box>
                                        <Typography variant="h4" fontWeight={900} sx={{ color: 'text.primary', mb: 2 }}>{feature.title}</Typography>
                                        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>{feature.description}</Typography>
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

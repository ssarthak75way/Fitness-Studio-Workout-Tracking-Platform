import { Box, Container, Typography, Grid, Paper, useTheme } from '@mui/material';
import type { Theme } from '@mui/material';
import { motion } from 'framer-motion';

const UN_ABOUT_HERO = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop";

const styles = {
    pageContainer: {
        bgcolor: 'background.default'
    },
    heroSection: {
        height: '60vh',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${UN_ABOUT_HERO})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
    },
    heroTitle: {
        color: '#fff',
        fontSize: { xs: '3rem', md: '5rem' }
    },
    narrativeSection: {
        py: 20
    },
    narrativeDivider: {
        width: 60,
        height: 4,
        bgcolor: 'primary.main',
        mb: 4
    },
    narrativeText: {
        color: 'text.secondary',
        fontWeight: 400,
        lineHeight: 1.8
    },
    narrativeImage: {
        width: '100%',
        border: '1px solid rgba(255,255,255,0.1)'
    },
    valuesSection: {
        py: 20,
        bgcolor: 'secondary.main'
    },
    valuesHeader: {
        textAlign: 'center',
        mb: 10
    },
    valueCard: (theme: Theme) => ({
        p: 6,
        height: '100%',
        bgcolor: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: 0,
        transition: 'all 0.3s ease',
        '&:hover': {
            transform: 'translateY(-10px)',
            borderColor: theme.palette.primary.main
        }
    }),
    valueDesc: {
        color: 'text.secondary',
        lineHeight: 1.7
    }
};

export default function AboutPage() {
    const theme = useTheme();

    const values = [
        { title: 'PRECISION', desc: 'Every rep, every set, every data point tracked with absolute accuracy.' },
        { title: 'ELITE', desc: 'Designed for those who demand more from their fitness and their technology.' },
        { title: 'COMMUNITY', desc: 'A collective of high-performers pushing the boundaries of human potential.' }
    ];

    return (
        <Box sx={styles.pageContainer}>
            {/* Hero Section */}
            <Box sx={styles.heroSection}>
                <Container maxWidth="lg">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Typography variant="overline" color="primary.main" fontWeight={900} letterSpacing={4}>
                            OUR STORY
                        </Typography>
                        <Typography variant="h1" fontWeight={900} sx={styles.heroTitle}>
                            THE GENESIS OF <br /> PERFORMANCE.
                        </Typography>
                    </motion.div>
                </Container>
            </Box>

            {/* Narrative Section */}
            <Container maxWidth="lg" sx={styles.narrativeSection}>
                <Grid container spacing={10} alignItems="center">
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="h3" fontWeight={900} gutterBottom>
                            BEYOND THE <br /> GYM FLOOR.
                        </Typography>
                        <Box sx={styles.narrativeDivider} />
                        <Typography variant="h6" sx={styles.narrativeText}>
                            FITNESS STUDIO was born from a simple realization: fitness management was broken. It was fragmented, analog, and lacked the precision that modern athletes deserve. We built FITNESS STUDIO to be the definitive operating system for your physical transformation—combining elite-level tracking with a seamless community experience.
                        </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Box
                            component="img"
                            src="https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=2070&auto=format&fit=crop"
                            sx={styles.narrativeImage}
                        />
                    </Grid>
                </Grid>
            </Container>

            {/* Values Section */}
            <Box sx={styles.valuesSection}>
                <Container maxWidth="lg">
                    <Box sx={styles.valuesHeader}>
                        <Typography variant="h3" fontWeight={900}>OUR CORE VALUES</Typography>
                    </Box>
                    <Grid container spacing={4}>
                        {values.map((v, i) => (
                            <Grid size={{ xs: 12, md: 4 }} key={i}>
                                <Paper
                                    elevation={0}
                                    sx={styles.valueCard(theme)}
                                >
                                    <Typography variant="h4" fontWeight={900} color="primary.main" gutterBottom>
                                        0{i + 1}
                                    </Typography>
                                    <Typography variant="h5" fontWeight={900} mb={3}>{v.title}</Typography>
                                    <Typography variant="body1" sx={styles.valueDesc}>
                                        {v.desc}
                                    </Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>
        </Box>
    );
}

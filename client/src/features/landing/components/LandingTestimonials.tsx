import { Box, Container, Grid, Typography, Card, Avatar, useTheme } from '@mui/material';
import type { Theme } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';

const styles = {
    sectionContainer: {
        py: 20,
        bgcolor: 'background.default'
    },
    headerBox: {
        textAlign: 'center',
        mb: 10
    },
    headerUnderline: {
        width: 60,
        height: 4,
        bgcolor: 'primary.main',
        mx: 'auto',
        mt: 2
    },
    testimonialCard: (theme: Theme) => ({
        p: 6,
        height: '100%',
        bgcolor: 'background.paper',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 0,
        boxShadow: theme.shadows[2]
    }),
    starsBox: {
        mb: 4,
        color: 'primary.main'
    },
    quoteText: {
        fontSize: '1.2rem',
        fontStyle: 'italic',
        mb: 6,
        color: 'text.secondary'
    },
    authorBox: {
        display: 'flex',
        alignItems: 'center',
        gap: 2
    },
    authorAvatar: {
        width: 50,
        height: 50,
        borderRadius: 0
    },
    authorName: {
        fontWeight: 900
    },
    authorRole: {
        color: 'primary.main',
        fontWeight: 800
    }
};

export const LandingTestimonials = () => {
    const theme = useTheme();
    const testimonials = [
        {
            name: 'Sarah Jenkins',
            role: 'Marathon Runner',
            image: 'https://i.pravatar.cc/150?u=sarah',
            quote: 'This platform changed how I train. The scheduling is seamless and the workout tracking is the best I have used.'
        },
        {
            name: 'Mark Thompson',
            role: 'Bodybuilder',
            image: 'https://i.pravatar.cc/150?u=mark',
            quote: 'Tracking my PRs and sets in real-time has been a game changer for my muscle growth. Highly recommend!'
        },
        {
            name: 'Robert Wilson',
            role: 'Fitness Enthusiast',
            image: 'https://i.pravatar.cc/150?u=robert',
            quote: 'At 65, staying active is key. This app makes it easy for me to find classes that suit my pace and ability.'
        }
    ];

    return (
        <Box sx={styles.sectionContainer}>
            <Container maxWidth="lg">
                <Box sx={styles.headerBox}>
                    <Typography variant="h3" fontWeight={900}>TRUSTED BY PROS</Typography>
                    <Box sx={styles.headerUnderline} />
                </Box>
                <Grid container spacing={4}>
                    {testimonials.map((t, i) => (
                        <Grid size={{ xs: 12, md: 4 }} key={i}>
                            <Card sx={styles.testimonialCard(theme)}>
                                <Box sx={styles.starsBox}>
                                    {[...Array(5)].map((_, j) => <StarIcon key={j} fontSize="small" />)}
                                </Box>
                                <Typography variant="body1" sx={styles.quoteText}>
                                    "{t.quote}"
                                </Typography>
                                <Box sx={styles.authorBox}>
                                    <Avatar src={t.image} sx={styles.authorAvatar} />
                                    <Box>
                                        <Typography variant="h6" sx={styles.authorName}>{t.name}</Typography>
                                        <Typography variant="caption" sx={styles.authorRole}>{t.role}</Typography>
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};

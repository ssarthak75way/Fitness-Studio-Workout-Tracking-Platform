import { Box, Container, Grid, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CountUp from 'react-countup';
export const LandingStats = () => {
    const stats = [
        { label: 'Active Athletes', value: 10000 },
        { label: 'Daily Classes', value: 500 },
        { label: 'Elite Studios', value: 120 },
        { label: 'Pro Trainers', value: 300 },
    ];

    const theme = useTheme();

    return (
        <Box sx={{ bgcolor: 'background.paper', py: 10, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Container maxWidth="lg">
                <Grid container spacing={8}>
                    {stats.map((stat, i) => (
                        <Grid size={{ xs: 6, md: 3 }} key={i}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h2" sx={{ fontWeight: 900, color: 'primary.main', mb: 1 }}><CountUp end={stat.value} duration={5} />+</Typography>
                                <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800, letterSpacing: '2px' }}>{stat.label}</Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};

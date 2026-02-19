import { Box, Container, Grid, Typography, useTheme } from '@mui/material';
import type { Theme } from '@mui/material';
import CountUp from 'react-countup';

const styles = {
    container: (theme: Theme) => ({
        bgcolor: 'background.paper',
        py: 10,
        borderBottom: `1px solid ${theme.palette.divider}`
    }),
    statBox: {
        textAlign: 'center'
    },
    valueText: {
        fontWeight: 900,
        color: 'primary.main',
        mb: 1
    },
    labelText: {
        color: 'text.secondary',
        fontWeight: 800,
        letterSpacing: '2px'
    }
};

export const LandingStats = () => {
    const stats = [
        { label: 'Active Athletes', value: 10000 },
        { label: 'Daily Classes', value: 500 },
        { label: 'Elite Studios', value: 120 },
        { label: 'Pro Trainers', value: 300 },
    ];

    const theme = useTheme();

    return (
        <Box sx={styles.container(theme)}>
            <Container maxWidth="lg">
                <Grid container spacing={8}>
                    {stats.map((stat, i) => (
                        <Grid size={{ xs: 6, md: 3 }} key={i}>
                            <Box sx={styles.statBox}>
                                <Typography variant="h2" sx={styles.valueText}>
                                    <CountUp end={stat.value} duration={5} />+
                                </Typography>
                                <Typography variant="overline" sx={styles.labelText}>
                                    {stat.label}
                                </Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};

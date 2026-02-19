import { Box, Container, Grid, Typography, Card, Divider, Button, useTheme } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';

interface LandingPricingProps {
    isAuthenticated: boolean;
}

export const LandingPricing = ({ isAuthenticated }: LandingPricingProps) => {
    const theme = useTheme();
    const navigate = useNavigate();

    const pricing = [
        {
            title: 'Monthly Unlimited',
            price: '₹99',
            period: '/month',
            features: ['Unlimited classes', 'Access to all locations', 'Free towel service', '1 Guest pass/month'],
            button: isAuthenticated ? 'Choose Plan' : 'Start Now',
            highlight: false,
            color: '#3b82f6'
        },
        {
            title: 'Annual Unlimited',
            price: '₹999',
            period: '/year',
            features: ['All Monthly benefits', 'Save ₹189/year', 'Exclusive workshops', 'Priority booking'],
            button: isAuthenticated ? 'Choose Plan' : 'Go Pro',
            highlight: true,
            color: theme.palette.primary.main
        },
        {
            title: '10 Class Pack',
            price: '₹150',
            period: '',
            features: ['10 class credits', 'Never expires', 'Shareable with 1 friend', 'Valid at home location'],
            button: isAuthenticated ? 'Choose Plan' : 'Get Pack',
            highlight: false,
            color: '#10b981'
        }
    ];

    return (
        <Box sx={{ py: 20, bgcolor: theme.palette.mode === 'dark' ? 'secondary.main' : 'background.paper' }}>
            <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center', mb: 15 }}>
                    <Typography variant="h2" fontWeight={900} color="primary">THE INVESTMENT</Typography>
                    <Typography variant="h6" sx={{ opacity: 0.6, mt: 2, color: 'text.secondary' }}>Access the full system. No hidden fees.</Typography>
                </Box>
                <Grid container spacing={4} justifyContent="center">
                    {pricing.map((plan, i) => (
                        <Grid size={{ xs: 12, md: 4 }} key={i}>
                            <Card
                                sx={{
                                    p: 6, height: '100%', borderRadius: 0,
                                    bgcolor: plan.highlight
                                        ? (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)')
                                        : 'transparent',
                                    border: plan.highlight
                                        ? `2px solid ${theme.palette.primary.main}`
                                        : `1px solid ${theme.palette.divider}`,
                                    transition: 'all 0.3s ease',
                                    '&:hover': { transform: 'scale(1.02)' }
                                }}
                            >
                                <Typography variant="h4" fontWeight={900} mb={1} color="text.primary">{plan.title.toUpperCase()}</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 4 }}>
                                    <Typography variant="h2" fontWeight={900} color="primary.main">{plan.price}</Typography>
                                    <Typography variant="h6" sx={{ opacity: 0.5, color: 'text.secondary' }}>{plan.period}</Typography>
                                </Box>
                                <Divider sx={{ mb: 4, borderColor: theme.palette.divider }} />
                                <Box sx={{ mb: 8 }}>
                                    {plan.features.map((f, j) => (
                                        <Box key={j} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                                            <CheckCircleIcon sx={{ fontSize: 18, color: plan.color }} />
                                            <Typography variant="body1" fontWeight={500} color="text.primary">{f}</Typography>
                                        </Box>
                                    ))}
                                </Box>
                                <Button
                                    fullWidth
                                    variant={plan.highlight ? 'contained' : 'outlined'}
                                    size="large"
                                    sx={{ borderRadius: 0, py: 2, fontWeight: 900 }}
                                    onClick={() => navigate(isAuthenticated ? '/membership' : '/login')}
                                >
                                    {plan.button.toUpperCase()}
                                </Button>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};

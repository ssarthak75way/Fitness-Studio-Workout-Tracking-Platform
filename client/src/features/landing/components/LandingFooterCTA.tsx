import { Box, Container, Typography, Button, useTheme } from '@mui/material';

interface LandingFooterCTAProps {
    isAuthenticated: boolean;
    onCTA: () => void;
}

export const LandingFooterCTA = ({ isAuthenticated, onCTA }: LandingFooterCTAProps) => {
    const theme = useTheme();
    return (
        <Box
            sx={{
                py: 25,
                bgcolor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
                <Typography variant="h2" fontWeight={900} mb={4} sx={{ letterSpacing: '-2px' }}>
                    YOUR NEW REIGN <br /> BEGINS NOW.
                </Typography>
                <Typography variant="h5" mb={8} sx={{ opacity: 0.9, fontWeight: 400 }}>
                    Stop managing your fitness. Start mastering it.
                </Typography>
                <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    sx={{ py: 3, px: 10, fontSize: '1.2rem', fontWeight: 900, borderRadius: 0, color: theme.palette.secondary.contrastText }}
                    onClick={onCTA}
                >
                    {isAuthenticated ? 'CONTINUE TO DASHBOARD' : 'JOIN THE REVOLUTION'}
                </Button>
            </Container>
            <Typography
                variant="h1"
                sx={{
                    position: 'absolute', bottom: -50, left: 0, width: '100%',
                    fontSize: '20rem', fontWeight: 900, opacity: 0.05, whiteSpace: 'nowrap',
                    pointerEvents: 'none'
                }}
            >
                PERFORMANCE. PERFORMANCE.
            </Typography>
        </Box>
    );
};

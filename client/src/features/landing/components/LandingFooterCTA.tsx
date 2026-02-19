import { Box, Container, Typography, Button, useTheme } from '@mui/material';
import type { Theme } from '@mui/material';

interface LandingFooterCTAProps {
    isAuthenticated: boolean;
    onCTA: () => void;
}

const styles = {
    container: (theme: Theme) => ({
        py: 25,
        bgcolor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
    }),
    contentWrapper: {
        position: 'relative',
        zIndex: 1
    },
    title: {
        letterSpacing: '-2px'
    },
    subtitle: {
        opacity: 0.9,
        fontWeight: 400
    },
    ctaButton: (theme: Theme) => ({
        py: 3,
        px: 10,
        fontSize: '1.2rem',
        fontWeight: 900,
        borderRadius: 0,
        color: theme.palette.secondary.contrastText
    }),
    bgText: {
        position: 'absolute',
        bottom: -50,
        left: 0,
        width: '100%',
        fontSize: '20rem',
        fontWeight: 900,
        opacity: 0.05,
        whiteSpace: 'nowrap',
        pointerEvents: 'none'
    }
};

export const LandingFooterCTA = ({ isAuthenticated, onCTA }: LandingFooterCTAProps) => {
    const theme = useTheme();
    return (
        <Box sx={styles.container(theme)}>
            <Container maxWidth="md" sx={styles.contentWrapper}>
                <Typography variant="h2" fontWeight={900} mb={4} sx={styles.title}>
                    YOUR NEW REIGN <br /> BEGINS NOW.
                </Typography>
                <Typography variant="h5" mb={8} sx={styles.subtitle}>
                    Stop managing your fitness. Start mastering it.
                </Typography>
                <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    sx={styles.ctaButton(theme)}
                    onClick={onCTA}
                >
                    {isAuthenticated ? 'CONTINUE TO DASHBOARD' : 'JOIN THE REVOLUTION'}
                </Button>
            </Container>
            <Typography variant="h1" sx={styles.bgText}>
                PERFORMANCE. PERFORMANCE.
            </Typography>
        </Box>
    );
};

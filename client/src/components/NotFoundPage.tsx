import { Box, Typography, Button, Container, useTheme } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';

export default function NotFoundPage() {
    const navigate = useNavigate();
    const theme = useTheme();

    return (
        <Container maxWidth="md">
            <Box sx={styles.container}>
                <SentimentDissatisfiedIcon sx={styles.icon(theme)} />
                <Typography variant="h1" component="h1" sx={styles.title}>
                    404
                </Typography>
                <Typography variant="h4" color="text.secondary">
                    Page Not Found
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                    The page you are looking for might have been removed, had its name changed,
                    or is temporarily unavailable.
                </Typography>
                <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/')}
                    sx={styles.button}
                >
                    Go to Home
                </Button>
            </Box>
        </Container>
    );
}

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        textAlign: 'center',
        gap: 3,
    },
    icon: (theme: Theme) => ({
        fontSize: 100,
        color: theme.palette.text.secondary
    }),
    title: {
        fontWeight: 'bold'
    },
    button: {
        mt: 2
    }
};

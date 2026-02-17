import { Box, Typography, Button, Container, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';

export default function NotFoundPage() {
    const navigate = useNavigate();
    const theme = useTheme();

    return (
        <Container maxWidth="md">
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '80vh',
                    textAlign: 'center',
                    gap: 3,
                }}
            >
                <SentimentDissatisfiedIcon
                    sx={{ fontSize: 100, color: theme.palette.text.secondary }}
                />
                <Typography variant="h1" component="h1" sx={{ fontWeight: 'bold' }}>
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
                    sx={{ mt: 2 }}
                >
                    Go to Home
                </Button>
            </Box>
        </Container>
    );
}

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <Container maxWidth="sm">
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '100vh',
                            textAlign: 'center',
                            gap: 2,
                        }}
                    >
                        <ErrorOutlineIcon sx={{ fontSize: 64, color: 'error.main' }} />
                        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                            Something went wrong
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            The application encountered an unexpected error.
                        </Typography>
                        {this.state.error && (
                            <Box
                                sx={{
                                    p: 2,
                                    bgcolor: 'grey.100',
                                    borderRadius: 1,
                                    width: '100%',
                                    overflow: 'auto',
                                    mb: 2,
                                    textAlign: 'left',
                                }}
                            >
                                <Typography variant="caption" fontFamily="monospace" color="error">
                                    {this.state.error.toString()}
                                </Typography>
                            </Box>
                        )}
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => window.location.reload()}
                            size="large"
                        >
                            Reload Application
                        </Button>
                    </Box>
                </Container>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

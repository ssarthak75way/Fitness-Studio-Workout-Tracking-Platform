import { AppBar, Container, Toolbar, Box, Avatar, Button, useTheme, alpha, type Theme } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Logo } from './Logo';

export const PublicHeader = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user } = useAuth();
    const theme = useTheme();

    const isLanding = location.pathname === '/';

    return (
        <AppBar
            position={isLanding ? "absolute" : "sticky"}
            color="transparent"
            sx={styles.appBar(isLanding, theme)}
        >
            <Container maxWidth="xl">
                <Toolbar sx={styles.toolbar}>
                    <Box onClick={() => navigate('/')} sx={styles.logoContainer}>
                        <Logo variant={"primary"} size="medium" />
                    </Box>
                    <Box sx={styles.navContainer}>
                        {isAuthenticated ? (
                            <Box display="flex" alignItems="center" gap={3}>
                                <Avatar src={user?.profileImage} sx={styles.avatar(isLanding, theme)} />
                                <Button
                                    variant="contained"
                                    onClick={() => navigate('/dashboard')}
                                    sx={styles.dashboardButton}
                                >
                                    DASHBOARD
                                </Button>
                            </Box>
                        ) : (
                            <Box display="flex" alignItems="center" gap={4}>
                                <Button
                                    color="inherit"
                                    sx={styles.loginButton}
                                    onClick={() => navigate('/login')}
                                >
                                    LOGIN
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={() => navigate('/login')}
                                    sx={styles.joinButton}
                                >
                                    JOIN NOW
                                </Button>
                            </Box>
                        )}
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

const styles = {
    appBar: (isLanding: boolean, theme: Theme) => ({
        borderBottom: isLanding ? 'none' : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        backdropFilter: isLanding ? 'none' : 'blur(20px)',
        bgcolor: isLanding ? 'transparent' : alpha(theme.palette.background.default, 0.8),
        boxShadow: 'none',
        zIndex: theme.zIndex.drawer + 1
    }),
    toolbar: {
        justifyContent: 'space-between',
        py: 2
    },
    logoContainer: {
        cursor: 'pointer'
    },
    navContainer: {
        display: 'flex',
        gap: 4,
        alignItems: 'center'
    },
    avatar: (isLanding: boolean, theme: Theme) => ({
        width: 40,
        height: 40,
        border: `2px solid ${isLanding ? 'rgba(255,255,255,0.2)' : theme.palette.primary.main}`
    }),
    dashboardButton: {
        borderRadius: 0
    },
    loginButton: {
        color: 'text.primary',
        fontWeight: 700,
        border: '1px solid #000',
        '&:hover': { color: 'primary.main' }
    },
    joinButton: {
        borderRadius: 0,
        px: 4
    }
};

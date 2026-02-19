import { AppBar, Container, Toolbar, Box, Avatar, Button, useTheme, alpha } from '@mui/material';
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
            sx={{
                borderBottom: isLanding ? 'none' : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                backdropFilter: isLanding ? 'none' : 'blur(20px)',
                bgcolor: isLanding ? 'transparent' : alpha(theme.palette.background.default, 0.8),
                boxShadow: 'none',
                zIndex: theme.zIndex.drawer + 1
            }}
        >
            <Container maxWidth="xl">
                <Toolbar sx={{ justifyContent: 'space-between', py: 2 }}>
                    <Box onClick={() => navigate('/')} sx={{ cursor: 'pointer' }}>
                        <Logo variant={"primary"} size="medium" />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        {isAuthenticated ? (
                            <Box display="flex" alignItems="center" gap={3}>
                                <Avatar src={user?.profileImage} sx={{ width: 40, height: 40, border: `2px solid ${isLanding ? 'rgba(255,255,255,0.2)' : theme.palette.primary.main}` }} />
                                <Button
                                    variant="contained"
                                    onClick={() => navigate('/dashboard')}
                                    sx={{ borderRadius: 0 }}
                                >
                                    DASHBOARD
                                </Button>
                            </Box>
                        ) : (
                            <Box display="flex" alignItems="center" gap={4}>
                                <Button
                                    color="inherit"
                                    sx={{ color: isLanding ? '#fff' : 'text.primary', fontWeight: 700, '&:hover': { color: 'primary.main' } }}
                                    onClick={() => navigate('/login')}
                                >
                                    LOGIN
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={() => navigate('/login')}
                                    sx={{ borderRadius: 0, px: 4 }}
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

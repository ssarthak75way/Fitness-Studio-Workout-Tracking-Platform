import { type ReactNode, useState } from 'react';
import { Box, AppBar, Toolbar, Typography, Button, IconButton, Tooltip, Avatar, alpha } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useThemeContext } from '../context/ThemeContext';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import NotificationPopover from './NotificationPopover';
import Sidebar, { drawerWidth } from './Layout/Sidebar';
import { Logo } from './common/Logo';
import type { Theme } from '@mui/material';
import Footer from './Footer';

const styles = {
    root: { display: 'flex' },
    appBar: (theme: Theme) => ({
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        zIndex: theme.zIndex.drawer + 1,
        bgcolor: alpha(theme.palette.background.paper, 0.7),
        backdropFilter: 'blur(16px) saturate(180%)',
        color: 'text.primary',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: 'none',
        height: 70,
        display: 'flex',
        justifyContent: 'center'
    }),
    menuButton: { mr: 2, display: { sm: 'none' } },
    typographyFlex: { flexGrow: 1, fontWeight: 700, letterSpacing: '-0.02em' },
    themeToggle: { mr: 2 },
    userName: { mx: 2, fontWeight: 600, display: { xs: 'none', md: 'block' } },
    main: {
        flexGrow: 1,
        p: { xs: 2, md: 3 },
        width: { xs: '100%', sm: `calc(100% - ${drawerWidth}px)` },
        minHeight: '100vh',
        bgcolor: 'background.default',
        color: 'text.primary',
        display: 'flex',
        flexDirection: 'column',
    },
    impersonationBanner: (theme: Theme) => ({
        bgcolor: theme.palette.error.main,
        color: '#fff',
        py: 1,
        px: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: theme.zIndex.drawer + 2,
        fontWeight: 900,
        letterSpacing: '1px',
        fontSize: '0.75rem',
        textTransform: 'uppercase',
    })
};

export default function ProtectedLayout({ children }: { children: ReactNode }) {
    const navigate = useNavigate();
    const theme = useTheme();
    const { user, logout, isImpersonating, stopImpersonation } = useAuth();
    const { mode, toggleTheme } = useThemeContext();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleStopImpersonation = async () => {
        await stopImpersonation();
    };

    return (
        <Box sx={styles.root}>
            {isImpersonating && (
                <Box sx={styles.impersonationBanner(theme)}>
                    <Typography variant="caption" sx={{ fontWeight: 900 }}>
                        SYSTEM ALERT: ACTIVE IMPERSONATION PROTOCOL. ACTING AS MEMBER: {user?.fullName?.toUpperCase()}
                    </Typography>
                    <Button
                        size="small"
                        variant="contained"
                        color="inherit"
                        onClick={handleStopImpersonation}
                        sx={{
                            color: 'error.main',
                            fontWeight: 950,
                            borderRadius: 0,
                            px: 3,
                            fontSize: '0.65rem'
                        }}
                    >
                        STOP PROTOCOL
                    </Button>
                </Box>
            )}
            <AppBar position="fixed" sx={{ ...styles.appBar(theme), top: isImpersonating ? 40 : 0 }} elevation={0}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={styles.menuButton}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Box sx={styles.typographyFlex}>
                        <Box sx={{ display: { xs: 'flex', sm: 'none' } }}>
                            <Logo size="small" />
                        </Box>
                    </Box>

                    <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}>
                        <IconButton onClick={toggleTheme} color="inherit" sx={styles.themeToggle}>
                            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                        </IconButton>
                    </Tooltip>

                    <NotificationPopover />

                    <Box display="flex" alignItems="center">
                        <Avatar
                            src={user?.profileImage || ""}
                            sx={{
                                width: 32, height: 32,
                                cursor: 'pointer',
                                ml: 1,
                                border: '1px solid',
                                borderColor: 'divider'
                            }}
                            onClick={() => navigate('/profile')}
                        >
                            {!sessionStorage.getItem('profileImage') && user?.fullName?.charAt(0)}
                        </Avatar>
                        <Typography variant="body2" sx={styles.userName}>
                            {user?.fullName?.split(' ')[0]} ({user?.role})
                        </Typography>
                    </Box>

                    <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />} sx={{ ml: 1 }}>
                        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Logout</Box>
                    </Button>
                </Toolbar>
            </AppBar>

            <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />

            <Box component="main" sx={styles.main}>
                <Toolbar />
                <Box sx={{ flexGrow: 1 }}>
                    {children}
                </Box>
                <Footer />
            </Box>
        </Box>
    );
}

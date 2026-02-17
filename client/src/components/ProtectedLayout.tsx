import { type ReactNode, useState } from 'react';
import { Box, AppBar, Toolbar, Typography, Button, IconButton, Tooltip, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useThemeContext } from '../context/ThemeContext';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import NotificationPopover from './NotificationPopover';
import Sidebar, { drawerWidth } from './Layout/Sidebar';
import type { Theme } from '@mui/material';
import Footer from './Footer';

const styles = {
    root: { display: 'flex' },
    appBar: (theme: Theme) => ({
        // width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        zIndex: theme.zIndex.drawer + 1,
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderBottom: `1px solid ${theme.palette.divider}`,
        boxShadow: 'none'
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
};

export default function ProtectedLayout({ children }: { children: ReactNode }) {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { mode, toggleTheme } = useThemeContext();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Box sx={styles.root}>
            <AppBar position="fixed" sx={styles.appBar} elevation={0}>
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

                    <Typography variant="h6" noWrap component="div" sx={styles.typographyFlex}>
                        Fitness Studio
                    </Typography>

                    <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}>
                        <IconButton onClick={toggleTheme} color="inherit" sx={styles.themeToggle}>
                            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                        </IconButton>
                    </Tooltip>

                    <NotificationPopover />

                    <Box display="flex" alignItems="center">
                        <Avatar
                            src={sessionStorage.getItem('profileImage') || ""}
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

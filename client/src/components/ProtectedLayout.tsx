import { type ReactNode } from 'react';
import { Box, AppBar, Toolbar, Typography, Button, Drawer, List, ListItem, ListItemIcon, ListItemText, ListItemButton, IconButton, Tooltip } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useThemeContext } from '../context/ThemeContext';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import UserIcon from '@mui/icons-material/People';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationPopover from './NotificationPopover';
import type { Theme } from '@mui/material';

const DRAWER_WIDTH = 240;

const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Schedule', icon: <CalendarMonthIcon />, path: '/schedule' },
    { text: 'My Bookings', icon: <BookmarkIcon />, path: '/bookings' },
    { text: 'Workouts', icon: <FitnessCenterIcon />, path: '/workouts' },
    { text: 'Workout Templates', icon: <NoteAddIcon />, path: '/workouts/templates', roles: ['STUDIO_ADMIN', 'INSTRUCTOR'] },
    { text: 'Progress', icon: <TrendingUpIcon />, path: '/progress' },
    { text: 'Membership', icon: <CardMembershipIcon />, path: '/membership' },
    { text: 'My Profile', icon: <AccountCircleIcon />, path: '/profile' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    { text: 'User Management', icon: <UserIcon />, path: '/admin/users', roles: ['STUDIO_ADMIN'] },
    { text: 'Check-In', icon: <QrCodeScannerIcon />, path: '/check-in', roles: ['STUDIO_ADMIN', 'INSTRUCTOR'] },
];

const styles = {
    root: {
        display: 'flex',
    },
    appBar: (theme: Theme) => ({
        zIndex: theme.zIndex.drawer + 1,
    }),
    typographyFlex: {
        flexGrow: 1,
    },
    themeToggle: {
        mr: 2,
    },
    userName: {
        mx: 2,
    },
    drawer: {
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
        },
    },
    drawerContent: {
        overflow: 'auto',
    },
    main: {
        flexGrow: 1,
        p: 3,
        bgcolor: 'background.default',
        color: 'text.primary',
        minHeight: '100vh',
    },
};

export default function ProtectedLayout({ children }: { children: ReactNode }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const { mode, toggleTheme } = useThemeContext();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Box sx={styles.root}>
            <AppBar position="fixed" sx={styles.appBar}>
                <Toolbar>
                    <Typography variant="h6" noWrap component="div" sx={styles.typographyFlex}>
                        Fitness Studio
                    </Typography>

                    <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}>
                        <IconButton onClick={toggleTheme} color="inherit" sx={styles.themeToggle}>
                            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                        </IconButton>
                    </Tooltip>

                    <NotificationPopover />

                    <Typography variant="body2" sx={styles.userName}>
                        {user?.fullName} ({user?.role})
                    </Typography>
                    <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>

            <Drawer
                variant="permanent"
                sx={styles.drawer}
            >
                <Toolbar />
                <Box sx={styles.drawerContent}>
                    <List>
                        {menuItems.filter(item => !item.roles || (user?.role && item.roles.includes(user.role))).map((item) => (
                            <ListItem key={item.text} disablePadding>
                                <ListItemButton
                                    selected={location.pathname === item.path}
                                    onClick={() => navigate(item.path)}
                                >
                                    <ListItemIcon>{item.icon}</ListItemIcon>
                                    <ListItemText primary={item.text} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>

            <Box component="main" sx={styles.main}>
                <Toolbar />
                {children}
            </Box>
        </Box>
    );
}

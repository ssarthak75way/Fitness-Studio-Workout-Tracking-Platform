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
import NotificationPopover from './NotificationPopover';

const DRAWER_WIDTH = 240;

const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Schedule', icon: <CalendarMonthIcon />, path: '/schedule' },
    { text: 'My Bookings', icon: <BookmarkIcon />, path: '/bookings' },
    { text: 'Workouts', icon: <FitnessCenterIcon />, path: '/workouts' },
    { text: 'Progress', icon: <TrendingUpIcon />, path: '/progress' },
    { text: 'Membership', icon: <CardMembershipIcon />, path: '/membership' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    { text: 'User Management', icon: <UserIcon />, path: '/admin/users', roles: ['STUDIO_ADMIN'] },
    { text: 'Check-In', icon: <QrCodeScannerIcon />, path: '/check-in', roles: ['STUDIO_ADMIN', 'INSTRUCTOR'] },
];

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
        <Box sx={{ display: 'flex' }}>
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        Fitness Studio
                    </Typography>

                    <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}>
                        <IconButton onClick={toggleTheme} color="inherit" sx={{ mr: 2 }}>
                            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                        </IconButton>
                    </Tooltip>

                    <NotificationPopover />

                    <Typography variant="body2" sx={{ mx: 2 }}>
                        {user?.fullName} ({user?.role})
                    </Typography>
                    <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>

            <Drawer
                variant="permanent"
                sx={{
                    width: DRAWER_WIDTH,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: DRAWER_WIDTH,
                        boxSizing: 'border-box',
                    },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto' }}>
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

            <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: 'background.default', color: 'text.primary', minHeight: '100vh' }}>
                <Toolbar />
                {children}
            </Box>
        </Box>
    );
}

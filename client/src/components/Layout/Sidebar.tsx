import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Avatar, Typography, Chip, alpha } from '@mui/material';
import { NavLink } from 'react-router-dom';
import React from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PeopleIcon from '@mui/icons-material/People';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import SettingsIcon from '@mui/icons-material/Settings';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const drawerWidth = 280;

interface SidebarProps {
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
}

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  roles: string[];
}

const menuItems: MenuItem[] = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', roles: ['STUDIO_ADMIN', 'INSTRUCTOR', 'MEMBER'] },
  { text: 'User Management', icon: <PeopleIcon />, path: '/admin/users', roles: ['STUDIO_ADMIN'] },
  { text: 'Scan & Check-In', icon: <QrCodeScannerIcon />, path: '/check-in', roles: ['STUDIO_ADMIN', 'INSTRUCTOR'] },
  { text: 'Class Schedule', icon: <CalendarMonthIcon />, path: '/schedule', roles: ['MEMBER', 'INSTRUCTOR', 'STUDIO_ADMIN'] },
  { text: 'My Bookings', icon: <BookOnlineIcon />, path: '/bookings', roles: ['MEMBER'] },
  { text: 'My Workouts', icon: <FitnessCenterIcon />, path: '/workouts', roles: ['MEMBER'] },
  { text: 'Workout Templates', icon: <NoteAddIcon />, path: '/workouts/templates', roles: ['STUDIO_ADMIN', 'INSTRUCTOR'] },
  { text: 'Progress', icon: <AssessmentIcon />, path: '/progress', roles: ['MEMBER'] },
  { text: 'Membership', icon: <CardMembershipIcon />, path: '/membership', roles: ['MEMBER'] },
  { text: 'My Profile', icon: <AccountCircleIcon />, path: '/profile', roles: ['STUDIO_ADMIN', 'INSTRUCTOR', 'MEMBER'] },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings', roles: ['STUDIO_ADMIN', 'INSTRUCTOR', 'MEMBER'] },
];

const styles = {
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    '& .MuiDrawer-paper': {
      width: drawerWidth,
      boxSizing: 'border-box',
      borderRight: '1px solid',
      borderColor: (theme: any) => theme.palette.mode === 'dark' ? alpha('#fff', 0.05) : alpha('#000', 0.05),
      backgroundColor: 'background.default',
      backgroundImage: (theme: any) => theme.palette.mode === 'dark'
        ? 'linear-gradient(rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.01))'
        : 'linear-gradient(rgba(0, 0, 0, 0.01), rgba(0, 0, 0, 0.005))',
    },
  },
  content: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  },
  toolbar: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    py: 4,
    gap: 2,
    background: (theme: any) => `linear-gradient(to bottom, ${alpha(theme.palette.primary.main, 0.05)}, transparent)`,
  },
  logoContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 1.5,
  },
  avatar: {
    width: 64,
    height: 64,
    border: (theme: any) => `2px solid ${theme.palette.primary.main}`,
    boxShadow: (theme: any) => `0 0 20px ${alpha(theme.palette.primary.main, 0.3)}`,
    mb: 1,
    cursor: 'pointer',
    transition: 'transform 0.3s ease',
    '&:hover': {
      transform: 'scale(1.05)',
    }
  },
  userName: {
    fontWeight: 800,
    letterSpacing: '0.5px',
    color: 'text.primary',
    mb: 0.5,
  },
  roleChip: {
    fontSize: '0.65rem',
    fontWeight: 800,
    height: 20,
    borderRadius: 1,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    bgcolor: (theme: any) => alpha(theme.palette.primary.main, 0.1),
    color: 'primary.main',
    border: (theme: any) => `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  },
  list: {
    px: 2,
    pt: 2,
    flexGrow: 1,
    overflowY: 'auto',
    scrollbarWidth: 'thin',
    '&::-webkit-scrollbar': { width: 4 },
    '&::-webkit-scrollbar-thumb': {
      borderRadius: 10,
      backgroundColor: (theme: any) => alpha(theme.palette.primary.main, 0.2),
    },
  },
  listItem: {
    mb: 1,
    px: 0,
  },
  navLink: {
    borderRadius: '12px',
    py: 1.2,
    px: 2,
    color: 'text.secondary',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    '& .MuiListItemIcon-root': {
      minWidth: 38,
      color: 'inherit',
      transition: 'all 0.3s',
    },
    '& .MuiListItemText-primary': {
      fontWeight: 600,
      fontSize: '0.9rem',
      letterSpacing: '0.3px',
    },
    '&.active': {
      color: 'primary.main',
      bgcolor: (theme: any) => alpha(theme.palette.primary.main, 0.08),
      '&::before': {
        content: '""',
        position: 'absolute',
        left: 0,
        top: '20%',
        bottom: '20%',
        width: 3,
        bgcolor: 'primary.main',
        borderRadius: '0 4px 4px 0',
      },
      '& .MuiListItemIcon-root': {
        color: 'primary.main',
        transform: 'scale(1.1)',
      },
    },
    '&:hover:not(.active)': {
      bgcolor: (theme: any) => alpha(theme.palette.primary.main, 0.04),
      color: 'text.primary',
      transform: 'translateX(4px)',
      '& .MuiListItemIcon-root': {
        color: 'primary.main',
      },
    },
  },
  footer: {
    p: 3,
    borderTop: '1px solid',
    borderColor: 'divider',
    background: (theme: any) => alpha(theme.palette.background.paper, 0.5),
  },
  version: {
    fontSize: '0.7rem',
    fontWeight: 700,
    color: 'text.disabled',
    letterSpacing: '1px',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  navContainer: (theme: any) => ({ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }),
  mobileDrawer: { display: { xs: 'block', sm: 'none' } },
  desktopDrawer: { display: { xs: 'none', sm: 'block' } }
};

export default function Sidebar({ mobileOpen, handleDrawerToggle }: SidebarProps) {
  const { user } = useAuth();
  const userRole = user?.role || 'MEMBER';

  const filteredItems = menuItems.filter(item => item.roles.includes(userRole));

  const drawerContent = (
    <Box sx={styles.content}>
      <Box sx={styles.toolbar}>
        <Box sx={styles.logoContainer}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Avatar
              src={user?.profileImage}
              sx={styles.avatar}
            >
              {user?.fullName?.charAt(0) || 'U'}
            </Avatar>
          </motion.div>

          <Box textAlign="center">
            <Typography variant="subtitle1" sx={styles.userName} noWrap>
              {user?.fullName || 'User'}
            </Typography>
            <Chip
              label={userRole.replace('_', ' ')}
              size="small"
              sx={styles.roleChip}
            />
          </Box>
        </Box>
      </Box>

      <List sx={styles.list}>
        {filteredItems.map((item, index) => (
          <motion.div
            key={item.text}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <ListItem disablePadding sx={styles.listItem}>
              <ListItemButton
                component={NavLink}
                to={item.path}
                onClick={() => mobileOpen && handleDrawerToggle()}
                sx={styles.navLink}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          </motion.div>
        ))}
      </List>

      <Box sx={styles.footer}>
        <Typography sx={styles.version}>
          Fitness Platform v1.0.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box component="nav" sx={styles.navContainer}>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          ...styles.mobileDrawer,
          ...styles.drawer,
        }}
      >
        {drawerContent}
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          ...styles.desktopDrawer,
          ...styles.drawer,
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, alpha } from '@mui/material';
import type { Theme } from '@mui/material';
import { NavLink } from 'react-router-dom';
import React from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PeopleIcon from '@mui/icons-material/People';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Logo } from '../common/Logo';
import { useNavigate } from 'react-router-dom';

export const drawerWidth = 280;

interface SidebarProps {
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
}

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  roles?: string[];
}

const menuItems: MenuItem[] = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Schedule', icon: <CalendarMonthIcon />, path: '/schedule' },
  { text: 'My Bookings', icon: <BookmarkIcon />, path: '/bookings' },
  { text: 'Workouts', icon: <FitnessCenterIcon />, path: '/workouts' },
  { text: 'Workout Templates', icon: <NoteAddIcon />, path: '/workouts/templates', roles: ['STUDIO_ADMIN', 'INSTRUCTOR'] },
  { text: 'Progress', icon: <TrendingUpIcon />, path: '/progress' },
  { text: 'Membership', icon: <CardMembershipIcon />, path: '/membership' },
  { text: 'My Profile', icon: <AccountCircleIcon />, path: '/profile' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  { text: 'User Management', icon: <PeopleIcon />, path: '/admin/users', roles: ['STUDIO_ADMIN'] },
  { text: 'Financial Reports', icon: <AccountBalanceIcon />, path: '/admin/reconciliation', roles: ['STUDIO_ADMIN'] },
  { text: 'Check-In', icon: <QrCodeScannerIcon />, path: '/check-in', roles: ['STUDIO_ADMIN', 'INSTRUCTOR'] },
];

export default function Sidebar({ mobileOpen, handleDrawerToggle }: SidebarProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userRole = user?.role || 'MEMBER';

  const filteredItems = menuItems.filter(item => !item.roles || item.roles.includes(userRole));

  const drawerContent = (
    <Box sx={styles.content}>
      <Box
        onClick={() => {
          navigate('/');
          if (mobileOpen) handleDrawerToggle();
        }}
        sx={styles.logoWrapper}
      >
        <Logo size="small" />
      </Box>
      <Box sx={styles.listContainer}>
        <Typography variant="caption" sx={styles.sectionHeader}>
          Main Menu
        </Typography>
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
                  <ListItemIcon sx={styles.icon}>{item.icon}</ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{ sx: styles.listItemText }}
                  />
                </ListItemButton>
              </ListItem>
            </motion.div>
          ))}
        </List>
      </Box>

      <Box sx={styles.sidebarFooter}>
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

const styles = {
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    '& .MuiDrawer-paper': {
      width: drawerWidth,
      boxSizing: 'border-box',
      borderRight: '1px solid',
      borderColor: (theme: Theme) => theme.palette.mode === 'dark' ? alpha('#fff', 0.05) : alpha('#000', 0.05),
      backgroundColor: (theme: Theme) => theme.palette.mode === 'dark' ? '#06090F' : '#FDFDFD',
      backgroundImage: (theme: Theme) => theme.palette.mode === 'dark'
        ? 'linear-gradient(rgba(255, 255, 255, 0.01), rgba(255, 255, 255, 0))'
        : 'none',
    },
  },
  content: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  logoWrapper: {
    height: 70, // Match AppBar height
    display: 'flex',
    alignItems: 'center',
    px: 3,
    cursor: 'pointer',
    borderBottom: '1px solid',
    borderColor: (theme: Theme) => theme.palette.mode === 'dark' ? alpha('#fff', 0.05) : alpha('#000', 0.05),
    transition: 'background-color 0.2s',
    '&:hover': {
      bgcolor: (theme: Theme) => alpha(theme.palette.primary.main, 0.02),
    }
  },
  listContainer: {
    flexGrow: 1,
    overflowY: 'auto',
    px: 2,
    pt: 3,
    scrollbarWidth: 'thin',
    '&::-webkit-scrollbar': { width: 4 },
    '&::-webkit-scrollbar-thumb': {
      borderRadius: 10,
      backgroundColor: (theme: Theme) => alpha(theme.palette.primary.main, 0.2),
    },
  },
  list: {
    p: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 0.5,
  },
  sectionHeader: {
    px: 2,
    mb: 2,
    display: 'block',
    fontWeight: 800,
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    color: 'text.disabled',
    fontSize: '0.65rem',
  },
  listItem: {
    px: 0,
  },
  navLink: {
    borderRadius: (theme: Theme) => theme.shape.borderRadius,
    py: 1.5,
    px: 2,
    color: 'text.secondary',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    '&.active': {
      color: 'primary.main',
      background: (theme: Theme) => theme.palette.mode === 'dark'
        ? `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, transparent 100%)`
        : `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, transparent 100%)`,
      boxShadow: (theme: Theme) => `inset 4px 0 0 ${theme.palette.primary.main}`,
      '&::after': {
        content: '""',
        position: 'absolute',
        left: 0,
        top: '20%',
        bottom: '20%',
        width: '4px',
        bgcolor: 'primary.main',
        boxShadow: (theme: Theme) => `0 0 15px ${alpha(theme.palette.primary.main, 0.6)}`,
        borderRadius: '0 4px 4px 0',
      },
      '& .MuiListItemIcon-root': {
        color: 'primary.main',
        transform: 'scale(1.1)',
      },
      '& .MuiListItemText-primary': {
        color: 'text.primary',
        fontWeight: 700,
      },
    },
    '&:hover:not(.active)': {
      bgcolor: (theme: Theme) => alpha(theme.palette.primary.main, 0.05),
      color: 'text.primary',
      transform: 'translateX(4px)',
      '& .MuiListItemIcon-root': {
        color: 'primary.main',
      },
    },
  },
  icon: {
    minWidth: 40,
    color: 'inherit',
    transition: 'all 0.3s ease',
    '& svg': {
      fontSize: '1.3rem',
    },
  },
  listItemText: {
    fontWeight: 600,
    fontSize: '0.925rem',
    letterSpacing: '0.2px',
    transition: 'all 0.3s ease',
  },
  sidebarFooter: {
    p: 3,
    mt: 'auto',
    borderTop: '1px solid',
    borderColor: (theme: Theme) => theme.palette.mode === 'dark' ? alpha('#fff', 0.05) : alpha('#000', 0.05),
    background: (theme: Theme) => alpha(theme.palette.background.paper, 0.3),
  },
  version: {
    fontSize: '0.7rem',
    fontWeight: 700,
    color: 'text.disabled',
    letterSpacing: '1px',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  navContainer: () => ({ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }),
  mobileDrawer: { display: { xs: 'block', sm: 'none' } },
  desktopDrawer: { display: { xs: 'none', sm: 'block' } }
};
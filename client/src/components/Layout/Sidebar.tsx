import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Divider, Avatar, Typography } from '@mui/material';
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
import BookOnlineIcon from '@mui/icons-material/BookOnline'; // For Bookings
import AccountCircleIcon from '@mui/icons-material/AccountCircle'; // For Profile
import NoteAddIcon from '@mui/icons-material/NoteAdd'; // For Templates
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 260;

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
  // Common
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', roles: ['STUDIO_ADMIN', 'INSTRUCTOR', 'MEMBER'] },

  // Admin Specific
  { text: 'User Management', icon: <PeopleIcon />, path: '/admin/users', roles: ['STUDIO_ADMIN'] },
  { text: 'Scan & Check-In', icon: <QrCodeScannerIcon />, path: '/check-in', roles: ['STUDIO_ADMIN', 'INSTRUCTOR'] },

  // Member Specific
  { text: 'Class Schedule', icon: <CalendarMonthIcon />, path: '/schedule', roles: ['MEMBER', 'INSTRUCTOR', 'STUDIO_ADMIN'] },
  { text: 'My Bookings', icon: <BookOnlineIcon />, path: '/bookings', roles: ['MEMBER'] },
  { text: 'My Workouts', icon: <FitnessCenterIcon />, path: '/workouts', roles: ['MEMBER'] },
  { text: 'Workout Templates', icon: <NoteAddIcon />, path: '/workouts/templates', roles: ['STUDIO_ADMIN', 'INSTRUCTOR'] },
  { text: 'Progress', icon: <AssessmentIcon />, path: '/progress', roles: ['MEMBER'] },
  { text: 'Membership', icon: <CardMembershipIcon />, path: '/membership', roles: ['MEMBER'] },

  // Bottom / Common
  { text: 'My Profile', icon: <AccountCircleIcon />, path: '/profile', roles: ['STUDIO_ADMIN', 'INSTRUCTOR', 'MEMBER'] },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings', roles: ['STUDIO_ADMIN', 'INSTRUCTOR', 'MEMBER'] },
];

export default function Sidebar({ mobileOpen, handleDrawerToggle }: SidebarProps) {
  const { user } = useAuth();
  const userRole = user?.role || 'MEMBER';

  const filteredItems = menuItems.filter(item => item.roles.includes(userRole));

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
        {/* Placeholder for Logo if needed, currently just spacer or user info */}
        <Box display="flex" alignItems="center" gap={1.5}>
          <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
            {user?.fullName?.charAt(0) || 'U'}
          </Avatar>
          <Typography variant="subtitle1" fontWeight={700} noWrap sx={{ maxWidth: 140 }}>
            {user?.fullName || 'User'}
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List sx={{ px: 2, pt: 2, flexGrow: 1 }}>
        {filteredItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              component={NavLink}
              to={item.path}
              onClick={() => mobileOpen && handleDrawerToggle()} // Close drawer on mobile when clicking
              sx={{
                borderRadius: 2,
                py: 1.5,
                color: 'text.secondary',
                transition: 'all 0.2s',
                '&.active': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  boxShadow: 3,
                  '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                },
                '&:hover:not(.active)': {
                  bgcolor: 'action.hover',
                  color: 'primary.main',
                  '& .MuiListItemIcon-root': { color: 'primary.main' },
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{ fontWeight: 600, fontSize: '0.95rem' }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box p={2}>
        <Typography variant="caption" color="text.disabled" align="center" display="block">
          v1.0.0 • © 2026
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid rgba(0,0,0,0.08)' },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}
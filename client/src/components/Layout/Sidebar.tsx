import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
import { NavLink } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'; // For Classes
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'; // For Schedule
import AssessmentIcon from '@mui/icons-material/Assessment'; // For Progress

const drawerWidth = 240;

interface SidebarProps {
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
}

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Class Schedule', icon: <CalendarMonthIcon />, path: '/schedule' },
  { text: 'My Workouts', icon: <FitnessCenterIcon />, path: '/workouts' },
  { text: 'Progress', icon: <AssessmentIcon />, path: '/progress' },
];

export default function Sidebar({ mobileOpen, handleDrawerToggle }: SidebarProps) {
  const drawerContent = (
    <div>
      <Toolbar /> {/* Spacer to push content below TopBar */}
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            {/* STRICT TYPE: Using 'component={NavLink}' requires strict props */}
            <ListItemButton 
              component={NavLink} 
              to={item.path}
              sx={{
                '&.active': {
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                  '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
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
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}
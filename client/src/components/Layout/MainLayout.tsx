import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CssBaseline, AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Sidebar from './Sidebar';

const drawerWidth = 280;

const styles = {
  root: {
    display: 'flex',
  },
  appBar: {
    width: { sm: `calc(100% - ${drawerWidth}px)` },
    ml: { sm: `${drawerWidth}px` },
  },
  menuButton: {
    mr: 2,
    display: { sm: 'none' },
  },
  sidebar: {
    width: { sm: drawerWidth },
    flexShrink: { sm: 0 },
  },
  mainContent: {
    flexGrow: 1,
    p: 3,
    width: { sm: `calc(100% - ${drawerWidth}px)` },
    minHeight: '100vh',
    bgcolor: 'background.default',
  },
  typography: { fontWeight: 600 }
};

export default function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={styles.root}>
      <CssBaseline />

      {/* Top App Bar */}
      <AppBar
        position="fixed"
        sx={styles.appBar}
      >
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
          <Typography variant="h6" noWrap component="div" sx={styles.typography}>
            Fitness Studio
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />

      {/* Main Content Area */}
      <Box
        component="main"
        sx={styles.mainContent}
      >
        <Toolbar /> {/* Spacer for AppBar */}

        {/* React Router Outlet - This is where your page content renders */}
        <Outlet />
      </Box>
    </Box>
  );
}
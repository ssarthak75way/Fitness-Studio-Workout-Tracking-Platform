import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import Sidebar from './Sidebar';
import Footer from '../Footer';

const drawerWidth = 280;

export default function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <CssBaseline />


      <Box sx={{ display: 'flex', flex: 1 }}>
        {/* Sidebar Navigation */}
        <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />

        {/* Main Content Area */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            bgcolor: 'background.default',
            minHeight: '100vh',
            overflow: 'hidden',
          }}
        >
          <Toolbar /> {/* Spacer for Navbar */}
          <Box sx={styles.contentArea}>
            <Outlet />
          </Box>
          <Footer />
        </Box>
      </Box>
    </Box>
  );
}

const styles = {
  contentArea: {
    flex: 1,
    p: { xs: 2, sm: 4, md: 6 },
    bgcolor: 'background.default',
    transition: 'all 0.3s ease',
  }
};
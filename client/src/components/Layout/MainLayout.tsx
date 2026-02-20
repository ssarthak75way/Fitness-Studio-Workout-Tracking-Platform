import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CssBaseline, Toolbar, Button, Typography } from '@mui/material';
import Sidebar from './Sidebar';
import Footer from '../Footer';
import { useAuth } from '../../context/AuthContext';
import WarningIcon from '@mui/icons-material/Warning';

const drawerWidth = 280;

export default function MainLayout() {
  const { isImpersonating, stopImpersonation, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={styles.root}>
      <CssBaseline />

      {isImpersonating && (
        <Box sx={styles.impersonationBanner}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <WarningIcon sx={{ color: '#ed6c02', fontSize: '1.2rem' }} />
            <Typography variant="subtitle2" fontWeight={900} sx={{ letterSpacing: '1.5px', color: '#fff' }}>
              IMPERSONATION ACTIVE: <Box component="span" sx={{ color: '#ed6c02' }}>{user?.fullName?.toUpperCase()}</Box>
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="small"
            onClick={stopImpersonation}
            sx={styles.stopButton}
          >
            TERMINATE SESSION
          </Button>
        </Box>
      )}

      <Box sx={styles.layoutWrapper}>
        {/* Sidebar Navigation */}
        <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />

        {/* Main Content Area */}
        <Box
          component="main"
          sx={styles.mainContent}
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
  root: {
    display: 'flex',
    minHeight: '100vh',
    flexDirection: 'column'
  },
  layoutWrapper: {
    display: 'flex',
    flex: 1
  },
  mainContent: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    width: { sm: `calc(100% - ${drawerWidth}px)` },
    bgcolor: 'background.default',
    minHeight: '100vh',
    overflow: 'hidden',
  },
  contentArea: {
    flex: 1,
    p: { xs: 2, sm: 4, md: 6 },
    bgcolor: 'background.default',
    transition: 'all 0.3s ease',
  },
  impersonationBanner: {
    bgcolor: '#0f172a',
    py: 1.5,
    px: { xs: 2, md: 4 },
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2px solid #ed6c02',
    position: 'sticky',
    top: 0,
    zIndex: 2000,
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
  },
  stopButton: {
    bgcolor: '#ed6c02',
    color: '#fff',
    fontWeight: 900,
    borderRadius: 0,
    px: 3,
    fontSize: '0.7rem',
    letterSpacing: '1px',
    '&:hover': {
      bgcolor: '#ff9800',
    }
  }
};
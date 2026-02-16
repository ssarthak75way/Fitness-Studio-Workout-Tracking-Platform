import { createTheme, alpha, type PaletteMode } from '@mui/material/styles';

const primaryMain = '#6366f1'; // Indigo
const secondaryMain = '#f43f5e'; // Rose

// Dark Mode Colors
const darkBackground = '#0f172a'; // Deep Slate
const darkSurface = '#1e293b';
const darkTextPrimary = '#f1f5f9';
const darkTextSecondary = '#94a3b8';

// Light Mode Colors
const lightBackground = '#f8fafc'; // Slate 50
const lightSurface = '#ffffff';
const lightTextPrimary = '#1e293b'; // Slate 800
const lightTextSecondary = '#64748b'; // Slate 500

export const getTheme = (mode: PaletteMode) => createTheme({
  palette: {
    mode,
    primary: {
      main: primaryMain,
      light: alpha(primaryMain, 0.5),
      dark: '#4f46e5',
      contrastText: '#ffffff',
    },
    secondary: {
      main: secondaryMain,
      light: alpha(secondaryMain, 0.5),
      dark: '#e11d48',
      contrastText: '#ffffff',
    },
    background: {
      default: mode === 'dark' ? darkBackground : lightBackground,
      paper: mode === 'dark' ? darkSurface : lightSurface,
    },
    text: {
      primary: mode === 'dark' ? darkTextPrimary : lightTextPrimary,
      secondary: mode === 'dark' ? darkTextSecondary : lightTextSecondary,
    },
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "system-ui", sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: mode === 'dark' ? '#6b7280 #1e293b' : '#94a3b8 #f1f5f9',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 8,
            backgroundColor: mode === 'dark' ? '#334155' : '#cbd5e1',
            minHeight: 24,
            border: `2px solid ${mode === 'dark' ? darkBackground : lightBackground}`,
          },
          '&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus': {
            backgroundColor: mode === 'dark' ? '#475569' : '#94a3b8',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '10px 24px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 4px 20px 0 ${alpha(primaryMain, 0.4)}`,
          },
        },
        containedPrimary: {
          background: `linear-gradient(45deg, ${primaryMain} 30%, #818cf8 90%)`,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: mode === 'dark' ? alpha(darkSurface, 0.4) : alpha(lightSurface, 0.8),
          backdropFilter: 'blur(12px)',
          border: `1px solid ${mode === 'dark' ? alpha('#ffffff', 0.1) : alpha('#000000', 0.05)}`,
          boxShadow: mode === 'dark'
            ? '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
            : '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        gutterBottom: {
          marginBottom: '0.75rem',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'dark' ? alpha(darkSurface, 0.8) : alpha(lightSurface, 0.8),
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${mode === 'dark' ? alpha('#ffffff', 0.1) : alpha('#000000', 0.05)}`,
          color: mode === 'dark' ? darkTextPrimary : lightTextPrimary,
          boxShadow: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: mode === 'dark' ? darkSurface : lightSurface,
          borderRight: `1px solid ${mode === 'dark' ? alpha('#ffffff', 0.1) : alpha('#000000', 0.05)}`,
        },
      },
    },
  },
});
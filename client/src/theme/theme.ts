import { createTheme, alpha, type PaletteMode } from '@mui/material/styles';

const primaryMain = '#FF5722'; // Vibrant Orange
const secondaryMain = '#FF9100'; // Amber/Orange

// Dark Mode Colors
const darkBackground = '#0B0F19'; // Deepest Blue/Black
const darkSurface = '#111827'; // Dark Gray/Blue
const darkTextPrimary = '#FFFFFF';
const darkTextSecondary = '#9CA3AF'; // Gray 400

// Light Mode Colors
const lightBackground = '#F3F4F6'; // Gray 100
const lightSurface = '#FFFFFF';
const lightTextPrimary = '#111827'; // Gray 900
const lightTextSecondary = '#4B5563'; // Gray 600

export const getTheme = (mode: PaletteMode) => createTheme({
  palette: {
    mode,
    primary: {
      main: primaryMain,
      light: '#FF8A50',
      dark: '#C41C00',
      contrastText: '#ffffff',
    },
    secondary: {
      main: secondaryMain,
      light: '#FFC246',
      dark: '#C56200',
      contrastText: '#000000',
    },
    background: {
      default: mode === 'dark' ? darkBackground : lightBackground,
      paper: mode === 'dark' ? darkSurface : lightSurface,
    },
    text: {
      primary: mode === 'dark' ? darkTextPrimary : lightTextPrimary,
      secondary: mode === 'dark' ? darkTextSecondary : lightTextSecondary,
    },
    action: {
      active: mode === 'dark' ? '#FF5722' : '#FF5722', // Make icons orange
      hover: mode === 'dark' ? alpha('#FF5722', 0.1) : alpha('#FF5722', 0.05),
    }
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "system-ui", sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.02em', textTransform: 'uppercase' },
    h2: { fontWeight: 700, letterSpacing: '-0.01em', textTransform: 'uppercase' },
    h3: { fontWeight: 700, letterSpacing: '-0.01em' },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' },
  },
  shape: {
    borderRadius: 0, // Sharper, more premium/technical feel, or keeping rounded? Image shows varied. Let's go with slightly rounded.
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: mode === 'dark' ? '#FF5722 #0B0F19' : '#FF5722 #F3F4F6',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            width: '6px',
            height: '6px',
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 3,
            backgroundColor: primaryMain,
            minHeight: 24,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '4px', // Slightly squared for stronger look
          padding: '10px 24px',
          transition: 'all 0.3s ease',
          boxShadow: 'none',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 8px 20px -4px ${alpha(primaryMain, 0.5)}`,
          },
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${primaryMain} 0%, #FF8A50 100%)`,
          color: '#ffffff',
          '&:hover': {
            background: `linear-gradient(135deg, #E64A19 0%, #FF5722 100%)`,
          }
        },
        outlinedPrimary: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
            backgroundColor: alpha(primaryMain, 0.1),
          }
        }
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: mode === 'dark' ? alpha(darkSurface, 0.6) : alpha(lightSurface, 0.8),
          backdropFilter: 'blur(16px)',
          border: `1px solid ${mode === 'dark' ? alpha('#FF5722', 0.1) : alpha('#000000', 0.05)}`,
          borderRadius: '16px',
          boxShadow: mode === 'dark'
            ? '0 8px 32px 0 rgba(0, 0, 0, 0.3)'
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
          backgroundColor: mode === 'dark' ? alpha(darkBackground, 0.8) : alpha(lightBackground, 0.9),
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${mode === 'dark' ? alpha('#ffffff', 0.05) : alpha('#000000', 0.05)}`,
          color: mode === 'dark' ? darkTextPrimary : lightTextPrimary,
          boxShadow: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: mode === 'dark' ? darkBackground : lightSurface, // Match background for seamless look
          borderRight: `1px solid ${mode === 'dark' ? alpha('#ffffff', 0.05) : alpha('#000000', 0.05)}`,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: '4px',
        },
        colorSuccess: {
          backgroundColor: alpha('#00E676', 0.1),
          color: '#00E676',
          border: '1px solid ' + alpha('#00E676', 0.2),
        },
        colorError: {
          backgroundColor: alpha('#FF1744', 0.1),
          color: '#FF1744',
          border: '1px solid ' + alpha('#FF1744', 0.2),
        },
        colorWarning: {
          backgroundColor: alpha('#FF9100', 0.1),
          color: '#FF9100',
          border: '1px solid ' + alpha('#FF9100', 0.2),
        },
        colorPrimary: {
          backgroundColor: alpha(primaryMain, 0.1),
          color: primaryMain,
          border: '1px solid ' + alpha(primaryMain, 0.2),
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${mode === 'dark' ? alpha('#ffffff', 0.05) : alpha('#000000', 0.05)}`,
        },
        head: {
          fontWeight: 700,
          textTransform: 'uppercase',
          fontSize: '0.75rem',
          color: mode === 'dark' ? alpha('#ffffff', 0.6) : alpha('#000000', 0.6),
          backgroundColor: mode === 'dark' ? alpha(darkSurface, 0.5) : alpha(lightSurface, 0.5),
        }
      }
    }
  },
});
import { createTheme, alpha } from '@mui/material/styles';
import type { PaletteMode, Shadows } from '@mui/material';

declare module '@mui/material/styles' {
  interface Theme {
    custom: {
      glass: React.CSSProperties;
    };
  }
  interface ThemeOptions {
    custom?: {
      glass?: React.CSSProperties;
    };
  }
}

const primaryMain = '#FF4D17'; // Elite Orange
const secondaryMain = '#0A0E17'; // Deep Space Navy

// Dark Mode Colors
const darkBackground = '#06090F'; // True Cinematic Dark
const darkSurface = '#0A0E17';
const darkTextPrimary = '#FFFFFF';
const darkTextSecondary = '#8E95A2';

// Light Mode Colors
const lightBackground = '#FDFDFD';
const lightSurface = '#FFFFFF';
const lightTextPrimary = '#0A0E17';
const lightTextSecondary = '#5E6776';

export const getTheme = (mode: PaletteMode) => createTheme({
  palette: {
    mode,
    primary: {
      main: primaryMain,
      light: '#FF754D',
      dark: '#D93A0D',
      contrastText: '#ffffff',
    },
    secondary: {
      main: secondaryMain,
      light: '#1A212E',
      dark: '#05070B',
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
    action: {
      active: primaryMain,
      hover: alpha(primaryMain, 0.08),
    }
  },
  typography: {
    fontFamily: '"Outfit", "Inter", sans-serif',
    h1: { fontWeight: 900, letterSpacing: '-0.04em', fontFamily: '"Outfit", sans-serif' },
    h2: { fontWeight: 900, letterSpacing: '-0.03em', fontFamily: '"Outfit", sans-serif' },
    h3: { fontWeight: 800, letterSpacing: '-0.02em', fontFamily: '"Outfit", sans-serif' },
    h4: { fontWeight: 800, fontFamily: '"Outfit", sans-serif' },
    h5: { fontWeight: 800, fontFamily: '"Outfit", sans-serif' },
    h6: { fontWeight: 800, fontFamily: '"Outfit", sans-serif' },
    button: { fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem' },
    body1: { fontSize: '1rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.6 },
  },
  shape: {
    borderRadius: 1,
  },
  custom: {
    glass: {
      backdropFilter: 'blur(16px) saturate(180%)',
      backgroundColor: 'rgba(17, 24, 39, 0.75)',
      border: '1px solid rgba(255, 255, 255, 0.125)',
    }
  },
  shadows: [
    'none',
    '0 2px 4px 0 rgba(0,0,0,0.05)',
    '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
    '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
    '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
    '0 25px 50px -12px rgba(0,0,0,0.25)',
    ...Array(19).fill('none') // Fill remaining shadows
  ] as Shadows,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: `${primaryMain} transparent`,
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            width: '6px',
            height: '6px',
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 3,
            backgroundColor: primaryMain,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '12px 28px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        },
        containedPrimary: {
          boxShadow: `0 8px 16px -4px ${alpha(primaryMain, 0.4)}`,
          '&:hover': {
            boxShadow: `0 12px 24px -6px ${alpha(primaryMain, 0.5)}`,
          }
        },
        outlinedPrimary: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
          }
        }
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: `1px solid ${mode === 'dark' ? alpha('#ffffff', 0.05) : alpha('#000000', 0.05)}`,
          boxShadow: mode === 'dark' ? '0 10px 30px -10px rgba(0,0,0,0.4)' : '0 10px 30px -10px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: mode === 'dark' ? '0 20px 40px -15px rgba(0,0,0,0.6)' : '0 20px 40px -15px rgba(0,0,0,0.2)',
          }
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'dark' ? alpha(darkBackground, 0.7) : alpha('#ffffff', 0.8),
          backdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${mode === 'dark' ? alpha('#ffffff', 0.08) : alpha('#000000', 0.08)}`,
          boxShadow: 'none',
        },
      },
    },
  },
});
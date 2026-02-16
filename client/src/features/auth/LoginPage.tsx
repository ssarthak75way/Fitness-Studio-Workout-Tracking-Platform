import { useState } from 'react';
import {
  Box, TextField, Button, Typography,
  Alert, MenuItem, Fade, InputAdornment, IconButton,
  useTheme, useMediaQuery
} from '@mui/material';
import type { Theme } from '@mui/material';
import {
  Email as EmailIcon, Lock as LockIcon,
  Visibility, VisibilityOff, AccountCircle as UserIcon,
  FitnessCenter as LogoIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/auth.service';

const BACKGROUND_IMAGE = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop';

const fieldStyle = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    bgcolor: 'white',
    '& fieldset': { borderColor: '#e2e8f0' },
    '&:hover fieldset': { borderColor: '#cbd5e1' },
    '&.Mui-focused fieldset': { borderWeight: 2 },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 500,
  }
};

export default function LoginPage() {
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        const response = await authService.register({ email, password, fullName, role });
        if (response.token) {
          login(response.token, response.data.user);
        }
      } else {
        const response = await authService.login(email, password);
        if (response.token) {
          login(response.token, response.data.user);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Left Side: Visual Backdrop */}
      <Box
        sx={{
          flex: { xs: 0, sm: 4, md: 7 },
          backgroundImage: `url(${BACKGROUND_IMAGE})`,
          backgroundRepeat: 'no-repeat',
          backgroundColor: (t: Theme) =>
            t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          display: isMobile ? 'none' : 'block',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(2px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            p: 8,
            color: 'white',
          }}
        >
          <Fade in timeout={1000}>
            <Box>
              <Box display="flex" alignItems="center" gap={2} mb={4}>
                <LogoIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />
                <Typography variant="h3" fontWeight="900" letterSpacing="-0.02em">
                  FITNESS STUDIO
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ opacity: 0.9, maxWidth: 500, lineHeight: 1.6 }}>
                Step into a world of strength, endurance, and transformation.
                Your journey to a better you starts here.
              </Typography>
            </Box>
          </Fade>
        </Box>
      </Box>

      {/* Right Side: Login Form */}
      <Box
        sx={{
          flex: { xs: 12, sm: 8, md: 5 },
          display: 'flex',
          alignItems: 'center',
          bgcolor: '#f8fafc',
          width: '100%'
        }}
      >
        <Fade in timeout={800}>
          <Box
            sx={{
              p: { xs: 4, sm: 8 },
              width: '100%',
              maxWidth: 500,
              mx: 'auto',
            }}
          >
            <Box mb={4} display={isMobile ? 'block' : 'none'}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <LogoIcon color="primary" sx={{ fontSize: 32 }} />
                <Typography variant="h5" fontWeight="900" color="text.primary">
                  FITNESS STUDIO
                </Typography>
              </Box>
            </Box>

            <Typography variant="h4" fontWeight="800" gutterBottom>
              {isRegister ? 'Begin Your Journey' : 'Welcome Back'}
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={4}>
              {isRegister
                ? 'Join our community and start reaching your goals today.'
                : 'Enter your credentials to access your fitness dashboard.'}
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              {isRegister && (
                <TextField
                  fullWidth
                  label="Full Name"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  margin="normal"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <UserIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldStyle}
                />
              )}

              <TextField
                fullWidth
                label="Email Address"
                placeholder="email@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={fieldStyle}
              />

              <TextField
                fullWidth
                label="Password"
                placeholder="min 6 characters"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={fieldStyle}
              />

              {isRegister && (
                <TextField
                  fullWidth
                  select
                  label="Join As"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  margin="normal"
                  sx={fieldStyle}
                >
                  <MenuItem value="MEMBER">Member</MenuItem>
                  <MenuItem value="INSTRUCTOR">Instructor</MenuItem>
                  <MenuItem value="STUDIO_ADMIN">Studio Admin</MenuItem>
                </TextField>
              )}

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  mt: 4,
                  mb: 2,
                  py: 1.8,
                  borderRadius: 2,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: '0 8px 16px -4px rgba(99, 102, 241, 0.4)',
                  '&:hover': {
                    boxShadow: '0 12px 20px -4px rgba(99, 102, 241, 0.5)',
                  }
                }}
              >
                {loading ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In'}
              </Button>

              <Box mt={2} textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <Button
                    onClick={() => setIsRegister(!isRegister)}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 700,
                      ml: 0.5,
                      '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
                    }}
                    color="primary"
                    disableRipple
                  >
                    {isRegister ? 'Login here' : 'Register now'}
                  </Button>
                </Typography>
              </Box>
            </form>
          </Box>
        </Fade>
      </Box>
    </Box>
  );
}
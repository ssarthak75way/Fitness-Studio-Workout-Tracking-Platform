import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, TextField, Button, Typography,
  MenuItem, Fade, InputAdornment, IconButton,
  useTheme, useMediaQuery, alpha
} from '@mui/material';
import type { Theme } from '@mui/material';
import {
  Email as EmailIcon, Lock as LockIcon,
  Visibility, VisibilityOff, AccountCircle as UserIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/auth.service';
import { useToast } from '../../context/ToastContext';
import { Logo } from '../../components/common/Logo';

const BACKGROUND_IMAGE = '/auth-bg.jpg';

const fieldStyle = {
  '& .MuiOutlinedInput-root': {
    borderRadius: (theme: Theme) => theme.shape.borderRadius,
    bgcolor: 'background.paper',
    '& fieldset': { borderColor: (theme: Theme) => alpha(theme.palette.divider, 0.1) },
    '&:hover fieldset': { borderColor: (theme: Theme) => theme.palette.primary.main },
    '&.Mui-focused fieldset': { borderWidth: 2 },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 600,
  }
};

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
    bgcolor: 'background.default',
  },
  backdrop: (isMobile: boolean, bgImage: string) => ({
    flex: { xs: 0, sm: 4, md: 7 },
    backgroundImage: `linear-gradient(rgba(11, 15, 25, 0.4), rgba(11, 15, 25, 0.6)), url(${bgImage})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    display: isMobile ? 'none' : 'block',
  }),
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    p: 8,
    color: 'white',
  },
  logoIcon: (theme: Theme) => ({
    fontSize: 48,
    color: theme.palette.primary.main,
  }),
  tagline: {
    opacity: 0.9,
    maxWidth: 500,
    lineHeight: 1.6,
    fontWeight: 500,
  },
  formSide: {
    flex: { xs: 12, sm: 8, md: 5 },
    display: 'flex',
    alignItems: 'center',
    bgcolor: 'background.default',
    width: '100%',
    borderLeft: (theme: Theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  },
  formContent: {
    p: { xs: 4, sm: 8 },
    width: '100%',
    maxWidth: 500,
    mx: 'auto',
  },
  mobileLogo: {
    fontSize: 32,
  },
  alert: {
    mb: 3,
    borderRadius: (theme: Theme) => theme.shape.borderRadius,
  },
  loginHead: {
    fontWeight: 900,
    color: "text.primary",
    letterSpacing: '-1px',
    mb: 1,
  },
  loginButton: {
    mt: 4,
    mb: 2,
    py: 2,
    fontSize: '1.1rem',
    fontWeight: 800,
  },
  switchModeButton: {
    textTransform: 'none',
    fontWeight: 800,
    ml: 0.5,
    '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
  },
};

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        const response = await authService.register({ email, password, fullName, role });
        if (response.token) {
          login(response.token, response.data.user);
          navigate('/dashboard');
        }
      } else {
        const response = await authService.login(email, password);
        if (response.token) {
          login(response.token, response.data.user);
          navigate('/dashboard');
        }
      }
    } catch (err: unknown) {
      showToast((err as Error).message || 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={styles.container}>
      {/* Left Side: Visual Backdrop */}
      <Box sx={styles.backdrop(isMobile, BACKGROUND_IMAGE)}>
        <Box sx={styles.overlay}>
          <Fade in timeout={1000}>
            <Box>
              <Box display="flex" alignItems="center" gap={2} mb={4}>
                <Logo variant="white" size="large" />
              </Box>
              <Typography variant="h5" sx={styles.tagline}>
                Step into a world of strength, endurance, and transformation.
                Your journey to a better you starts here.
              </Typography>
            </Box>
          </Fade>
        </Box>
      </Box>

      {/* Right Side: Login Form */}
      <Box sx={styles.formSide}>
        <Fade in timeout={800}>
          <Box sx={styles.formContent}>
            <Box mb={4} display={isMobile ? 'block' : 'none'}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Logo size="medium" />
              </Box>
            </Box>

            <Typography style={styles.loginHead} variant="h4" fontWeight="800" gutterBottom>
              {isRegister ? 'Begin Your Journey' : 'Welcome Back'}
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={4}>
              {isRegister
                ? 'Join our community and start reaching your goals today.'
                : 'Enter your credentials to access your fitness dashboard.'}
            </Typography>


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
                sx={styles.loginButton}
              >
                {loading ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In'}
              </Button>

              <Box mt={2} textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <Button
                    onClick={() => setIsRegister(!isRegister)}
                    sx={styles.switchModeButton}
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
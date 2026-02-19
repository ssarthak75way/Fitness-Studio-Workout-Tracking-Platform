import { useState } from 'react';
import {
  Box, Typography, Paper, TextField, Button,
  Tabs, Tab, Switch, FormControlLabel, InputAdornment, IconButton,
  useTheme, alpha, Stack
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import PersonIcon from '@mui/icons-material/Person';
import SecurityIcon from '@mui/icons-material/Security';
import SettingsIcon from '@mui/icons-material/Settings';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import SaveIcon from '@mui/icons-material/Save';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import type { Theme } from '@mui/material/styles';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 }
  }
};

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      <AnimatePresence mode="wait">
        {value === index && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <Box sx={{ py: 4 }}>
              {children}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const styles = {
  pageContainer: {
    p: 0,
    bgcolor: 'background.default',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  headerHero: (theme: Theme) => ({
    pt: { xs: 10, md: 14 },
    pb: { xs: 8, md: 12 },
    px: { xs: 3, md: 6 },
    position: 'relative',
    backgroundImage: theme.palette.mode === 'dark'
      ? `linear-gradient(rgba(6, 9, 15, 0.8), rgba(6, 9, 15, 1)), url(https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop)`
      : `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.95)), url(https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: 4,
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&::before': {
      content: '"COMMAND"',
      position: 'absolute',
      top: '20%',
      left: '5%',
      fontSize: { xs: '5rem', md: '12rem' },
      fontWeight: 950,
      color: theme.palette.mode === 'dark' ? alpha('#fff', 0.02) : alpha('#000', 0.02),
      letterSpacing: '20px',
      zIndex: 0,
      pointerEvents: 'none',
      lineHeight: 0.8
    }
  }),
  headerTitle: (theme: Theme) => ({
    fontWeight: 950,
    fontSize: { xs: '3.5rem', md: '6rem' },
    lineHeight: 0.85,
    letterSpacing: '-4px',
    color: theme.palette.text.primary,
    textTransform: 'uppercase',
    mb: 2,
    position: 'relative',
    zIndex: 1,
    '& span': {
      color: theme.palette.primary.main,
      textShadow: theme.palette.mode === 'dark' ? `0 0 40px ${alpha(theme.palette.primary.main, 0.5)}` : 'none'
    }
  }),
  sectionLabel: {
    color: 'primary.main',
    fontWeight: 900,
    letterSpacing: '5px',
    mb: 4,
    display: 'block',
    textTransform: 'uppercase',
    fontSize: '0.7rem',
    opacity: 0.8
  },
  contentWrapper: {
    px: { xs: 3, md: 6 },
    py: { xs: 4, md: 8 },
    maxWidth: 1200,
    mx: 'auto',
    width: '100%',
    flexGrow: 1,
    position: 'relative',
    zIndex: 1
  },
  controlCard: (theme: Theme) => ({
    borderRadius: 2,
    background: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.4 : 0.8),
    backdropFilter: 'blur(24px) saturate(180%)',
    border: '1px solid',
    borderColor: theme.palette.divider,
    boxShadow: theme.palette.mode === 'dark'
      ? `inset 0 0 20px -10px ${alpha('#fff', 0.05)}, 0 20px 50px -20px rgba(0,0,0,0.5)`
      : `0 20px 50px -20px ${alpha(theme.palette.common.black, 0.1)}`,
    overflow: 'hidden'
  }),
  tabsContainer: (theme: Theme) => ({
    borderBottom: `1px solid ${theme.palette.divider}`,
    background: alpha(theme.palette.background.paper, 0.2),
    px: 2
  }),
  tabs: {
    '& .MuiTab-root': {
      textTransform: 'uppercase',
      fontWeight: 900,
      fontSize: '0.75rem',
      letterSpacing: '2px',
      minHeight: 70,
      color: 'text.secondary',
      transition: 'all 0.3s ease',
      '&.Mui-selected': {
        color: 'primary.main'
      }
    },
    '& .MuiTabs-indicator': {
      height: 4,
      borderRadius: '4px 4px 0 0',
      boxShadow: (theme: Theme) => `0 -4px 20px ${theme.palette.primary.main}`
    }
  },
  formTitle: {
    fontWeight: 900,
    letterSpacing: '2px',
    textTransform: 'uppercase',
    fontSize: '0.85rem',
    color: 'primary.main',
    mb: 4,
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    '&::after': {
      content: '""',
      flex: 1,
      height: '1px',
      bgcolor: 'divider'
    }
  },
  inputField: (theme: Theme) => ({
    '& .MuiOutlinedInput-root': {
      borderRadius: 0,
      bgcolor: alpha(theme.palette.text.primary, 0.02),
      '& fieldset': { borderColor: theme.palette.divider },
      '&:hover fieldset': { borderColor: 'primary.main' },
      '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: '1px' }
    },
    '& .MuiInputLabel-root': {
      fontWeight: 800,
      letterSpacing: '1px',
      textTransform: 'uppercase',
      fontSize: '0.7rem',
      color: 'text.secondary'
    }
  }),
  actionButton: {
    borderRadius: 0,
    fontWeight: 950,
    letterSpacing: '3px',
    py: 2,
    px: 6,
    textTransform: 'uppercase',
    transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
    color: 'primary.contrastText',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: (theme: Theme) => `0 10px 30px -5px ${alpha(theme.palette.primary.main, 0.5)}`
    }
  },
  preferenceCard: (theme: Theme) => ({
    borderRadius: 0,
    bgcolor: alpha(theme.palette.text.primary, 0.01),
    border: `1px solid ${theme.palette.divider}`,
    mb: 2,
    transition: 'all 0.3s ease',
    '&:hover': {
      bgcolor: alpha(theme.palette.text.primary, 0.03),
      borderColor: 'primary.main'
    }
  }),
  preferenceLabel: {
    width: '100%',
    m: 0,
    p: 2.5,
    '& .MuiTypography-root': { fontWeight: 900, color: 'text.primary', fontSize: '0.85rem', letterSpacing: '1px' }
  },
  identityGrid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
    gap: 4
  }
};

export default function SettingsPage() {
  const theme = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [tabValue, setTabValue] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const [profile, setProfile] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    bio: user?.bio || '',
    certifications: user?.certifications?.join(', ') || '',
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    darkMode: true,
    publicProfile: false,
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleUpdateProfile = async () => {
    try {
      const payload = {
        ...profile,
        certifications: profile.certifications.split(',').map((s: string) => s.trim()).filter(Boolean)
      };
      await api.patch('/users/profile', payload);
      showToast('Profile configuration updated', 'success');
    } catch (error: unknown) {
      showToast((error as Error)?.message || 'Update failed', 'error');
    }
  };

  const handleChangePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      showToast('Password mismatch detected', 'error');
      return;
    }

    try {
      await api.patch('/users/password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      showToast('Security protocols updated', 'success');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: unknown) {
      showToast((error as Error)?.message || 'Security update failed', 'error');
    }
  };

  return (
    <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible" sx={styles.pageContainer}>
      {/* Cinematic Hero */}
      <Box sx={styles.headerHero(theme)}>
        <Box>
          <Typography sx={styles.sectionLabel}>CORE OVERRIDES</Typography>
          <Typography variant="h1" sx={styles.headerTitle(theme)}>
            CORE <Box component="span">CONFIG</Box>
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 600, fontWeight: 400, lineHeight: 1.6 }}>
            Fine-tune your athlete experience. Adjust security protocols, identity data, and system preferences to optimize your studio performance.
          </Typography>
        </Box>
      </Box>

      <Box sx={styles.contentWrapper}>
        <motion.div variants={itemVariants}>
          <Paper sx={styles.controlCard(theme)}>
            <Box sx={styles.tabsContainer(theme)}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="fullWidth"
                sx={styles.tabs}
              >
                <Tab icon={<PersonIcon sx={{ fontSize: '1.2rem' }} />} iconPosition="start" label="Identity" />
                <Tab icon={<SecurityIcon sx={{ fontSize: '1.2rem' }} />} iconPosition="start" label="Security" />
                <Tab icon={<SettingsIcon sx={{ fontSize: '1.2rem' }} />} iconPosition="start" label="Preferences" />
              </Tabs>
            </Box>

            <Box sx={{ p: { xs: 3, md: 6 } }}>
              <CustomTabPanel value={tabValue} index={0}>
                <Typography sx={styles.formTitle}>
                  IDENTITY PARAMETERS
                </Typography>
                <Box sx={styles.identityGrid}>
                  <Box>
                    <TextField
                      fullWidth
                      label="DESIGNATION NAME"
                      value={profile.fullName}
                      onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                      sx={styles.inputField(theme)}
                    />
                  </Box>
                  <Box>
                    <TextField
                      fullWidth
                      label="COMM CHANNEL (EMAIL)"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      sx={styles.inputField(theme)}
                    />
                  </Box>
                  <Box sx={{ gridColumn: 'span 2' }}>
                    <TextField
                      fullWidth
                      label="CLEARANCE LEVEL"
                      value={user?.role}
                      disabled
                      variant="outlined"
                      sx={{
                        ...styles.inputField(theme),
                        '& .MuiOutlinedInput-root': { bgcolor: alpha(theme.palette.text.primary, 0.01), opacity: 0.6 }
                      }}
                    />
                    <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary', fontWeight: 700, letterSpacing: '1px', opacity: 0.5 }}>
                      * CLEARANCE LEVEL IS FIXED. CONTACT COMMAND OVERRIDE FOR ASSISTANCE.
                    </Typography>
                  </Box>

                  {user?.role === 'INSTRUCTOR' && (
                    <>
                      <Box sx={{ gridColumn: 'span 2' }}>
                        <TextField
                          fullWidth
                          label="MISSION OBJECTIVES (BIO)"
                          multiline
                          rows={4}
                          value={profile.bio}
                          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                          placeholder="LOG MISSION OBJECTIVES..."
                          sx={styles.inputField(theme)}
                        />
                      </Box>
                      <Box sx={{ gridColumn: 'span 2' }}>
                        <TextField
                          fullWidth
                          label="VERIFIED CREDENTIALS"
                          value={profile.certifications}
                          onChange={(e) => setProfile({ ...profile, certifications: e.target.value })}
                          placeholder="e.g., NASM, CROSSFIT LEVEL 2..."
                          helperText="USE COMMAS FOR MULTIPLE ENTRIES"
                          sx={styles.inputField(theme)}
                        />
                      </Box>
                    </>
                  )}

                  <Box sx={{ gridColumn: 'span 2' }}>
                    <Box display="flex" justifyContent="flex-end" mt={2}>
                      <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleUpdateProfile}
                        sx={styles.actionButton}
                      >
                        COMMIT PARAMETERS
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </CustomTabPanel>

              <CustomTabPanel value={tabValue} index={1}>
                <Typography sx={styles.formTitle}>
                  SECURITY PROTOCOLS
                </Typography>
                <Stack spacing={4} sx={{ maxWidth: 700, mx: 'auto' }}>
                  <TextField
                    fullWidth
                    label="CURRENT ENCRYPTION KEY"
                    type={showPassword ? 'text' : 'password'}
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                    sx={styles.inputField(theme)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: 'primary.main' }}>
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                  <TextField
                    fullWidth
                    label="NEW ENCRYPTION KEY"
                    type={showPassword ? 'text' : 'password'}
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    sx={styles.inputField(theme)}
                  />
                  <TextField
                    fullWidth
                    label="CONFIRM NEW KEY"
                    type={showPassword ? 'text' : 'password'}
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    sx={styles.inputField(theme)}
                  />
                  <Box display="flex" justifyContent="center" mt={4}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      onClick={handleChangePassword}
                      sx={{ ...styles.actionButton, width: '100%', maxWidth: 400 }}
                    >
                      REFLASH SECURITY
                    </Button>
                  </Box>
                </Stack>
              </CustomTabPanel>

              <CustomTabPanel value={tabValue} index={2}>
                <Typography sx={styles.formTitle}>
                  SYSTEM PREFERENCES
                </Typography>
                <Stack spacing={3} sx={{ maxWidth: 800, mx: 'auto' }}>
                  {[
                    {
                      key: 'emailNotifications',
                      label: 'COMM CHANNEL UPLINK',
                      desc: 'RECEIVE UNIT UPDATES AND ACCOUNT ALERTS.'
                    },
                    {
                      key: 'darkMode',
                      label: 'STEALTH MODE INTERFACE',
                      desc: 'OPTIMIZE VISUALS FOR LOW-LIGHT OPERATIONS.'
                    },
                    {
                      key: 'publicProfile',
                      label: 'SQUAD VISIBILITY',
                      desc: 'ALLOW EXTERNAL AGENTS TO VIEW YOUR IDENTITY DATA.'
                    }
                  ].map((pref) => (
                    <Box key={pref.key}>
                      <Paper sx={styles.preferenceCard(theme)}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={preferences[pref.key as keyof typeof preferences]}
                              onChange={(e) => setPreferences({ ...preferences, [pref.key]: e.target.checked })}
                              color="primary"
                            />
                          }
                          label={
                            <Box ml={2}>
                              <Typography sx={{ mb: 0.5 }}>{pref.label}</Typography>
                              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: '0.5px' }}>
                                {pref.desc}
                              </Typography>
                            </Box>
                          }
                          sx={styles.preferenceLabel}
                        />
                      </Paper>
                    </Box>
                  ))}
                  <Box>
                    <Box display="flex" justifyContent="center" mt={6}>
                      <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 900, letterSpacing: '2px', opacity: 0.8, textTransform: 'uppercase' }}>
                        SYSTEM PARAMETERS ARE SYNCED IN REAL-TIME
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </CustomTabPanel>
            </Box>
          </Paper>
        </motion.div>
      </Box>
    </Box>
  );
}

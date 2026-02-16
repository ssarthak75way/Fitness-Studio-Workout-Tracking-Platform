import { useState } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button,
  Tabs, Tab, Switch, FormControlLabel, InputAdornment, IconButton,
  useTheme, alpha, Grid
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
import { motion, AnimatePresence } from 'framer-motion';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Box sx={{ py: 3 }}>
              {children}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const styles = {
  pageContainer: { maxWidth: 1000, mx: 'auto', px: { xs: 2, md: 4 }, py: 4 },
  header: { mb: 5, textAlign: 'center' },
  headerTitle: (theme: any) => ({
    background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    mb: 1
  }),
  card: (theme: any) => ({
    borderRadius: 4,
    background: theme.palette.background.paper,
    boxShadow: theme.shadows[2],
    border: `1px solid ${theme.palette.divider}`,
    overflow: 'hidden'
  }),
  tabsContainer: (theme: any) => ({
    borderBottom: 1,
    borderColor: 'divider',
    bgcolor: alpha(theme.palette.primary.main, 0.05)
  }),
  tabs: {
    '& .MuiTab-root': {
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '1rem',
      minHeight: 60,
    }
  },
  tabPanelContainer: { p: { xs: 2, md: 4 } },
  sectionTitle: { mb: 3 },
  textField: { borderRadius: 2 },
  caption: { ml: 1, mt: 0.5, display: 'block' },
  buttonContainer: { display: 'flex', justifyContent: 'flex-end', mt: 2 },
  saveButton: { borderRadius: 2, px: 4, fontWeight: 700 },
  passwordContainer: { maxWidth: 600, mx: 'auto' },
  preferencesContainer: { maxWidth: 800, mx: 'auto' },
  preferenceCard: { borderRadius: 2 },
  preferenceLabel: { width: '100%', alignItems: 'flex-start', ml: 0 },
  autoSaveButton: { mt: 4, display: 'flex', justifyContent: 'center' }
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
      showToast('Profile updated successfully!', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Update failed', 'error');
    }
  };

  const handleChangePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    try {
      await api.patch('/users/password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      showToast('Password changed successfully!', 'success');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Password change failed', 'error');
    }
  };

  return (
    <Box sx={styles.pageContainer}>
      <Box sx={styles.header}>
        <Typography variant="h3" fontWeight={800} sx={styles.headerTitle(theme)}>
          Settings
        </Typography>
        <Typography variant="h6" color="text.secondary" fontWeight={400}>
          Manage your account and preferences.
        </Typography>
      </Box>

      <Card sx={styles.card(theme)}>
        <Box sx={styles.tabsContainer(theme)}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            centered
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
            sx={styles.tabs}
          >
            <Tab icon={<PersonIcon />} iconPosition="start" label="Profile" />
            <Tab icon={<SecurityIcon />} iconPosition="start" label="Security" />
            <Tab icon={<SettingsIcon />} iconPosition="start" label="Preferences" />
          </Tabs>
        </Box>

        <Box sx={styles.tabPanelContainer}>
          <CustomTabPanel value={tabValue} index={0}>
            <Typography variant="h6" fontWeight={700} gutterBottom sx={styles.sectionTitle}>
              Personal Information
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  variant="outlined"
                  InputProps={{ sx: styles.textField }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  variant="outlined"
                  InputProps={{ sx: styles.textField }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Role"
                  value={user?.role}
                  disabled
                  variant="filled"
                  InputProps={{ sx: styles.textField }}
                />
                <Typography variant="caption" color="text.secondary" sx={styles.caption}>
                  Role cannot be changed manually. Contact support for assistance.
                </Typography>
              </Grid>

              {user?.role === 'INSTRUCTOR' && (
                <>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Bio"
                      multiline
                      rows={4}
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                      InputProps={{ sx: styles.textField }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Certifications"
                      value={profile.certifications}
                      onChange={(e) => setProfile({ ...profile, certifications: e.target.value })}
                      placeholder="e.g., NASM Personal Trainer, CrossFit Level 2"
                      helperText="Separate multiple certifications with commas"
                      InputProps={{ sx: styles.textField }}
                    />
                  </Grid>
                </>
              )}

              <Grid size={{ xs: 12 }}>
                <Box sx={styles.buttonContainer}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<SaveIcon />}
                    onClick={handleUpdateProfile}
                    sx={styles.saveButton}
                  >
                    Save Changes
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CustomTabPanel>

          <CustomTabPanel value={tabValue} index={1}>
            <Typography variant="h6" fontWeight={700} gutterBottom sx={styles.sectionTitle}>
              Password Management
            </Typography>
            <Box sx={styles.passwordContainer}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Current Password"
                    type={showPassword ? 'text' : 'password'}
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                    InputProps={{
                      sx: styles.textField,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    InputProps={{ sx: styles.textField }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    type={showPassword ? 'text' : 'password'}
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    InputProps={{ sx: styles.textField }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box sx={styles.buttonContainer}>
                    <Button
                      variant="contained"
                      size="large"
                      color="secondary"
                      startIcon={<SaveIcon />}
                      onClick={handleChangePassword}
                      sx={styles.saveButton}
                    >
                      Update Password
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </CustomTabPanel>

          <CustomTabPanel value={tabValue} index={2}>
            <Typography variant="h6" fontWeight={700} gutterBottom sx={styles.sectionTitle}>
              App Preferences
            </Typography>
            <Box sx={styles.preferencesContainer}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <Card variant="outlined" sx={styles.preferenceCard}>
                    <CardContent>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={preferences.emailNotifications}
                            onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="subtitle1" fontWeight={600}>Email Notifications</Typography>
                            <Typography variant="body2" color="text.secondary">Receive updates about your bookings and account.</Typography>
                          </Box>
                        }
                        sx={styles.preferenceLabel}
                      />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Card variant="outlined" sx={styles.preferenceCard}>
                    <CardContent>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={preferences.darkMode}
                            onChange={(e) => setPreferences({ ...preferences, darkMode: e.target.checked })}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="subtitle1" fontWeight={600}>Dark Mode</Typography>
                            <Typography variant="body2" color="text.secondary">Use dark theme for the application interface.</Typography>
                          </Box>
                        }
                        sx={styles.preferenceLabel}
                      />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Card variant="outlined" sx={styles.preferenceCard}>
                    <CardContent>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={preferences.publicProfile}
                            onChange={(e) => setPreferences({ ...preferences, publicProfile: e.target.checked })}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="subtitle1" fontWeight={600}>Public Profile</Typography>
                            <Typography variant="body2" color="text.secondary">Allow other users to see your basic profile information.</Typography>
                          </Box>
                        }
                        sx={styles.preferenceLabel}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              <Box sx={styles.autoSaveButton}>
                <Button variant="outlined" disabled>Save Preferences (Auto-saved)</Button>
              </Box>
            </Box>
          </CustomTabPanel>
        </Box>
      </Card>
    </Box>
  );
}
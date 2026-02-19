import { Box, Container, Typography, Grid, TextField, Button, useTheme, Stack, Paper } from '@mui/material';
import type { Theme } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';

const styles = {
    pageContainer: {
        bgcolor: 'background.default',
        pt: 15
    },
    contentContainer: {
        pb: 20
    },
    headerBox: {
        mb: 10
    },
    headerTitle: {
        mt: 2
    },
    contactInfoTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: 2
    },
    contactInfoText: {
        color: 'text.secondary',
        pl: 5
    },
    formPaper: {
        p: 6,
        bgcolor: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: 0
    },
    inputField: (theme: Theme) => ({
        '& .MuiOutlinedInput-root': {
            borderRadius: 0,
            bgcolor: 'rgba(255,255,255,0.02)',
            '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
            '&:hover fieldset': { borderColor: theme.palette.primary.main },
        }
    }),
    submitButton: (theme: Theme) => ({
        borderRadius: 0,
        py: 2,
        px: 8,
        fontWeight: 900,
        boxShadow: theme.shadows[10]
    }),
    mapContainer: {
        height: 500,
        width: '100%',
        bgcolor: 'secondary.main',
        borderTop: '1px solid rgba(255,255,255,0.05)'
    },
    mapIframe: {
        border: 0,
        filter: 'grayscale(1) invert(0.9) opacity(0.8)'
    }
};

export default function ContactPage() {
    const theme = useTheme();

    return (
        <Box sx={styles.pageContainer}>
            <Container maxWidth="lg" sx={styles.contentContainer}>
                <Box sx={styles.headerBox}>
                    <Typography variant="overline" color="primary.main" fontWeight={900} letterSpacing={4}>
                        GET IN TOUCH
                    </Typography>
                    <Typography variant="h2" fontWeight={900} sx={styles.headerTitle}>
                        WE'RE READY WHEN <br /> YOU ARE.
                    </Typography>
                </Box>

                <Grid container spacing={10}>
                    <Grid size={{ xs: 12, md: 5 }}>
                        <Stack spacing={6}>
                            <Box>
                                <Typography variant="h6" fontWeight={800} mb={3} sx={styles.contactInfoTitle}>
                                    <LocationOnIcon color="primary" /> HEADQUARTERS
                                </Typography>
                                <Typography variant="body1" sx={styles.contactInfoText}>
                                    75 Elite Avenue, Performance District<br />
                                    New York, NY 10001
                                </Typography>
                            </Box>

                            <Box>
                                <Typography variant="h6" fontWeight={800} mb={3} sx={styles.contactInfoTitle}>
                                    <PhoneIcon color="primary" /> DIRECT LINE
                                </Typography>
                                <Typography variant="body1" sx={styles.contactInfoText}>
                                    +1 (800) F-STUDIO<br />
                                    Mon — Fri: 06:00 - 22:00
                                </Typography>
                            </Box>

                            <Box>
                                <Typography variant="h6" fontWeight={800} mb={3} sx={styles.contactInfoTitle}>
                                    <EmailIcon color="primary" /> SUPPORT
                                </Typography>
                                <Typography variant="body1" sx={styles.contactInfoText}>
                                    elite@fstudio.io<br />
                                    press@fstudio.io
                                </Typography>
                            </Box>
                        </Stack>
                    </Grid>

                    <Grid size={{ xs: 12, md: 7 }}>
                        <Paper
                            elevation={0}
                            sx={styles.formPaper}
                        >
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField fullWidth label="First Name" variant="outlined" sx={styles.inputField(theme)} />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField fullWidth label="Last Name" variant="outlined" sx={styles.inputField(theme)} />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <TextField fullWidth label="Email Address" variant="outlined" sx={styles.inputField(theme)} />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <TextField fullWidth label="Subject" variant="outlined" sx={styles.inputField(theme)} />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <TextField
                                        fullWidth
                                        label="Message"
                                        multiline
                                        rows={6}
                                        variant="outlined"
                                        sx={styles.inputField(theme)}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        sx={styles.submitButton(theme)}
                                    >
                                        SEND MESSAGE
                                    </Button>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>

            {/* Map Integration */}
            <Box sx={styles.mapContainer}>
                <iframe
                    title="FITNESS STUDIO Full Map"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.2528082187!2d-74.11976373926838!3d40.69766374874431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={styles.mapIframe}
                    loading="lazy"
                />
            </Box>
        </Box>
    );
}

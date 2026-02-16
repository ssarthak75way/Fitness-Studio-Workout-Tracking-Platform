import { useState, useEffect, useRef } from 'react';
import {
    Box, Typography, TextField, Button, Card, CardContent, CircularProgress,
    ToggleButton, ToggleButtonGroup, useTheme, alpha
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { bookingService } from '../../services/booking.service';
import { motion, AnimatePresence } from 'framer-motion';

export default function CheckInPage() {
    const theme = useTheme();
    const [qrData, setQrData] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
    const [mode, setMode] = useState<'camera' | 'manual'>('camera');
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        // Cleanup function to clear scanner when component unmounts or mode changes
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(err => console.warn("Failed to clear scanner", err));
                scannerRef.current = null;
            }
        };
    }, [mode]);

    useEffect(() => {
        if (mode === 'camera' && !loading && !result) {
            // Small delay to ensure creating scanner after DOM is ready and previous one cleared
            const timer = setTimeout(() => {
                if (!scannerRef.current) {
                    try {
                        const scanner = new Html5QrcodeScanner(
                            "reader",
                            { fps: 10, qrbox: { width: 250, height: 250 } },
                            false
                        );
                        scannerRef.current = scanner;
                        scanner.render(onScanSuccess, onScanFailure);
                    } catch (e) {
                        console.error("Error initializing scanner:", e);
                    }
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [mode, loading, result]);

    const onScanSuccess = (decodedText: string) => {
        if (scannerRef.current) {
            scannerRef.current.pause(true);
        }
        processCheckIn(decodedText);
    };

    const onScanFailure = () => {
        // quiet fail
    };

    const processCheckIn = async (data: string) => {
        setLoading(true);
        // Keep result null initially to possibly show loading state clearer if needed

        try {
            const response = await bookingService.checkIn(data);
            setResult({
                success: true,
                message: `Welcome, ${response.data.user?.fullName}! Checked in for ${response.data.classSession?.title || 'class'}.`
            });
            setQrData('');
        } catch (error: any) {
            setResult({
                success: false,
                message: error.response?.data?.message || 'Check-in failed. Invalid QR code or booking not found.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (qrData) processCheckIn(qrData);
    };

    const handleReset = () => {
        setResult(null);
        setQrData('');
        // When resetting, if in camera mode, the useEffect will re-initialize/resume
        if (mode === 'camera' && scannerRef.current) {
            scannerRef.current.resume();
        }
    };

    return (
        <Box maxWidth={600} mx="auto" px={2} py={4}>
            <Box mb={4} textAlign="center">
                <Typography variant="h3" fontWeight={800} sx={{
                    background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1
                }}>
                    Check-In
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Scan member QR code or enter code manually.
                </Typography>
            </Box>

            <Box display="flex" justifyContent="center" mb={4}>
                <ToggleButtonGroup
                    value={mode}
                    exclusive
                    onChange={(_, newMode) => {
                        if (newMode) {
                            setMode(newMode);
                            setResult(null); // Clear result on mode switch
                        }
                    }}
                    aria-label="check-in mode"
                    sx={{
                        bgcolor: theme.palette.background.paper,
                        boxShadow: theme.shadows[1],
                        borderRadius: 2,
                        '& .MuiToggleButton-root': {
                            px: 3,
                            py: 1,
                            borderRadius: 2,
                            border: 'none',
                            textTransform: 'none',
                            fontWeight: 600,
                            '&.Mui-selected': {
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.primary.main,
                                '&:hover': {
                                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                                }
                            }
                        }
                    }}
                >
                    <ToggleButton value="camera" aria-label="camera scan">
                        <QrCodeScannerIcon sx={{ mr: 1 }} /> Camera
                    </ToggleButton>
                    <ToggleButton value="manual" aria-label="manual entry">
                        <KeyboardIcon sx={{ mr: 1 }} /> Manual
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>

            <AnimatePresence mode="wait">
                {result ? (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                    >
                        <Card sx={{
                            borderRadius: 4,
                            boxShadow: theme.shadows[4],
                            textAlign: 'center',
                            overflow: 'hidden',
                            border: `1px solid ${result.success ? theme.palette.success.light : theme.palette.error.light}`
                        }}>
                            <Box sx={{
                                bgcolor: result.success ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1),
                                py: 4
                            }}>
                                {result.success ? (
                                    <CheckCircleIcon sx={{ fontSize: 80, color: theme.palette.success.main }} />
                                ) : (
                                    <ErrorIcon sx={{ fontSize: 80, color: theme.palette.error.main }} />
                                )}
                            </Box>
                            <CardContent sx={{ pt: 3, pb: 4 }}>
                                <Typography variant="h5" fontWeight={700} gutterBottom>
                                    {result.success ? 'Success!' : 'Error'}
                                </Typography>
                                <Typography variant="body1" color="text.secondary" mb={3}>
                                    {result.message}
                                </Typography>
                                <Button
                                    variant="contained"
                                    color={result.success ? 'primary' : 'inherit'}
                                    onClick={handleReset}
                                    size="large"
                                    sx={{ borderRadius: 2, px: 4 }}
                                >
                                    Scan Next
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <Card sx={{
                            borderRadius: 4,
                            boxShadow: theme.shadows[2],
                            overflow: 'hidden',
                            background: theme.palette.background.paper
                        }}>
                            <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
                                {mode === 'camera' ? (
                                    <Box>
                                        <Box
                                            sx={{
                                                borderRadius: 2,
                                                overflow: 'hidden',
                                                border: `2px dashed ${theme.palette.divider}`,
                                                bgcolor: '#000',
                                                minHeight: 300,
                                                position: 'relative'
                                            }}
                                        >
                                            <div id="reader" style={{ width: '100%' }}></div>
                                        </Box>
                                        <Typography variant="caption" display="block" textAlign="center" color="text.secondary" mt={2}>
                                            Position the QR code within the frame.
                                        </Typography>
                                    </Box>
                                ) : (
                                    <form onSubmit={handleManualSubmit}>
                                        <Typography variant="h6" gutterBottom fontWeight={600}>
                                            Enter Code Manually
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" mb={3}>
                                            Type the alphanumeric code found below the member's QR code.
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            label="Booking Code / Member ID"
                                            variant="outlined"
                                            value={qrData}
                                            onChange={(e) => setQrData(e.target.value)}
                                            placeholder="e.g., BOOK-123456"
                                            sx={{ mb: 3 }}
                                            InputProps={{ sx: { borderRadius: 2 } }}
                                            autoFocus
                                        />
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            size="large"
                                            type="submit"
                                            disabled={loading || !qrData}
                                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                                            sx={{ borderRadius: 2, py: 1.5, fontWeight: 700 }}
                                        >
                                            {loading ? 'Verifying...' : 'Check In'}
                                        </Button>
                                    </form>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </Box>
    );
}

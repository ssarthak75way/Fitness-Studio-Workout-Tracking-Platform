import React, { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Slide, Box, Typography, IconButton, useTheme, alpha, Paper } from '@mui/material';
import type { AlertColor, SlideProps, Theme } from '@mui/material';
import {
    CheckCircleOutline as SuccessIcon,
    ErrorOutline as ErrorIcon,
    InfoOutline as InfoIcon,
    WarningAmber as WarningIcon,
    Close as CloseIcon
} from '@mui/icons-material';

// 1. Create a nice slide transition
const SlideTransition = React.forwardRef<unknown, SlideProps>((props, ref) => {
    return <Slide {...props} direction="left" ref={ref} />;
});

interface ToastContextType {
    showToast: (message: string, severity?: AlertColor) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const styles = {
    snackbar: { marginTop: '16px', marginRight: '16px' },
    toastRoot: (theme: Theme, severity: AlertColor) => ({
        minWidth: '320px',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: '12px 16px',
        borderRadius: 3,
        background: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(12px)',
        boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.15)}`,
        borderLeft: `6px solid ${theme.palette[severity].main}`,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        position: 'relative' as const,
        overflow: 'hidden',
        '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, ${alpha(theme.palette[severity].main, 0.05)} 0%, transparent 100%)`,
            pointerEvents: 'none',
        }
    }),
    iconWrapper: (theme: Theme, severity: AlertColor) => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.palette[severity].main,
        '& svg': { fontSize: '1.75rem' }
    }),
    messageContainer: { flex: 1 },
    messageText: { fontWeight: 600, fontSize: '0.95rem', color: 'text.primary' },
    closeButton: {
        p: 0.5,
        color: 'text.secondary',
        '&:hover': { color: 'text.primary', bgcolor: 'rgba(0,0,0,0.05)' }
    }
};

const CustomToast = React.forwardRef<HTMLDivElement, { message: string, severity: AlertColor, onClose: () => void }>(
    ({ message, severity, onClose }, ref) => {
        const theme = useTheme();

        const getIcon = () => {
            switch (severity) {
                case 'success': return <SuccessIcon />;
                case 'error': return <ErrorIcon />;
                case 'warning': return <WarningIcon />;
                default: return <InfoIcon />;
            }
        };

        return (
            <Paper ref={ref} sx={styles.toastRoot(theme, severity)}>
                <Box sx={styles.iconWrapper(theme, severity)}>
                    {getIcon()}
                </Box>
                <Box sx={styles.messageContainer}>
                    <Typography sx={styles.messageText}>
                        {message}
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small" sx={styles.closeButton}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Paper>
        );
    }
);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState<AlertColor>('info');

    const showToast = useCallback((msg: string, sev: AlertColor = 'info') => {
        setMessage(msg);
        setSeverity(sev);
        setOpen(true);
    }, []);

    const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <Snackbar
                open={open}
                autoHideDuration={4000}
                onClose={handleClose}
                // 2. Position Top-Right
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                // 3. Smooth Slide Transition
                TransitionComponent={SlideTransition}
                // Add a little margin from the edges
                sx={styles.snackbar}
            >
                <CustomToast
                    message={message}
                    severity={severity}
                    onClose={handleClose}
                />
            </Snackbar>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
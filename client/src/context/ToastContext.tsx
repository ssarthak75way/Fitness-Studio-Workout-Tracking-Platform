import React, { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert, Slide } from '@mui/material';
import type { AlertColor, SlideProps } from '@mui/material';

// 1. Create a nice slide transition
function SlideTransition(props: SlideProps) {
    return <Slide {...props} direction="left" />;
}

interface ToastContextType {
    showToast: (message: string, severity?: AlertColor) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

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
                sx={{ marginTop: '16px', marginRight: '16px' }}
            >
                <Alert
                    onClose={handleClose}
                    severity={severity}
                    variant="filled" // Makes it pop with solid colors
                    sx={{
                        width: '100%',
                        minWidth: '300px', // Ensures it's not too skinny
                        borderRadius: 3, // More rounded corners (Modern look)
                        boxShadow: '0px 8px 24px rgba(0,0,0,0.15)', // Deeper, smoother shadow
                        fontWeight: 600, // Bolder text
                        fontSize: '0.95rem',
                        alignItems: 'center',
                        '& .MuiAlert-icon': {
                            fontSize: '1.5rem', // Slightly larger icon
                        },
                    }}
                >
                    {message}
                </Alert>
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
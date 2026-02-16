import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, useTheme, alpha } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';

interface ConfirmationDialogProps {
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    severity?: 'error' | 'warning' | 'info';
}

export default function ConfirmationDialog({
    open,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    severity = 'warning'
}: ConfirmationDialogProps) {
    const theme = useTheme();

    const getColor = () => {
        switch (severity) {
            case 'error': return theme.palette.error.main;
            case 'warning': return theme.palette.warning.main;
            default: return theme.palette.info.main;
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onCancel}
            maxWidth="xs"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
        >
            <DialogTitle component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
                <WarningIcon sx={{ color: getColor() }} />
                <Typography variant="h6" fontWeight={600}>{title}</Typography>
            </DialogTitle>
            <DialogContent>
                <Typography variant="body1" color="text.secondary">
                    {message}
                </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onCancel} color="inherit" sx={{ fontWeight: 600 }}>
                    {cancelText}
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    sx={{
                        bgcolor: getColor(),
                        '&:hover': { bgcolor: alpha(getColor(), 0.9) },
                        fontWeight: 600,
                        boxShadow: 'none'
                    }}
                >
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

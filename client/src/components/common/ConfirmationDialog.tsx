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

const styles = {
    dialogPaper: { borderRadius: 3, p: 1 },
    dialogTitle: { display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 },
    warningIcon: (color: string) => ({ color }),
    titleText: { fontWeight: 600 },
    dialogActions: { px: 3, pb: 2 },
    cancelButton: { fontWeight: 600 },
    confirmButton: (color: string) => ({
        bgcolor: color,
        '&:hover': { bgcolor: alpha(color, 0.9) },
        fontWeight: 600,
        boxShadow: 'none'
    })
};

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

    const color = getColor();

    return (
        <Dialog
            open={open}
            onClose={onCancel}
            maxWidth="xs"
            fullWidth
            PaperProps={{ sx: styles.dialogPaper }}
        >
            <DialogTitle component="div" sx={styles.dialogTitle}>
                <WarningIcon sx={styles.warningIcon(color)} />
                <Typography variant="h6" sx={styles.titleText}>{title}</Typography>
            </DialogTitle>
            <DialogContent>
                <Typography variant="body1" color="text.secondary">
                    {message}
                </Typography>
            </DialogContent>
            <DialogActions sx={styles.dialogActions}>
                <Button onClick={onCancel} color="inherit" sx={styles.cancelButton}>
                    {cancelText}
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    sx={styles.confirmButton(color)}
                >
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

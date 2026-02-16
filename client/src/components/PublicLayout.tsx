import { type ReactNode } from 'react';
import { Box, useTheme } from '@mui/material';

const styles = {
    container: (theme: any) => ({
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: theme.palette.background.default,
        color: theme.palette.text.primary,
    })
};

export default function PublicLayout({ children }: { children: ReactNode }) {
    const theme = useTheme();

    return (
        <Box sx={styles.container(theme)}>
            {children}
        </Box>
    );
}

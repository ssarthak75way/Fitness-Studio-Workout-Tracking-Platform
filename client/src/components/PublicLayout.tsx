import { type ReactNode } from 'react';
import { Box, useTheme } from '@mui/material';

export default function PublicLayout({ children }: { children: ReactNode }) {
    const theme = useTheme();

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: theme.palette.background.default,
                color: theme.palette.text.primary,
            }}
        >
            {children}
        </Box>
    );
}

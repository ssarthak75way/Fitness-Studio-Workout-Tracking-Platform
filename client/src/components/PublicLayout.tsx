import { type ReactNode, useEffect } from 'react';
import { Box, useTheme, type Theme } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { PublicHeader } from './common/PublicHeader';
import Footer from './Footer';

const styles = {
    container: (theme: Theme) => ({
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: theme.palette.background.default,
        color: theme.palette.text.primary,
    })
};

export default function PublicLayout({ children }: { children: ReactNode }) {
    const theme = useTheme();
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    const isLogin = pathname === '/login';

    return (
        <Box sx={styles.container(theme)}>
            {!isLogin && <PublicHeader />}
            <Box component="main" sx={{ flexGrow: 1 }}>
                {children}
            </Box>
            {!isLogin && <Footer />}
        </Box>
    );
}

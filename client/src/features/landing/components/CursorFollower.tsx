import { useEffect } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import { Box, useTheme, alpha } from '@mui/material';
import type { Theme } from '@mui/material';

const styles = {
    cursor: (theme: Theme) => ({
        width: 40,
        height: 40,
        borderRadius: '50%',
        border: `2px solid ${theme.palette.primary.main}`,
        bgcolor: alpha(theme.palette.primary.main, 0.1),
        backdropFilter: 'blur(2px)',
        display: { xs: 'none', md: 'block' },
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 9999,
        pointerEvents: 'none'
    })
};

export const CursorFollower = () => {
    const theme = useTheme();
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    // Smooth spring physics for the follower
    const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
    const springX = useSpring(cursorX, springConfig);
    const springY = useSpring(cursorY, springConfig);

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
        };

        window.addEventListener('mousemove', moveCursor);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
        };
    }, [cursorX, cursorY]);

    return (
        <Box
            component={motion.div}
            style={{
                translateX: springX,
                translateY: springY,
                x: '-50%',
                y: '-50%',
            }}
            sx={styles.cursor(theme)}
        />
    );
};

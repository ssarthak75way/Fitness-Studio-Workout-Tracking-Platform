import { Box, useTheme } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import { useEffect, useState } from 'react';

export const ScrollToTop = () => {
    const theme = useTheme();
    const { scrollYProgress, scrollY } = useScroll();
    const [showScroll, setShowScroll] = useState(false);

    useEffect(() => {
        return scrollY.on("change", (latest) => {
            setShowScroll(latest > 400);
        });
    }, [scrollY]);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <AnimatePresence>
            {showScroll && (
                <Box
                    component={motion.div}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={scrollToTop}
                    sx={{
                        position: 'fixed',
                        bottom: 40,
                        right: 40,
                        zIndex: 1000,
                        cursor: 'pointer',
                        width: 60,
                        height: 60,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <svg width="60" height="60" viewBox="0 0 100 100">
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="5"
                            fill="none"
                        />
                        <motion.circle
                            cx="50"
                            cy="50"
                            r="45"
                            stroke={theme.palette.primary.main}
                            strokeWidth="5"
                            fill="none"
                            strokeDasharray="283"
                            style={{ pathLength: scrollYProgress, rotate: -90, originX: "50%", originY: "50%" }}
                        />
                    </svg>
                    <Box
                        sx={{
                            position: 'absolute',
                            width: 45,
                            height: 45,
                            bgcolor: 'primary.main',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                        }}
                    >
                        <KeyboardArrowUpIcon />
                    </Box>
                </Box>
            )}
        </AnimatePresence>
    );
};

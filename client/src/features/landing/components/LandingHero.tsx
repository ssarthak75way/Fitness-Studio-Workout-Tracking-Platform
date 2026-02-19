import { useEffect, useState } from 'react';
import { Box, Container, Typography, Stack, Button, useTheme } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { motion, useScroll, useTransform } from 'framer-motion';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
const UN_HERO = "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070&auto=format&fit=crop";

interface LandingHeroProps {
    isAuthenticated: boolean;
    onCTA: () => void;
}

export const LandingHero = ({ isAuthenticated, onCTA }: LandingHeroProps) => {
    const theme = useTheme();
    const { scrollYProgress } = useScroll();
    const opacityHero = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
    const [init, setInit] = useState(false);

    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => {
            setInit(true);
        });
    }, []);

    const particlesColor = theme.palette.mode === 'dark' ? "#ffffff" : "#000000";

    return (
        <Box
            sx={{
                position: 'relative',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundImage: theme.palette.mode === 'dark'
                    ? `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.95)), url(${UN_HERO})`
                    : `linear-gradient(rgba(255,255,255,0.8), rgba(255,255,255,0.9)), url(${UN_HERO})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                textAlign: 'center',
                color: 'text.primary',
                px: 3
            }}
        >
            {init && (
                <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, opacity: 0.6 }}>
                    <Particles
                        id="tsparticles"
                        options={{
                            background: { color: { value: "transparent" } },
                            fpsLimit: 120,
                            particles: {
                                color: { value: particlesColor },
                                links: {
                                    color: particlesColor,
                                    distance: 150,
                                    enable: true,
                                    opacity: 0.2,
                                    width: 1,
                                },
                                move: {
                                    enable: true,
                                    speed: 1.5,
                                    direction: "none",
                                    outModes: { default: "bounce" },
                                },
                                number: {
                                    density: { enable: true, height: 800, width: 800 },
                                    value: 60,
                                },
                                opacity: { value: 0.3 },
                                shape: { type: "circle" },
                                size: { value: { min: 1, max: 3 } },
                            },
                            detectRetina: true,
                            interactivity: {
                                events: {
                                    onHover: { enable: true, mode: "grab" },
                                    onClick: { enable: true, mode: "push" },
                                },
                                modes: {
                                    grab: { distance: 180, links: { opacity: 0.8 } },
                                    push: { quantity: 4 },
                                },
                            },
                        }}
                        style={{ width: '100%', height: '100%' }}
                    />
                </Box>
            )}
            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
                <motion.div style={{ opacity: opacityHero }}>
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Typography
                            variant="overline"
                            sx={{
                                color: 'primary.main',
                                fontWeight: 900,
                                letterSpacing: '6px',
                                mb: 2,
                                display: 'block'
                            }}
                        >
                            START YOUR EVOLUTION
                        </Typography>
                        <Typography
                            variant="h1"
                            sx={{
                                fontWeight: 900,
                                fontSize: { xs: '4rem', md: '8rem' },
                                lineHeight: 0.9,
                                letterSpacing: '-4px',
                                textTransform: 'uppercase',
                                mb: 4
                            }}
                        >
                            BUILT FOR <br />
                            <Box component="span" sx={{ color: 'primary.main' }}>PERFORMANCE.</Box>
                        </Typography>
                        <Typography
                            variant="h5"
                            sx={{
                                maxWidth: 700,
                                mx: 'auto',
                                mb: 8,
                                opacity: 0.8,
                                fontWeight: 400,
                                lineHeight: 1.6,
                                fontSize: { xs: '1rem', md: '1.4rem' }
                            }}
                        >
                            The definitive operating system for elite fitness. Track every set, book every class, and master your biological potential.
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center">
                            <Button
                                variant="contained"
                                size="large"
                                sx={{ py: 3, px: 8, fontSize: '1.1rem', fontWeight: 900, borderRadius: 0 }}
                                onClick={onCTA}
                            >
                                {isAuthenticated ? 'GO TO DASHBOARD' : 'GET STARTED'}
                            </Button>
                            <Button
                                variant="outlined"
                                size="large"
                                startIcon={<PlayArrowIcon />}
                                sx={{
                                    py: 3, px: 8, fontSize: '1.1rem', fontWeight: 900, borderRadius: 0,
                                    color: '#fff', borderColor: '#fff',
                                    '&:hover': { borderColor: 'primary.main' }
                                }}
                            >
                                WATCH FILM
                            </Button>
                        </Stack>
                    </motion.div>
                </motion.div>
            </Container>

            {/* Scroll Indicator */}
            <Box sx={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)' }}>
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    style={{ width: 1, height: 60, background: 'linear-gradient(to bottom, transparent, #FF5722)' }}
                />
            </Box>
        </Box>
    );
};

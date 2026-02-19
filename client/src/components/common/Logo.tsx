import { Box, Typography, alpha, useTheme } from '@mui/material';

interface LogoProps {
    variant?: 'white' | 'primary';
    size?: 'small' | 'medium' | 'large';
    sx?: object;
}

export const Logo = ({ variant = 'primary', size = 'medium', sx = {} }: LogoProps) => {
    const theme = useTheme();
    const isSmall = size === 'small';
    const isLarge = size === 'large';

    const mainColor = variant === 'white' ? '#fff' : theme.palette.primary.main;
    const textColor = variant === 'white' ? '#fff' : theme.palette.text.primary;

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: isSmall ? 1 : 1.5,
                textDecoration: 'none',
                ...sx
            }}
        >
            <Box
                sx={{
                    width: isLarge ? 48 : isSmall ? 28 : 36,
                    height: isLarge ? 48 : isSmall ? 28 : 36,
                    bgcolor: mainColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 0.5,
                    position: 'relative',
                    boxShadow: variant === 'primary' ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}` : 'none',
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: -2,
                        left: -2,
                        right: -2,
                        bottom: -2,
                        border: `1px solid ${alpha(mainColor, 0.5)}`,
                        borderRadius: 1,
                        opacity: variant === 'primary' ? 1 : 0.5
                    }
                }}
            >
                <Typography
                    sx={{
                        color: variant === 'white' ? theme.palette.primary.main : '#fff',
                        fontWeight: 950,
                        fontSize: isLarge ? '1.8rem' : isSmall ? '1rem' : '1.3rem',
                        lineHeight: 1,
                        fontFamily: '"Outfit", sans-serif'
                    }}
                >
                    F
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                <Typography
                    sx={{
                        fontWeight: 900,
                        color: textColor,
                        fontSize: isLarge ? '1.8rem' : isSmall ? '1rem' : '1.3rem',
                        letterSpacing: '0.1em',
                        fontFamily: '"Outfit", sans-serif',
                    }}
                >
                    STUDIO
                </Typography>
                {!isSmall && (
                    <Typography
                        variant="caption"
                        sx={{
                            color: alpha(textColor, 0.5),
                            fontWeight: 700,
                            letterSpacing: '0.3em',
                            fontSize: isLarge ? '0.7rem' : '0.5rem',
                            mt: 0.5
                        }}
                    >
                        PERFORMANCE
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

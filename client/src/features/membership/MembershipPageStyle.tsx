import { alpha, type Theme } from "@mui/material";

export const styles = {
    pageContainer: {
        p: 0,
        bgcolor: 'background.default',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
    },
    headerHero: (theme: Theme) => ({
        pt: { xs: 10, md: 14 },
        pb: { xs: 8, md: 12 },
        px: { xs: 3, md: 6 },
        position: 'relative',
        backgroundImage: theme.palette.mode === 'dark'
            ? `linear-gradient(rgba(6, 9, 15, 0.75), rgba(6, 9, 15, 1)), url(https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop)`
            : `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.95)), url(https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        flexWrap: 'wrap',
        gap: 4,
        borderBottom: `1px solid ${theme.palette.divider}`,
        '&::before': {
            content: '"ACCESS"',
            position: 'absolute',
            top: '20%',
            left: '5%',
            fontSize: { xs: '5rem', md: '12rem' },
            fontWeight: 950,
            color: theme.palette.mode === 'dark' ? alpha('#fff', 0.03) : alpha('#000', 0.03),
            letterSpacing: '20px',
            zIndex: 0,
            pointerEvents: 'none',
            lineHeight: 0.8
        }
    }),
    headerTitle: (theme: Theme) => ({
        fontWeight: 950,
        fontSize: { xs: '3.5rem', md: '6rem' },
        lineHeight: 0.85,
        letterSpacing: '-4px',
        color: theme.palette.text.primary,
        textTransform: 'uppercase',
        mb: 2,
        position: 'relative',
        zIndex: 1,
        '& span': {
            color: theme.palette.primary.main,
            textShadow: theme.palette.mode === 'dark' ? `0 0 40px ${alpha(theme.palette.primary.main, 0.5)}` : 'none'
        }
    }),
    headerSubtitle: {
        color: 'text.secondary',
        maxWidth: 600,
        fontWeight: 400,
        lineHeight: 1.6
    },
    sectionLabel: (theme: Theme) => ({
        color: theme.palette.primary.main,
        fontWeight: 900,
        letterSpacing: '5px',
        mb: 4,
        display: 'block',
        textTransform: 'uppercase',
        fontSize: '0.7rem',
        opacity: 0.8
    }),
    contentWrapper: {
        px: { xs: 3, md: 6 },
        py: { xs: 4, md: 8 },
        flexGrow: 1,
        position: 'relative',
        zIndex: 1
    },
    currentMembershipCard: (theme: Theme, isActive: boolean) => ({
        borderRadius: 2,
        border: '1px solid',
        borderColor: isActive ? alpha(theme.palette.success.main, 0.2) : theme.palette.divider,
        bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.4 : 0.8),
        backdropFilter: 'blur(24px) saturate(160%)',
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: isActive
            ? `inset 0 0 30px ${alpha(theme.palette.success.main, 0.05)}, 0 20px 50px -20px ${alpha(theme.palette.success.main, 0.2)}`
            : theme.palette.mode === 'dark'
                ? `inset 0 0 20px -10px ${alpha('#fff', 0.05)}, 0 10px 30px -15px ${alpha('#000', 0.5)}`
                : `0 10px 30px -15px ${alpha(theme.palette.common.black, 0.1)}`,
        overflow: 'visible',
        position: 'relative'
    }),
    activeBadge: (theme: Theme) => ({
        position: 'absolute',
        top: -14,
        right: 40,
        bgcolor: theme.palette.success.main,
        color: theme.palette.success.contrastText,
        px: 3,
        py: 0.75,
        borderRadius: 0,
        fontWeight: 900,
        fontSize: '0.7rem',
        letterSpacing: '2px',
        boxShadow: `0 8px 16px ${alpha(theme.palette.success.main, 0.4)}`,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        zIndex: 2
    }),
    cardContent: {
        p: { xs: 4, md: 6 }
    },
    activeTierTitle: {
        letterSpacing: '-2px',
        color: 'text.primary',
        mt: 1,
        mb: 2
    },
    statusChip: {
        borderRadius: 0,
        fontWeight: 900,
        letterSpacing: '1px'
    },
    membershipDetailItem: (theme: Theme) => ({
        p: 3,
        bgcolor: alpha(theme.palette.text.primary, 0.03),
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
    }),
    noMembershipBox: (theme: Theme) => ({
        p: 4,
        bgcolor: alpha(theme.palette.text.primary, 0.02),
        border: `1px dashed ${theme.palette.divider}`,
        textAlign: 'center'
    }),
    noMembershipIcon: {
        fontSize: 48,
        color: 'primary.main',
        mb: 2,
        opacity: 0.3
    },
    noMembershipText: {
        fontWeight: 700,
        opacity: 0.5,
        letterSpacing: '1px',
        color: 'text.secondary'
    },
    availableTiersTitle: {
        color: 'text.primary',
        letterSpacing: '-3px',
        mb: 8
    },
    planCard: (theme: Theme, popular: boolean) => ({
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        position: 'relative',
        overflow: 'visible',
        border: '1px solid',
        borderColor: popular ? alpha(theme.palette.secondary.main, 0.3) : theme.palette.divider,
        bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.3 : 0.7),
        backdropFilter: 'blur(20px)',
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: popular
            ? `0 20px 60px -20px ${alpha(theme.palette.secondary.main, 0.3)}`
            : theme.palette.mode === 'dark'
                ? `0 10px 30px -15px ${alpha('#000', 0.5)}`
                : `0 10px 30px -15px ${alpha(theme.palette.common.black, 0.08)}`,
        '&:hover': {
            transform: 'translateY(-10px) scale(1.02)',
            borderColor: popular ? theme.palette.secondary.main : alpha(theme.palette.primary.main, 0.4),
            boxShadow: popular
                ? `0 30px 80px -20px ${alpha(theme.palette.secondary.main, 0.5)}`
                : `0 25px 60px -20px ${alpha(theme.palette.primary.main, 0.3)}`,
        }
    }),
    popularBadge: (theme: Theme) => ({
        position: 'absolute',
        top: -16,
        left: '50%',
        transform: 'translateX(-50%)',
        bgcolor: theme.palette.secondary.main,
        color: theme.palette.secondary.contrastText,
        px: 3,
        py: 0.75,
        borderRadius: 0,
        fontWeight: 900,
        fontSize: '0.7rem',
        letterSpacing: '3px',
        boxShadow: `0 8px 30px ${alpha(theme.palette.secondary.main, 0.5)}`,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        zIndex: 2
    }),
    planHeader: (popular: boolean) => ({
        flexGrow: 1,
        p: 5,
        pt: popular ? 8 : 6
    }),
    planName: (color: string) => ({
        color: color,
        letterSpacing: '4px'
    }),
    planPrice: {
        fontSize: '3.5rem',
        fontWeight: 950,
        letterSpacing: '-2px',
        lineHeight: 1,
        mb: 1
    },
    planPeriod: {
        fontWeight: 900,
        color: 'text.secondary',
        ml: 1
    },
    planDescription: {
        color: 'text.secondary',
        mt: 1,
        fontWeight: 500,
        opacity: 0.7
    },
    divider: (theme: Theme) => ({
        mb: 4,
        borderColor: theme.palette.divider
    }),
    featureItem: {
        py: 1.5
    },
    featureIconWrapper: {
        minWidth: 40
    },
    featureIcon: (color: string) => ({
        fontSize: '1.2rem',
        color: color,
        opacity: 0.8
    }),
    featureText: {
        variant: 'caption',
        fontWeight: 900,
        letterSpacing: '1px',
        color: 'text.primary',
        sx: { opacity: 0.8 }
    },
    planActionBox: {
        p: 5,
        pt: 0
    },
    planActionButton: (theme: Theme, popular: boolean) => ({
        borderRadius: 0,
        fontWeight: 900,
        letterSpacing: '2px',
        py: 2,
        px: 4,
        transition: 'all 0.3s ease',
        bgcolor: popular ? 'secondary.main' : alpha(theme.palette.primary.main, 0.9),
        color: popular ? 'secondary.contrastText' : 'primary.contrastText',
        '&:hover': {
            bgcolor: popular ? 'secondary.dark' : 'primary.main',
            boxShadow: `0 10px 30px ${alpha(popular ? theme.palette.secondary.main : theme.palette.primary.main, 0.4)}`
        }
    }),
    card: (theme: Theme) => ({
        borderRadius: 2,
        border: '1px solid',
        borderColor: theme.palette.divider,
        bgcolor: alpha(theme.palette.background.paper, 0.4),
        backdropFilter: 'blur(24px)',
        height: '100%'
    })
};
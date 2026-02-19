import { Box, Container, Typography, Divider } from '@mui/material';

const styles = {
    pageContainer: {
        bgcolor: 'background.default',
        pt: 20,
        pb: 20
    },
    headerBox: {
        mb: 10
    },
    headerTitle: {
        mt: 2
    },
    lastUpdated: {
        mt: 4,
        color: 'text.secondary'
    },
    sectionBox: {
        mb: 8
    },
    sectionTitle: {
        mb: 3,
        color: 'text.primary'
    },
    sectionContent: {
        color: 'text.secondary',
        lineHeight: 1.8,
        fontSize: '1.1rem'
    },
    divider: {
        mt: 6,
        opacity: 0.1
    },
    footerBox: {
        mt: 10,
        p: 4,
        bgcolor: 'secondary.main',
        border: '1px solid rgba(255,255,255,0.05)'
    },
    footerText: {
        color: 'text.secondary'
    }
};

export default function TermsPage() {
    const sections = [
        {
            title: '1. Acceptance of Terms',
            content: 'By accessing or using the FITNESS STUDIO platform, you agree to be bound by these Terms of Service and all applicable laws and regulations.'
        },
        {
            title: '2. Membership & Billing',
            content: 'Memberships are billed in advance on a monthly or annual basis. You are responsible for all charges incurred under your account.'
        },
        {
            title: '3. Use of Services',
            content: 'You agree to use our services only for lawful purposes and in a way that does not infringe the rights of others or restrict their use of the platform.'
        },
        {
            title: '4. Limitation of Liability',
            content: 'FITNESS STUDIO shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use our services.'
        }
    ];

    return (
        <Box sx={styles.pageContainer}>
            <Container maxWidth="md">
                <Box sx={styles.headerBox}>
                    <Typography variant="overline" color="primary.main" fontWeight={900} letterSpacing={4}>
                        LEGAL
                    </Typography>
                    <Typography variant="h2" fontWeight={900} sx={styles.headerTitle}>
                        TERMS OF SERVICE
                    </Typography>
                    <Typography variant="body1" sx={styles.lastUpdated}>
                        Last Updated: February 19, 2026
                    </Typography>
                </Box>

                <Box component="article">
                    {sections.map((section, i) => (
                        <Box key={i} sx={styles.sectionBox}>
                            <Typography variant="h5" fontWeight={800} sx={styles.sectionTitle}>
                                {section.title}
                            </Typography>
                            <Typography variant="body1" sx={styles.sectionContent}>
                                {section.content}
                            </Typography>
                            {i < sections.length - 1 && <Divider sx={styles.divider} />}
                        </Box>
                    ))}
                </Box>

                <Box sx={styles.footerBox}>
                    <Typography variant="body2" sx={styles.footerText}>
                        By using FITNESS STUDIO, you acknowledge that you have read and understood these terms.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}

import { Box, Container, Typography, Divider } from '@mui/material';

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
        <Box sx={{ bgcolor: 'background.default', pt: 20, pb: 20 }}>
            <Container maxWidth="md">
                <Box sx={{ mb: 10 }}>
                    <Typography variant="overline" color="primary.main" fontWeight={900} letterSpacing={4}>
                        LEGAL
                    </Typography>
                    <Typography variant="h2" fontWeight={900} sx={{ mt: 2 }}>
                        TERMS OF SERVICE
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 4, color: 'text.secondary' }}>
                        Last Updated: February 19, 2026
                    </Typography>
                </Box>

                <Box component="article">
                    {sections.map((section, i) => (
                        <Box key={i} sx={{ mb: 8 }}>
                            <Typography variant="h5" fontWeight={800} mb={3} color="text.primary">
                                {section.title}
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, fontSize: '1.1rem' }}>
                                {section.content}
                            </Typography>
                            {i < sections.length - 1 && <Divider sx={{ mt: 6, opacity: 0.1 }} />}
                        </Box>
                    ))}
                </Box>

                <Box sx={{ mt: 10, p: 4, bgcolor: 'secondary.main', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        By using FITNESS STUDIO, you acknowledge that you have read and understood these terms.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}

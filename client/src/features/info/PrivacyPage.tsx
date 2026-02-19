import { Box, Container, Typography, Divider, Link } from '@mui/material';

export default function PrivacyPage() {
    const sections = [
        {
            title: '1. Information We Collect',
            content: 'We collect information you provide directly to us when you create an account, purchase a membership, or communicate with us. This includes your name, email, payment information, and fitness data.'
        },
        {
            title: '2. How We Use Information',
            content: 'We use the information we collect to provide, maintain, and improve our services, including personalize your experience, processing transactions, and sending you technical notices.'
        },
        {
            title: '3. Sharing of Information',
            content: 'We do not share your personal information with third parties except as described in this Privacy Policy, such as with your consent or for legal purposes.'
        },
        {
            title: '4. Security',
            content: 'We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access.'
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
                        PRIVACY POLICY
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
                        Questions about our privacy practices? Contact us at <Link href="mailto:privacy@fstudio.io" color="primary.main">privacy@fstudio.io</Link>.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}

import { Box, Typography, useTheme, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function Footer() {
    const theme = useTheme();
    const currentYear = new Date().getFullYear();

    return (
        <Box
            component="footer"
            sx={{
                py: 3,
                px: 2,
                mt: 'auto',
                borderTop: `1px solid ${theme.palette.divider}`,
                bgcolor: 'background.paper',
                textAlign: 'center',
            }}
        >
            <Typography variant="body2" color="text.secondary">
                &copy; {currentYear} Fitness Studio. All rights reserved.
            </Typography>
            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', gap: 3 }}>
                <Link component={RouterLink} to="/privacy" color="inherit" underline="hover" variant="caption">
                    Privacy Policy
                </Link>
                <Link component={RouterLink} to="/terms" color="inherit" underline="hover" variant="caption">
                    Terms of Service
                </Link>
                <Link component={RouterLink} to="/contact" color="inherit" underline="hover" variant="caption">
                    Contact Support
                </Link>
            </Box>
        </Box>
    );
}

import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Modular Components
import { ScrollToTop } from './components/ScrollToTop';
import { LandingHero } from './components/LandingHero';
import { LandingStats } from './components/LandingStats';
import { LandingFeatures } from './components/LandingFeatures';
import { LandingAppPreview } from './components/LandingAppPreview';
import { LandingTestimonials } from './components/LandingTestimonials';
import { LandingPricing } from './components/LandingPricing';
import { LandingFooterCTA } from './components/LandingFooterCTA';
import { CursorFollower } from './components/CursorFollower';

export default function LandingPage() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const handleCTA = () => {
        if (isAuthenticated) {
            navigate('/dashboard');
        } else {
            navigate('/login');
        }
    };

    return (
        <Box sx={{ bgcolor: 'background.default', color: 'text.primary', minHeight: '100vh', overflow: 'hidden' }}>
            {/* Custom Cursor */}
            <CursorFollower  />

            {/* Interactive Scroll Tracker */}
            <ScrollToTop />

            {/* Cinematic Sections */}
            <LandingHero isAuthenticated={isAuthenticated} onCTA={handleCTA} />

            <LandingStats />

            <LandingFeatures />

            <LandingAppPreview isAuthenticated={isAuthenticated} />

            <LandingTestimonials />

            <LandingPricing isAuthenticated={isAuthenticated} />

            <LandingFooterCTA isAuthenticated={isAuthenticated} onCTA={handleCTA} />
        </Box>
    );
}

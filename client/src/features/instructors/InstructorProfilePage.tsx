import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Avatar, Paper, Chip, Button, List, ListItem, ListItemText, Rating } from '@mui/material';
import api from '../../services/api';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ReviewSection from '../../components/reviews/ReviewSection';
import { useAuth } from '../../context/AuthContext';
import type { User, ClassSession } from '../../types';

const styles = {
  backButton: { mb: 2 },
  profilePaper: { p: 4, mb: 4 },
  avatar: { width: 120, height: 120, fontSize: 40 },
  specialtiesContainer: { display: 'flex', gap: 1, my: 2, flexWrap: 'wrap' },
  certificationsContainer: { display: 'flex', gap: 1, flexWrap: 'wrap' },
  certificationChip: { bgcolor: '#eff6ff', color: '#8e0b0bff' }
};

export default function InstructorProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<{ instructor: User; upcomingClasses: ClassSession[] } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/users/instructors/${id}`);
        setData(res.data.data);
      } catch (error) {
        console.error("Failed to load instructor");
      }
    };
    fetchProfile();
  }, [id]);

  if (!data) return <Typography>Loading...</Typography>;

  const { instructor, upcomingClasses } = data;

  return (
    <Box>
      <Button onClick={() => navigate(-1)} sx={styles.backButton}>&larr; Back</Button>

      <Paper sx={styles.profilePaper}>
        <Box display="flex" gap={4} alignItems="center" flexWrap="wrap">
          <Box>
            <Avatar
              src={instructor.profileImage || "/default-avatar.png"}
              sx={styles.avatar}
            >
              {instructor.fullName[0]}
            </Avatar>
          </Box>
          <Box flex={1} minWidth={300}>
            <Box display="flex" justifyContent="space-between" alignItems="start">
              <Box>
                <Typography variant="h4">{instructor.fullName}</Typography>
                <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                  <Rating value={instructor.averageRating || 0} precision={0.5} readOnly size="small" />
                  <Typography variant="subtitle2" color="text.secondary">
                    ({instructor.totalRatings || 0} reviews)
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={styles.specialtiesContainer}>
              {instructor.specialties?.map((tag: string) => (
                <Chip key={tag} label={tag} color="primary" variant="outlined" />
              ))}
            </Box>

            <Typography variant="body1" color="text.secondary" paragraph>
              {instructor.bio || "No bio available for this instructor."}
            </Typography>

            {instructor.certifications && instructor.certifications.length > 0 && (
              <Box mt={2}>
                <Typography variant="subtitle2" gutterBottom>Certifications</Typography>
                <Box sx={styles.certificationsContainer}>
                  {instructor.certifications.map((cert: { name: string; expiryDate: string }) => {
                    const isExpired = cert.expiryDate && new Date(cert.expiryDate) < new Date();
                    return (
                      <Chip
                        key={cert.name}
                        label={`${cert.name}${cert.expiryDate ? ` (Exp: ${new Date(cert.expiryDate).toLocaleDateString()})` : ''}${isExpired ? ' - EXPIRED' : ''}`}
                        size="small"
                        variant="filled"
                        sx={{
                          ...styles.certificationChip,
                          ...(isExpired && { bgcolor: '#fee2e2', color: '#991b1b', border: '1px solid #ef4444' })
                        }}
                      />
                    );
                  })}
                </Box>
                {instructor.certifications.some((c: { name: string; expiryDate: string }) => c.expiryDate && new Date(c.expiryDate) < new Date()) && (
                  <Box mt={2} p={2} sx={{ bgcolor: '#fff5f5', border: '1px dashed #feb2b2', borderRadius: 1 }}>
                    <Typography variant="caption" color="error" fontWeight={700} display="block" mb={1}>
                      CRITICAL: EXPIRED CERTIFICATIONS DETECTED. PERSONNEL REQUIRES IMMEDIATE COMPLIANCE REVIEW.
                    </Typography>
                    {user?.role === 'STUDIO_ADMIN' && (
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        onClick={() => navigate('/schedule')}
                      >
                        SUGGEST REPLACEMENT FROM THIS STUDIO
                      </Button>
                    )}
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </Paper>

      <Box display="flex" gap={4} flexDirection={{ xs: 'column', md: 'row' }}>
        <Box flex={1}>
          <Typography variant="h5" gutterBottom>Upcoming Classes</Typography>
          <Paper>
            <List>
              {upcomingClasses.map((cls: ClassSession) => (
                <ListItem
                  key={cls._id}
                  divider
                  secondaryAction={
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<CalendarMonthIcon />}
                      onClick={() => navigate('/schedule')}
                    >
                      View
                    </Button>
                  }
                >
                  <ListItemText
                    primary={cls.title}
                    secondary={`${new Date(cls.startTime).toLocaleString()} • ${cls.type}`}
                  />
                </ListItem>
              ))}
              {upcomingClasses.length === 0 && (
                <ListItem><ListItemText primary="No upcoming classes scheduled." /></ListItem>
              )}
            </List>
          </Paper>
        </Box>

        <Box flex={1}>
          <Typography variant="h5" gutterBottom>Member Reviews</Typography>
          <ReviewSection
            targetType="INSTRUCTOR"
            targetId={instructor._id}
            targetName={instructor.fullName}
          />
        </Box>
      </Box>
    </Box>
  );
}
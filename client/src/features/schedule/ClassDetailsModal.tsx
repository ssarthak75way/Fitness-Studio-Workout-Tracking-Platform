
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, Chip, Divider
} from '@mui/material';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ReviewSection from '../../components/reviews/ReviewSection';

interface ClassEventProps {
  id: string;
  title: string;
  start: Date;
  end: Date;
  extendedProps: {
    instructor?: {
      _id: string;
      fullName: string;
    };
    instructorName?: string; // Fallback
    description?: string;
    capacity: number;
    enrolledCount: number;
    location?: string;
  };
}

interface Props {
  event: ClassEventProps | null;
  open: boolean;
  onClose: () => void;
  onBookingSuccess: () => void;
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  infoBox: { display: 'flex', alignItems: 'center', mb: 1, gap: 1 },
  instructorLink: { textDecoration: 'none', color: '#1976d2', fontWeight: 600 },
  locationBox: { display: 'flex', alignItems: 'center', mb: 2, gap: 1 },
  divider: { my: 1 },
  description: { color: 'text.secondary' },
  largeDivider: { my: 3 }
};

export default function ClassDetailsModal({ event, open, onClose, onBookingSuccess }: Props) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  if (!event) return null;

  const isFull = event.extendedProps.enrolledCount >= event.extendedProps.capacity;
  const spotsLeft = event.extendedProps.capacity - event.extendedProps.enrolledCount;
  const instructor = event.extendedProps.instructor;
  const instructorName = instructor?.fullName || event.extendedProps.instructorName || 'TBA';

  const handleBook = async () => {
    setLoading(true);
    try {
      await api.post('/bookings', { classId: event.id });
      onBookingSuccess(); // Refresh calendar
      onClose();
      showToast(isFull ? 'You have been added to the waitlist!' : 'Class booked successfully!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to book class', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle component="div" sx={styles.header}>
        {event.title}
        <Chip
          label={isFull ? "WAITLIST OPEN" : `${spotsLeft} spots left`}
          color={isFull ? "warning" : "success"}
          size="small"
        />
      </DialogTitle>

      <DialogContent dividers>


        <Box sx={styles.infoBox}>
          <AccessTimeIcon color="action" />
          <Typography>
            {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
            {event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Typography>
        </Box>

        <Box sx={styles.infoBox}>
          <PersonIcon color="action" />
          <Typography>
            Instructor: {' '}
            {instructor ? (
              <Link to={`/instructors/${instructor._id}`} style={styles.instructorLink}>
                {instructorName}
              </Link>
            ) : (
              instructorName
            )}
          </Typography>
        </Box>

        {event.extendedProps.location && (
          <Box sx={styles.locationBox}>
            <LocationOnIcon color="action" />
            <Typography>{event.extendedProps.location}</Typography>
          </Box>
        )}

        {event.extendedProps.description && (
          <>
            <Divider sx={styles.divider} />
            <Typography variant="body2" sx={styles.description}>
              {event.extendedProps.description}
            </Typography>
          </>
        )}

        <Divider sx={styles.largeDivider} />
        <Typography variant="h6" gutterBottom>Reviews</Typography>
        <ReviewSection
          targetType="CLASS"
          targetId={event.id}
          targetName={event.title}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Close</Button>
        {user?.role === 'MEMBER' && (
          <Button
            variant="contained"
            onClick={handleBook}
            disabled={loading}
            color={isFull ? "warning" : "primary"}
          >
            {loading ? 'Processing...' : isFull ? 'Join Waitlist' : 'Book Class'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
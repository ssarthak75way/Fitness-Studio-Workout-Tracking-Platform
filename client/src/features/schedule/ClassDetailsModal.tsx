
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, Chip, Divider, Alert
} from '@mui/material';
import { useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
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
    instructorName: string;
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

export default function ClassDetailsModal({ event, open, onClose, onBookingSuccess }: Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!event) return null;

  const isFull = event.extendedProps.enrolledCount >= event.extendedProps.capacity;
  const spotsLeft = event.extendedProps.capacity - event.extendedProps.enrolledCount;

  const handleBook = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.post('/bookings', { classId: event.id });
      onBookingSuccess(); // Refresh calendar
      onClose();
      alert('Class booked successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to book class');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {event.title}
        <Chip
          label={isFull ? "FULL" : `${spotsLeft} spots left`}
          color={isFull ? "error" : "success"}
          size="small"
        />
      </DialogTitle>

      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
          <AccessTimeIcon color="action" />
          <Typography>
            {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
            {event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
          <PersonIcon color="action" />
          <Typography>Instructor: {event.extendedProps.instructorName}</Typography>
        </Box>

        {event.extendedProps.location && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
            <LocationOnIcon color="action" />
            <Typography>{event.extendedProps.location}</Typography>
          </Box>
        )}

        {event.extendedProps.description && (
          <>
            <Divider sx={{ my: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {event.extendedProps.description}
            </Typography>
          </>
        )}

        <Divider sx={{ my: 3 }} />
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
            disabled={loading || isFull}
            color="primary"
          >
            {loading ? 'Booking...' : isFull ? 'Join Waitlist' : 'Book Class'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
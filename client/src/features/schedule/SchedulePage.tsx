import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, useTheme, Card, alpha, Chip, Stack } from '@mui/material';
import type { EventInput, EventClickArg } from '@fullcalendar/core';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { classService } from '../../services/class.service';
import { bookingService } from '../../services/booking.service';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import CreateClassModal from './CreateClassModal';
import AddIcon from '@mui/icons-material/Add';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import type { Theme } from '@mui/material';
import type { ClassSession } from '../../types';
const styles = {
  pageContainer: { maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 3 } },
  headerTitle: (theme: Theme) => ({
    background: `linear-gradient(45deg, ${theme.palette.text.primary} 30%, ${theme.palette.primary.main} 90%)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  }),
  createButton: (theme: Theme) => ({
    borderRadius: 2,
    px: 3,
    boxShadow: `0 8px 16px -4px ${alpha(theme.palette.primary.main, 0.3)}`
  }),
  calendarCard: (theme: Theme) => ({
    p: 0,
    overflow: 'hidden',
    boxShadow: theme.shadows[3],
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 3,
    bgcolor: 'background.paper',
    '& .fc': {
      fontFamily: theme.typography.fontFamily,
      '--fc-border-color': theme.palette.divider,
      '--fc-page-bg-color': theme.palette.background.paper,
      '--fc-neutral-bg-color': theme.palette.action.hover,
      '--fc-list-event-hover-bg-color': theme.palette.action.hover,
      '--fc-today-bg-color': alpha(theme.palette.primary.main, 0.04),
      '--fc-now-indicator-color': theme.palette.secondary.main,
      '--fc-button-bg-color': theme.palette.primary.main,
      '--fc-button-border-color': theme.palette.primary.main,
      '--fc-button-hover-bg-color': theme.palette.primary.dark,
      '--fc-button-hover-border-color': theme.palette.primary.dark,
      '--fc-button-active-bg-color': theme.palette.primary.dark,
      '--fc-button-active-border-color': theme.palette.primary.dark,
    },
    '& .fc-theme-standard td, & .fc-theme-standard th': {
      borderColor: theme.palette.divider,
    },
    '& .fc-col-header-cell': {
      bgcolor: alpha(theme.palette.background.default, 0.6),
      py: 2,
      textTransform: 'uppercase',
      fontSize: '0.75rem',
      letterSpacing: '0.05em',
      fontWeight: 600,
      color: theme.palette.text.secondary
    },
    '& .fc-timegrid-slot': {
      height: '40px !important',
    },
    '& .fc-timegrid-slot-label': {
      color: theme.palette.text.secondary,
      fontSize: '0.8rem',
      fontWeight: 500
    },
    '& .fc-event': {
      border: 'none',
      boxShadow: 'none',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'scale(1.02)'
      }
    },
    '& .fc-toolbar.fc-header-toolbar': {
      p: 2,
      mb: 0
    },
    '& .fc-button': {
      borderRadius: 8,
      textTransform: 'capitalize',
      fontWeight: 600,
      fontSize: '0.875rem'
    }
  }),
  eventContent: (theme: Theme) => ({
    bgcolor: alpha(theme.palette.primary.main, 0.15),
    color: theme.palette.primary.main,
    borderLeft: `3px solid ${theme.palette.primary.main}`,
    p: 0.5,
    height: '100%',
    width: '100%',
    overflow: 'hidden',
    borderRadius: '4px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  }),
  eventTime: { lineHeight: 1.2 },
  eventTitle: { fontWeight: 500 },
  dialogPaper: { borderRadius: 3 },
  dialogTitleChip: { mt: 1, fontWeight: 600 },
  dialogContentContainer: { display: 'flex', flexDirection: 'column', gap: 2, mt: 1 },
  detailsStack: (theme: Theme) => ({
    bgcolor: alpha(theme.palette.background.default, 0.5),
    p: 2,
    borderRadius: 2
  }),
  instructorLink: { textDecoration: 'none', color: 'inherit' },
  instructorText: { color: 'primary.main', '&:hover': { textDecoration: 'underline' } },
  capacityContainer: { width: '100%', mr: 1, position: 'relative' },
  progressBarBackground: (theme: Theme) => ({
    height: 8,
    borderRadius: 4,
    bgcolor: alpha(theme.palette.primary.main, 0.1),
    overflow: 'hidden'
  }),
  progressBarFill: (theme: Theme, percentage: number) => ({
    height: '100%',
    width: `${percentage}%`,
    bgcolor: theme.palette.primary.main,
  }),
  dialogActions: { p: 3, pt: 0 },
  closeButton: { fontWeight: 600 },
  bookButton: { borderRadius: 2, px: 4 }
};

export default function SchedulePage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const theme = useTheme();
  const [events, setEvents] = useState<EventInput[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassSession | null>(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await classService.getClasses();
      const classes = response.data.classes;
      const calendarEvents = classes.map((cls: ClassSession) => ({
        id: cls._id,
        title: cls.title,
        start: cls.startTime,
        end: cls.endTime,
        extendedProps: cls,
      }));
      setEvents(calendarEvents);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  };

  const handleEventClick = (info: EventClickArg) => {
    setSelectedClass(info.event.extendedProps as ClassSession);
    setOpenDetails(true);
  };

  const handleBookClass = async () => {
    if (!selectedClass) return;
    try {
      const response = await bookingService.createBooking(selectedClass._id);
      const status = response.data.booking.status;

      if (status === 'WAITLISTED') {
        showToast('You have been added to the waitlist.', 'warning');
      } else {
        showToast('Class booked successfully!', 'success');
      }

      setOpenDetails(false);
    } catch (error: unknown) { // axios error catch is usually any or unknown
      showToast((error as Error)?.message || 'Booking failed', 'error');
    }
  };

  const renderEventContent = (eventInfo: { timeText: string, event: { title: string } }) => {
    return (
      <Box sx={styles.eventContent(theme)}>
        <Typography variant="caption" noWrap fontWeight="bold" sx={styles.eventTime}>
          {eventInfo.timeText}
        </Typography>
        <Typography variant="caption" noWrap sx={styles.eventTitle}>
          {eventInfo.event.title}
        </Typography>
      </Box>
    );
  };

  return (
    <Box sx={styles.pageContainer}>
      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'start', sm: 'center' }} mb={4} gap={2}>
        <Box>
          <Typography variant="h4" fontWeight="800" sx={styles.headerTitle(theme)}>
            Class Schedule
          </Typography>
          <Typography variant="body1" color="text.secondary" mt={0.5}>
            Browse and book your weekly classes.
          </Typography>
        </Box>
        {(user?.role === 'INSTRUCTOR' || user?.role === 'STUDIO_ADMIN') && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreate(true)}
            sx={styles.createButton(theme)}
          >
            Create Class
          </Button>
        )}
      </Box>

      <Card sx={styles.calendarCard(theme)}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek'
          }}
          allDaySlot={false}
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          events={events}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          height="auto"
        />
      </Card>

      {/* Class Details Dialog */}
      <Dialog
        open={openDetails}
        onClose={() => setOpenDetails(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: styles.dialogPaper }}
        TransitionProps={{ timeout: 300 }}
      >
        {selectedClass && (
          <>
            <DialogTitle component="div" sx={{ pb: 1 }}>
              <Typography variant="h5" fontWeight="700">{selectedClass.title}</Typography>
              <Chip
                label={selectedClass.type}
                size="small"
                color="primary"
                variant="outlined"
                sx={styles.dialogTitleChip}
              />
            </DialogTitle>
            <DialogContent>
              <Box sx={styles.dialogContentContainer}>
                <Typography variant="body1" color="text.secondary">
                  {selectedClass.description || "No description provided."}
                </Typography>

                <Stack direction="row" spacing={3} sx={styles.detailsStack(theme)}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <AccessTimeIcon color="action" fontSize="small" />
                    <Box>
                      <Typography variant="caption" display="block" color="text.secondary">Time</Typography>
                      <Typography variant="body2" fontWeight="600">
                        {new Date(selectedClass.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(selectedClass.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <LocationOnIcon color="action" fontSize="small" />
                    <Box>
                      <Typography variant="caption" display="block" color="text.secondary">Location</Typography>
                      <Typography variant="body2" fontWeight="600">{selectedClass.location}</Typography>
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <PersonIcon color="action" fontSize="small" />
                    <Box>
                      <Typography variant="caption" display="block" color="text.secondary">Instructor</Typography>
                      {selectedClass.instructor && typeof selectedClass.instructor === 'object' ? (
                        <Link to={`/instructors/${selectedClass.instructor._id}`} style={styles.instructorLink}>
                          <Typography variant="body2" fontWeight="600" sx={styles.instructorText}>
                            {selectedClass.instructor.fullName}
                          </Typography>
                        </Link>
                      ) : (
                        <Typography variant="body2" fontWeight="600">
                          {typeof selectedClass.instructor === 'string' ? selectedClass.instructor : "TBA"}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Stack>

                <Box>
                  <Typography variant="subtitle2" gutterBottom>Capacity</Typography>
                  <Box sx={styles.capacityContainer}>
                    <Box sx={styles.progressBarBackground(theme)}>
                      <Box sx={styles.progressBarFill(theme, (selectedClass.enrolledCount / selectedClass.capacity) * 100)} />
                    </Box>
                    <Box display="flex" justifyContent="space-between" mt={0.5}>
                      <Typography variant="caption" color="text.secondary">
                        {selectedClass.enrolledCount} enrolled
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selectedClass.capacity} max
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={styles.dialogActions}>
              <Button onClick={() => setOpenDetails(false)} color="inherit" sx={styles.closeButton}>Close</Button>
              {user?.role === 'MEMBER' && (
                <Button
                  variant="contained"
                  onClick={handleBookClass}
                  size="large"
                  disabled={false} // Always enabled to allow waitlist
                  color={selectedClass.enrolledCount >= selectedClass.capacity ? "warning" : "primary"}
                  sx={styles.bookButton}
                >
                  {selectedClass.enrolledCount >= selectedClass.capacity ? 'Join Waitlist' : 'Book Class'}
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Create Class Modal */}
      <CreateClassModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSuccess={() => {
          fetchClasses();
        }}
      />
    </Box>
  );
}
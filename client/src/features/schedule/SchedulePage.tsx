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
      ? `linear-gradient(rgba(6, 9, 15, 0.75), rgba(6, 9, 15, 1)), url(https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070&auto=format&fit=crop)`
      : `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.95)), url(https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070&auto=format&fit=crop)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: 4,
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
    '&::before': {
      content: '"SCHEDULE"',
      position: 'absolute',
      top: '15%',
      left: '5%',
      fontSize: { xs: '5rem', md: '12rem' },
      fontWeight: 950,
      color: theme.palette.mode === 'dark' ? alpha('#fff', 0.03) : alpha('#000', 0.03),
      letterSpacing: '30px',
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
      textShadow: `0 0 40px ${alpha(theme.palette.primary.main, 0.5)}`
    }
  }),
  sectionLabel: {
    color: 'primary.main',
    fontWeight: 900,
    letterSpacing: '5px',
    mb: 2,
    display: 'block',
    textTransform: 'uppercase',
    fontSize: '0.7rem',
    opacity: 0.8
  },
  createButton: (theme: Theme) => ({
    borderRadius: 0,
    px: 4,
    py: 1.5,
    fontWeight: 900,
    letterSpacing: '1px',
    boxShadow: `0 8px 32px -8px ${alpha(theme.palette.primary.main, 0.4)}`,
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: `0 12px 40px -8px ${alpha(theme.palette.primary.main, 0.6)}`,
    }
  }),
  contentWrapper: {
    px: { xs: 3, md: 6 },
    py: { xs: 4, md: 8 },
    flexGrow: 1,
    position: 'relative',
    zIndex: 1
  },
  calendarCard: (theme: Theme) => ({
    p: 0,
    overflow: 'hidden',
    borderRadius: 2,
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.4) : alpha(theme.palette.background.paper, 0.8),
    backdropFilter: 'blur(24px) saturate(180%)',
    boxShadow: theme.palette.mode === 'dark'
      ? `inset 0 0 20px -10px ${alpha('#fff', 0.05)}, 0 20px 50px -20px rgba(0,0,0,0.5)`
      : `0 20px 50px -20px ${alpha(theme.palette.common.black, 0.05)}`,
    '& .fc': {
      fontFamily: theme.typography.fontFamily,
      '--fc-border-color': alpha(theme.palette.divider, 0.1),
      '--fc-page-bg-color': 'transparent',
      '--fc-neutral-bg-color': alpha(theme.palette.action.hover, 0.05),
      '--fc-list-event-hover-bg-color': alpha(theme.palette.action.hover, 0.1),
      '--fc-today-bg-color': alpha(theme.palette.primary.main, 0.05),
      '--fc-now-indicator-color': theme.palette.secondary.main,
      '--fc-button-bg-color': alpha(theme.palette.background.paper, 0.1),
      '--fc-button-border-color': alpha(theme.palette.divider, 0.1),
      '--fc-button-hover-bg-color': alpha(theme.palette.primary.main, 0.8),
      '--fc-button-hover-border-color': theme.palette.primary.main,
      '--fc-button-active-bg-color': theme.palette.primary.main,
      '--fc-button-active-border-color': theme.palette.primary.main,
      '--fc-button-text-color': 'text.primary',
    },
    '& .fc-header-toolbar': {
      p: 3,
      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
      background: alpha(theme.palette.background.paper, 0.2),
    },
    '& .fc-toolbar-title': {
      fontWeight: 900,
      letterSpacing: '-1px',
      textTransform: 'uppercase',
      fontSize: '1.5rem !important'
    },
    '& .fc-col-header-cell': {
      bgcolor: alpha(theme.palette.background.default, 0.4),
      py: 2.5,
      textTransform: 'uppercase',
      fontSize: '0.7rem',
      letterSpacing: '3px',
      fontWeight: 900,
      color: alpha(theme.palette.text.secondary, 0.8)
    },
    '& .fc-timegrid-slot': {
      height: '80px !important',
    },
    '& .fc-timegrid-slot-label': {
      color: alpha(theme.palette.text.secondary, 0.6),
      fontSize: '0.75rem',
      fontWeight: 700,
      textTransform: 'uppercase',
      verticalAlign: 'middle !important'
    },
    '& .fc-event': {
      border: 'none',
      background: 'transparent',
      borderRadius: 1,
      overflow: 'hidden'
    },
    '& .fc-button': {
      borderRadius: 0,
      fontWeight: 900,
      letterSpacing: '1px',
      fontSize: '0.75rem',
      textTransform: 'uppercase',
      transition: 'all 0.3s ease'
    }
  }),
  eventContent: (theme: Theme) => ({
    bgcolor: alpha(theme.palette.primary.main, 0.1),
    backdropFilter: 'blur(10px)',
    color: theme.palette.mode === 'dark' ? '#fff' : theme.palette.text.primary,
    borderLeft: `4px solid ${theme.palette.primary.main}`,
    p: 1.5,
    height: '50%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    boxShadow: `inset 0 0 20px ${alpha(theme.palette.primary.main, 0.05)}`,
    '&:hover': {
      bgcolor: alpha(theme.palette.primary.main, 0.2),
      transform: 'scale(1.02)',
    }
  }),
  eventTime: { opacity: 0.6, fontSize: '0.7rem' },
  eventTitle: { fontWeight: 900, letterSpacing: '-0.5px', fontSize: '0.85rem' },
  dialogPaper: (theme: Theme) => ({
    borderRadius: 2,
    bgcolor: 'background.default',
    backgroundImage: theme.palette.mode === 'dark'
      ? `linear-gradient(rgba(6, 9, 15, 0.8), rgba(6, 9, 15, 1))`
      : 'none',
    border: `1px solid ${theme.palette.divider}`,
    overflow: 'hidden'
  }),
  dialogTitleChip: (theme: Theme) => ({ borderRadius: 0, fontWeight: 900, letterSpacing: '2px', border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }),
  dialogContentContainer: { display: 'flex', flexDirection: 'column', gap: 4, mt: 2 },
  detailsStack: (theme: Theme) => ({
    bgcolor: alpha(theme.palette.background.paper, 0.4),
    p: 3,
    borderRadius: 1.5,
    border: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
    gap: 4
  }),
  instructorLink: { textDecoration: 'none', color: 'inherit' },
  instructorText: { color: 'primary.main', fontWeight: 900, '&:hover': { textDecoration: 'underline' } },
  capacityContainer: { width: '100%', position: 'relative' },
  progressBarBackground: (theme: Theme) => ({
    height: 6,
    borderRadius: 0,
    bgcolor: alpha(theme.palette.primary.main, 0.1),
    overflow: 'hidden'
  }),
  progressBarFill: (theme: Theme, percentage: number) => ({
    height: '100%',
    width: `${percentage}%`,
    bgcolor: theme.palette.primary.main,
    boxShadow: `0 0 15px ${alpha(theme.palette.primary.main, 0.4)}`
  }),
  dialogActions: { p: 4, pt: 0 },
  closeButton: { fontWeight: 900, letterSpacing: '1px' },
  bookButton: (theme: Theme) => ({
    borderRadius: 0,
    px: 6,
    py: 2,
    fontWeight: 900,
    letterSpacing: '2px',
    boxShadow: theme.palette.mode === 'dark' ? `0 0 30px ${alpha('#fff', 0.1)}` : 'none'
  })
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
      showToast('Failed to load class schedule', 'error');
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
      {/* Cinematic Hero */}
      <Box sx={styles.headerHero(theme)}>
        <Box>
          <Typography sx={styles.sectionLabel}>GLOBAL ACCESS</Typography>
          <Typography variant="h1" sx={styles.headerTitle(theme)}>
            STUDIO <Box component="span">SCHEDULE</Box>
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 600, fontWeight: 400, lineHeight: 1.6 }}>
            Your weekly roadmap to elite performance. Secure your spot in the next session and master your discipline.
          </Typography>
        </Box>
        <Box>
          {(user?.role === 'INSTRUCTOR' || user?.role === 'STUDIO_ADMIN') && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenCreate(true)}
              sx={styles.createButton(theme)}
            >
              CREATE CLASS
            </Button>
          )}
        </Box>
      </Box>

      <Box sx={styles.contentWrapper}>
        <Typography sx={styles.sectionLabel}>TIME GRID</Typography>
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
      </Box>

      {/* Class Details Dialog */}
      <Dialog
        open={openDetails}
        onClose={() => setOpenDetails(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: styles.dialogPaper(theme) }}
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
                sx={styles.dialogTitleChip(theme)}
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
                  sx={styles.bookButton(theme)}
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
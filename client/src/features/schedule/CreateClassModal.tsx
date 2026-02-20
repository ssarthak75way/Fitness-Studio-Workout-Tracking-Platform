import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../services/api';
import { instructorService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { studioService } from '../../services/studio.service';
import type { User, Studio } from '../../types';

// Zod Schema matches Backend Validation
const createClassSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().optional(),
  type: z.enum(['YOGA', 'PILATES', 'HIIT', 'STRENGTH', 'CARDIO']),
  startTime: z.string().min(1, 'Start time is required'),
  durationMinutes: z.coerce.number().min(15).max(180),
  capacity: z.coerce.number().min(1),
  location: z.string().optional(),
  studioId: z.string().min(1, 'Studio is required'),
  instructorId: z.string().optional(),
  isRecurring: z.boolean().optional().default(false),
  recurrenceFrequency: z.enum(['DAILY', 'WEEKLY']).optional(),
  recurrenceCount: z.coerce.number().min(1).max(52).optional(),
});

type CreateClassForm = z.infer<typeof createClassSchema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const styles = {
  formContainer: { display: 'flex', flexDirection: 'column', gap: 2 },
  formRow: { display: 'flex', gap: 2 },
  recurringSection: { display: 'flex', gap: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2 }
};

export default function CreateClassModal({ open, onClose, onSuccess }: Props) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [instructors, setInstructors] = useState<User[]>([]);
  const [studios, setStudios] = useState<Studio[]>([]);

  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<CreateClassForm>({
    resolver: zodResolver(createClassSchema) as unknown as Resolver<CreateClassForm>,
    defaultValues: {
      title: '',
      description: '',
      type: 'YOGA',
      durationMinutes: 60,
      capacity: 20,
      location: 'Main Studio',
      studioId: '',
      instructorId: user?._id || '',
      isRecurring: false,
      recurrenceFrequency: 'WEEKLY',
      recurrenceCount: 4,
    },
  });

  const isRecurring = watch('isRecurring');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [instRes, studioRes] = await Promise.all([
          instructorService.getInstructors(),
          studioService.getStudios()
        ]);
        setInstructors(instRes.data.instructors);
        setStudios(studioRes.data.studios);
      } catch (error) {
        console.error('Failed to fetch data', error);
      }
    };
    if (open) fetchData();
  }, [open]);

  const onSubmit = async (data: CreateClassForm) => {
    try {
      const isoDate = new Date(data.startTime).toISOString();

      await api.post('/classes', {
        ...data,
        startTime: isoDate,
      });

      onSuccess();
      showToast('Class scheduled successfully!', 'success');
      reset();
      onClose();
    } catch (error) {
      console.error('Failed to create class', error);
      showToast('Failed to create class', 'error');
    }
  };



  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Schedule New Class</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Box sx={styles.formContainer}>
            <Box>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Class Title"
                    fullWidth
                    error={!!errors.title}
                    helperText={errors.title?.message}
                  />
                )}
              />
            </Box>

            <Box>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description (Optional)"
                    fullWidth
                    multiline
                    rows={3}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                )}
              />
            </Box>

            <Box sx={styles.formRow}>
              <Box flex={1}>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Type"
                      fullWidth
                    >
                      {['YOGA', 'PILATES', 'HIIT', 'STRENGTH', 'CARDIO'].map((opt) => (
                        <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Box>

              <Box flex={1}>
                <Controller
                  name="startTime"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="datetime-local"
                      label="Start Time"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.startTime}
                    />
                  )}
                />
              </Box>
            </Box>

            <Box sx={styles.formRow}>
              <Box flex={1}>
                <Controller
                  name="studioId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Studio Location"
                      fullWidth
                      error={!!errors.studioId}
                      helperText={errors.studioId?.message}
                    >
                      {studios.map((s) => (
                        <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>
                      ))}
                      {studios.length === 0 && <MenuItem disabled>No studios found</MenuItem>}
                    </TextField>
                  )}
                />
              </Box>

              <Box flex={1}>
                <Controller
                  name="location"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Specific Room/Location"
                      fullWidth
                    />
                  )}
                />
              </Box>
            </Box>

            <Box>
              <Controller
                name="instructorId"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Assign Instructor (Optional)"
                    fullWidth
                    error={!!errors.instructorId}
                    helperText={errors.instructorId?.message || "Leave empty to create a 'Gap'"}
                    disabled={user?.role !== 'STUDIO_ADMIN'}
                  >
                    <MenuItem value=""><em>None (Schedule Gap)</em></MenuItem>
                    {instructors.map((inst) => (
                      <MenuItem key={inst._id} value={inst._id}>{inst.fullName}</MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Box>


            <Box>
              <Controller
                name="isRecurring"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={field.value} />}
                    label="Recurring Class"
                  />
                )}
              />
            </Box>

            {isRecurring && (
              <Box sx={styles.recurringSection}>
                <Box flex={1}>
                  <Controller
                    name="recurrenceFrequency"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} select label="Frequency" fullWidth>
                        <MenuItem value="DAILY">Daily</MenuItem>
                        <MenuItem value="WEEKLY">Weekly</MenuItem>
                      </TextField>
                    )}
                  />
                </Box>
                <Box flex={1}>
                  <Controller
                    name="recurrenceCount"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        type="number"
                        label="Occurrence Count"
                        fullWidth
                        inputProps={{ min: 1, max: 52 }}
                      />
                    )}
                  />
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">Schedule</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
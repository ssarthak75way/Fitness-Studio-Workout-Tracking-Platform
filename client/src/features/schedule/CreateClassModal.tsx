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
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../services/api';
import { instructorService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

// Zod Schema matches Backend Validation
const createClassSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().optional(),
  type: z.enum(['YOGA', 'PILATES', 'HIIT', 'STRENGTH', 'CARDIO']),
  startTime: z.string().min(1, 'Start time is required'),
  durationMinutes: z.coerce.number().min(15).max(180),
  capacity: z.coerce.number().min(1),
  location: z.string().optional(),
  instructorId: z.string().min(1, 'Instructor is required'),
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
  recurringSection: { display: 'flex', gap: 2, p: 2, bgcolor: '#f8fafc', borderRadius: 2 }
};

export default function CreateClassModal({ open, onClose, onSuccess }: Props) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [instructors, setInstructors] = useState<any[]>([]);

  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<CreateClassForm>({
    resolver: zodResolver(createClassSchema) as any,
    defaultValues: {
      title: '',
      description: '',
      type: 'YOGA',
      durationMinutes: 60,
      capacity: 20,
      location: 'Main Studio',
      instructorId: user?._id || '',
      isRecurring: false,
      recurrenceFrequency: 'WEEKLY',
      recurrenceCount: 4,
    },
  });

  const isRecurring = watch('isRecurring');

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const response = await instructorService.getInstructors();
        setInstructors(response.data.instructors);
      } catch (error) {
        console.error('Failed to fetch instructors', error);
      }
    };
    if (open) fetchInstructors();
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
      <form onSubmit={handleSubmit(onSubmit as any)}>
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
                  name="instructorId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Assign Instructor"
                      fullWidth
                      error={!!errors.instructorId}
                      helperText={errors.instructorId?.message}
                      disabled={user?.role !== 'STUDIO_ADMIN'}
                    >
                      {instructors.map((inst) => (
                        <MenuItem key={inst._id} value={inst._id}>{inst.fullName}</MenuItem>
                      ))}
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
                      label="Location"
                      fullWidth
                    />
                  )}
                />
              </Box>
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
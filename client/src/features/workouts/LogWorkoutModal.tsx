import { useEffect } from 'react';
import { useForm, useFieldArray, type Resolver } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Box, IconButton, Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import SetsFieldArray from './SetsFieldArray';

// Validation Schema
const setSchema = z.object({
  reps: z.coerce.number().min(1),
  weight: z.coerce.number().min(0),
});

const exerciseSchema = z.object({
  name: z.string().min(1, "Name required"),
  sets: z.array(setSchema).min(1),
  notes: z.string().optional(),
});

const workoutSchema = z.object({
  title: z.string().min(1, "Title required"),
  durationMinutes: z.coerce.number().optional(),
  exercises: z.array(exerciseSchema).min(1, "Add at least one exercise"),
  notes: z.string().optional(),
});

import type { WorkoutFormValues } from '../../types';

interface LogWorkoutModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialValues?: Partial<WorkoutFormValues> | null;
}

const styles = {
  formContainer: { display: 'flex', flexDirection: 'column', gap: 3 },
  formRow: { display: 'flex', gap: 2 },
  exerciseContainer: { mb: 3, p: 2, border: '1px solid #e2e8f0', borderRadius: 2, bgcolor: '#f8fafc' },
  exerciseHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 },
  exerciseName: { mr: 2 },
  exerciseNotes: { mt: 2 },
  addExerciseButton: { borderRadius: 2 },
  setsHeader: { display: 'flex', gap: 2, mb: 1 },
  setLabel: { width: 40, fontWeight: 'bold' },
  fieldLabel: { width: 100, fontWeight: 'bold' },
  setRow: { display: 'flex', gap: 2, mb: 1, alignItems: 'center' },
  setNumber: { width: 40 },
  setField: { width: 100 },
  addSetButton: { mt: 1 }
};

export default function LogWorkoutModal({ open, onClose, onSuccess, initialValues }: LogWorkoutModalProps) {
  const { showToast } = useToast();
  const { control, register, handleSubmit, reset, formState: { errors } } = useForm<WorkoutFormValues>({
    resolver: zodResolver(workoutSchema) as unknown as Resolver<WorkoutFormValues>,
    defaultValues: {
      title: '',
      durationMinutes: 60,
      exercises: [{ name: '', sets: [{ reps: 10, weight: 0 }] }],
      ...initialValues
    }
  });

  // Re-sync form if initialValues change (needed for templates)
  useEffect(() => {
    if (open && initialValues) {
      reset({
        title: '',
        durationMinutes: 60,
        exercises: [{ name: '', sets: [{ reps: 10, weight: 0 }] }],
        ...initialValues
      });
    }
  }, [open, initialValues, reset]);

  const { fields: exerciseFields, append: appendExercise, remove: removeExercise } = useFieldArray({
    control,
    name: "exercises"
  });

  const onSubmit = async (data: WorkoutFormValues) => {
    try {
      await api.post('/workouts', { ...data, date: new Date().toISOString() });
      onSuccess();
      showToast('Workout logged successfully!', 'success');
      reset();
      onClose();
    } catch (err) {
      console.error(err);
      showToast((err as Error).message || 'Failed to save workout', 'error');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Log Workout</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Box sx={styles.formContainer}>
            <Box sx={styles.formRow}>
              <Box flex={2}>
                <TextField
                  {...register("title")}
                  label="Workout Title"
                  fullWidth
                  error={!!errors.title}
                  helperText={errors.title?.message}
                />
              </Box>
              <Box flex={1}>
                <TextField {...register("durationMinutes")} label="Duration (min)" type="number" fullWidth />
              </Box>
            </Box>

            <TextField {...register("notes")} label="Workout Notes" multiline rows={2} fullWidth />

            <Typography variant="h6">Exercises</Typography>

            {exerciseFields.map((field, index) => (
              <Box key={field.id} sx={styles.exerciseContainer}>
                <Box sx={styles.exerciseHeader}>
                  <TextField
                    {...register(`exercises.${index}.name` as const)}
                    label={`Exercise ${index + 1}`}
                    size="small"
                    fullWidth
                    sx={styles.exerciseName}
                    error={!!errors.exercises?.[index]?.name}
                  />
                  <IconButton color="error" onClick={() => removeExercise(index)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>

                <SetsFieldArray nestIndex={index} control={control} register={register} />

                <Box sx={styles.exerciseNotes}>
                  <TextField
                    {...register(`exercises.${index}.notes` as const)}
                    label="Exercise Notes"
                    size="small"
                    fullWidth
                  />
                </Box>
              </Box>
            ))}

            <Button
              variant="outlined"
              startIcon={<AddCircleOutlineIcon />}
              onClick={() => appendExercise({ name: '', sets: [{ reps: 10, weight: 0 }] })}
              sx={styles.addExerciseButton}
            >
              Add Exercise
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">Save Log</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

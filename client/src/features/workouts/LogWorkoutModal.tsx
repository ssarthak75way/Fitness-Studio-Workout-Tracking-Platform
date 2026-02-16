import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import type { UseFormRegister } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Box, IconButton, Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import api from '../../services/api';

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

type WorkoutFormValues = z.infer<typeof workoutSchema>;

interface LogWorkoutModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialValues?: Partial<WorkoutFormValues>;
}

export default function LogWorkoutModal({ open, onClose, onSuccess, initialValues }: LogWorkoutModalProps) {
  const { control, register, handleSubmit, reset, formState: { errors } } = useForm<WorkoutFormValues>({
    resolver: zodResolver(workoutSchema) as any,
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
      reset();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to save workout');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Log Workout</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={3}>
            <Box display="flex" gap={2}>
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
              <Box key={field.id} sx={{ mb: 3, p: 2, border: '1px solid #e2e8f0', borderRadius: 2, bgcolor: '#f8fafc' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <TextField
                    {...register(`exercises.${index}.name` as const)}
                    label={`Exercise ${index + 1}`}
                    size="small"
                    fullWidth
                    sx={{ mr: 2 }}
                    error={!!errors.exercises?.[index]?.name}
                  />
                  <IconButton color="error" onClick={() => removeExercise(index)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>

                <SetsFieldArray nestIndex={index} control={control} register={register} errors={errors} />

                <Box mt={2}>
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

interface SetsFieldArrayProps {
  nestIndex: number;
  control: any;
  register: UseFormRegister<WorkoutFormValues>;
  errors: any;
}

function SetsFieldArray({ nestIndex, control, register }: SetsFieldArrayProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `exercises.${nestIndex}.sets` as const
  });

  return (
    <Box>
      <Box display="flex" gap={2} mb={1}>
        <Typography variant="caption" sx={{ width: 40, fontWeight: 'bold' }}>Set</Typography>
        <Typography variant="caption" sx={{ width: 100, fontWeight: 'bold' }}>Reps</Typography>
        <Typography variant="caption" sx={{ width: 100, fontWeight: 'bold' }}>Weight (kg)</Typography>
      </Box>
      {fields.map((item, k) => (
        <Box key={item.id} display="flex" gap={2} mb={1} alignItems="center">
          <Typography variant="body2" color="textSecondary" width={40}>{k + 1}</Typography>
          <TextField
            {...register(`exercises.${nestIndex}.sets.${k}.reps` as const)}
            type="number"
            size="small"
            sx={{ width: 100 }}
          />
          <TextField
            {...register(`exercises.${nestIndex}.sets.${k}.weight` as const)}
            type="number"
            size="small"
            sx={{ width: 100 }}
          />
          <IconButton size="small" onClick={() => remove(k)} disabled={fields.length === 1}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ))}
      <Button
        size="small"
        startIcon={<AddCircleOutlineIcon />}
        onClick={() => append({ reps: 10, weight: 0 })}
      >
        Add Set
      </Button>
    </Box>
  );
}
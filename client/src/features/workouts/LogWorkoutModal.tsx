import { useEffect, useState } from 'react';
import { useForm, useFieldArray, type Resolver } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Box, IconButton, Typography, useTheme, alpha, type Theme,
  Chip
} from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import api from '../../services/api';
import { workoutService } from '../../services';
import { useToast } from '../../context/ToastContext';
import type { PlateauResult } from '../../types';

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
  exerciseContainer: (theme: Theme) => ({
    mb: 4,
    p: 3,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 2,
    bgcolor: alpha(theme.palette.text.primary, 0.02),
    transition: 'all 0.3s ease',
    '&:hover': {
      borderColor: alpha(theme.palette.primary.main, 0.3),
      bgcolor: alpha(theme.palette.text.primary, 0.03),
    }
  }),
  exerciseHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 },
  exerciseName: (theme: Theme) => ({
    '& .MuiOutlinedInput-root': {
      borderRadius: 0,
      bgcolor: alpha(theme.palette.text.primary, 0.03),
      fontWeight: 800,
      letterSpacing: '1px',
      '& fieldset': { borderColor: theme.palette.divider },
      '&:hover fieldset': { borderColor: 'primary.main' },
    }
  }),
  inputField: (theme: Theme) => ({
    '& .MuiOutlinedInput-root': {
      borderRadius: 0,
      bgcolor: alpha(theme.palette.text.primary, 0.03),
      '& fieldset': { borderColor: theme.palette.divider },
      '&:hover fieldset': { borderColor: 'primary.main' },
    }
  }),
  sectionLabel: {
    color: 'primary.main',
    fontWeight: 900,
    letterSpacing: '4px',
    mb: 2,
    display: 'block',
    textTransform: 'uppercase',
    fontSize: '0.65rem'
  },
  dialogPaper: (theme: Theme) => ({
    borderRadius: 2,
    bgcolor: 'background.paper',
    backgroundImage: theme.palette.mode === 'dark'
      ? `linear-gradient(rgba(6, 9, 15, 0.8), rgba(6, 9, 15, 1))`
      : 'none',
    border: `1px solid ${theme.palette.divider}`,
    overflow: 'hidden'
  }),
  actionButton: {
    borderRadius: 0,
    fontWeight: 950,
    letterSpacing: '2px',
    textTransform: 'uppercase',
    py: 1.5,
    px: 4
  }
};

export default function LogWorkoutModal({ open, onClose, onSuccess, initialValues }: LogWorkoutModalProps) {
  const theme = useTheme();
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

  interface SuggestionExercise {
    name: string;
    oneRM?: number;
    prescribedWeight?: number;
  }

  interface SuggestionData {
    phase?: string;
    week?: number;
    exercises: SuggestionExercise[];
  }

  const [suggestions, setSuggestions] = useState<SuggestionData | null>(null);
  const [plateaus, setPlateaus] = useState<PlateauResult[]>([]);

  // Fetch suggested weights if templateId is provided
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (open && initialValues?.templateId) {
        try {
          const response = await workoutService.getSuggestedWeights(initialValues.templateId);
          if (response.status === 'success') {
            setSuggestions(response.data.suggestions);

            // Auto-update weights in the form if we have suggestions
            const updatedExercises = initialValues.exercises?.map(ex => {
              const suggestion = response.data.suggestions.exercises.find((s: { name: string; oneRM?: number; prescribedWeight?: number }) => s.name === ex.name);
              if (suggestion && suggestion.prescribedWeight > 0) {
                return {
                  ...ex,
                  sets: ex.sets.map(s => ({ ...s, weight: suggestion.prescribedWeight }))
                };
              }
              return ex;
            });

            if (updatedExercises) {
              reset({
                ...initialValues,
                title: initialValues.title || '',
                exercises: updatedExercises
              });
            }
          }
        } catch (err) {
          console.error('Failed to fetch suggested weights:', err);
        }
      } else {
        setSuggestions(null);
      }
    };

    fetchSuggestions();
  }, [open, initialValues, reset]);

  // Fetch Plateaus
  useEffect(() => {
    const fetchPlateaus = async () => {
      if (open) {
        try {
          const response = await workoutService.getPlateaus();
          setPlateaus(response.data.plateaus || []);
        } catch (err) {
          console.error('Failed to fetch plateaus:', err);
        }
      }
    };
    fetchPlateaus();
  }, [open]);


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
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{ sx: styles.dialogPaper(theme) }}
    >
      <DialogTitle sx={{ p: 4, pb: 2 }}>
        <Typography sx={styles.sectionLabel} mb={1}>PERFORMANCE LOG</Typography>
        <Typography variant="h4" fontWeight={950} sx={{ letterSpacing: '-1.5px', color: 'text.primary' }}>
          INITIALIZE <Box component="span" sx={{ color: 'primary.main' }}>SESSION</Box>
        </Typography>
        {suggestions && (
          <Chip
            label={`${suggestions.phase} PHASE • WEEK ${suggestions.week}`}
            color="primary"
            size="small"
            sx={{ mt: 1, fontWeight: 900, borderRadius: 1, letterSpacing: '1px' }}
          />
        )}
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'contents' }}>
        <DialogContent dividers>
          <Box sx={styles.formContainer}>
            <Box sx={styles.formRow}>
              <Box flex={2}>
                <TextField
                  {...register("title")}
                  label="MISSION OBJECTIVE (TITLE)"
                  fullWidth
                  error={!!errors.title}
                  helperText={errors.title?.message}
                  sx={styles.inputField(theme)}
                />
              </Box>
              <Box flex={1}>
                <TextField
                  {...register("durationMinutes")}
                  label="TIME REACH (MIN)"
                  type="number"
                  fullWidth
                  sx={styles.inputField(theme)}
                />
              </Box>
            </Box>

            <TextField
              {...register("notes")}
              label="OPERATIONAL NOTES"
              multiline
              rows={2}
              fullWidth
              sx={styles.inputField(theme)}
            />

            <Typography sx={styles.sectionLabel} mt={2}>DRILL CONFIGURATION</Typography>

            {exerciseFields.map((field, index) => (
              <Box key={field.id} sx={styles.exerciseContainer(theme)}>
                <Box sx={styles.exerciseHeader}>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      {...register(`exercises.${index}.name` as const)}
                      label={`TARGET DRILL ${index + 1}`}
                      size="small"
                      fullWidth
                      sx={styles.exerciseName(theme)}
                      error={!!errors.exercises?.[index]?.name}
                    />
                    {suggestions && (
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        {suggestions.exercises.find((s: { name: string; oneRM?: number; prescribedWeight?: number }) => s.name === exerciseFields[index].name)?.oneRM && (
                          <Chip
                            label={`EST. 1RM: ${suggestions.exercises.find((s: { name: string; oneRM?: number; prescribedWeight?: number }) => s.name === exerciseFields[index].name)?.oneRM}kg`}
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                        )}
                        {(suggestions.exercises.find((s: SuggestionExercise) => s.name === exerciseFields[index].name)?.prescribedWeight ?? 0) > 0 && (
                          <Chip
                            label={`PRESCRIBED: ${suggestions.exercises.find((s: { name: string; oneRM?: number; prescribedWeight?: number }) => s.name === exerciseFields[index].name)?.prescribedWeight}kg`}
                            size="small"
                            color="primary"
                            sx={{ fontSize: '0.6rem', fontWeight: 900, borderRadius: 0.5 }}
                          />
                        )}
                      </Box>
                    )}

                    {plateaus.find(p => p.status === 'PLATEAU' && p.lastExercises.includes(exerciseFields[index].name)) && (
                      <Box sx={{ mt: 1, p: 1.5, bgcolor: alpha(theme.palette.warning.main, 0.1), borderLeft: `3px solid ${theme.palette.warning.main}` }}>
                        <Typography variant="caption" fontWeight={900} color="warning.main" sx={{ display: 'block', letterSpacing: '1px' }}>
                          PLATEAU DETECTED
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 600 }}>
                          {plateaus.find(p => p.status === 'PLATEAU' && p.lastExercises.includes(exerciseFields[index].name))?.suggestion}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  <IconButton color="error" onClick={() => removeExercise(index)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>


                <SetsFieldArray nestIndex={index} control={control} register={register} />

                <Box sx={{ mt: 3 }}>
                  <TextField
                    {...register(`exercises.${index}.notes` as const)}
                    label="DRILL SPECIFIC NOTES"
                    size="small"
                    fullWidth
                    sx={styles.inputField(theme)}
                  />
                </Box>
              </Box>
            ))}

            <Button
              variant="outlined"
              startIcon={<AddCircleOutlineIcon />}
              onClick={() => appendExercise({ name: '', sets: [{ reps: 10, weight: 0 }] })}
              sx={{ ...styles.actionButton, borderColor: theme.palette.divider, color: 'text.primary' }}
            >
              DEPLOY NEW DRILL
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 4, pt: 2 }}>
          <Button onClick={onClose} sx={{ fontWeight: 900, color: 'text.secondary', letterSpacing: '1px' }}>ABORT</Button>
          <Button type="submit" variant="contained" sx={{ ...styles.actionButton, bgcolor: 'primary.main', color: 'primary.contrastText' }}>COMMIT LOG</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

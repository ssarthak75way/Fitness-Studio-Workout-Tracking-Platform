import { useFieldArray } from 'react-hook-form';
import type { Control, UseFormRegister } from 'react-hook-form';
import { Box, Typography, TextField, IconButton, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import type { WorkoutFormValues } from '../../types';

interface SetsFieldArrayProps {
    nestIndex: number;
    control: Control<WorkoutFormValues>;
    register: UseFormRegister<WorkoutFormValues>;
}

const styles = {
    setsHeader: { display: 'flex', gap: 2, mb: 1 },
    setLabel: { width: 40, fontWeight: 'bold' },
    fieldLabel: { width: 100, fontWeight: 'bold' },
    setRow: { display: 'flex', gap: 2, mb: 1, alignItems: 'center' },
    setNumber: { width: 40 },
    setField: { width: 100 },
    addSetButton: { mt: 1 }
};

export default function SetsFieldArray({ nestIndex, control, register }: SetsFieldArrayProps) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: `exercises.${nestIndex}.sets`
    });

    return (
        <Box>
            <Box sx={styles.setsHeader}>
                <Typography variant="caption" sx={styles.setLabel}>Set</Typography>
                <Typography variant="caption" sx={styles.fieldLabel}>Reps</Typography>
                <Typography variant="caption" sx={styles.fieldLabel}>Weight (kg)</Typography>
            </Box>
            {fields.map((item, k) => (
                <Box key={item.id} sx={styles.setRow}>
                    <Typography variant="body2" color="textSecondary" sx={styles.setNumber}>{k + 1}</Typography>
                    <TextField
                        {...register(`exercises.${nestIndex}.sets.${k}.reps`, { valueAsNumber: true })}
                        type="number"
                        size="small"
                        sx={styles.setField}
                    />
                    <TextField
                        {...register(`exercises.${nestIndex}.sets.${k}.weight`, { valueAsNumber: true })}
                        type="number"
                        size="small"
                        sx={styles.setField}
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
                sx={styles.addSetButton}
            >
                Add Set
            </Button>
        </Box>
    );
}

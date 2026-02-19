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
    setLabel: { width: 40, fontWeight: 900, letterSpacing: '1px', opacity: 0.5, textTransform: 'uppercase' },
    fieldLabel: { width: 100, fontWeight: 900, letterSpacing: '1px', opacity: 0.5, textTransform: 'uppercase' },
    setRow: { display: 'flex', gap: 2, mb: 1, alignItems: 'center' },
    setNumber: { width: 40, fontWeight: 900, opacity: 0.6 },
    setField: (theme: Theme) => ({
        width: 100,
        '& .MuiOutlinedInput-root': {
            borderRadius: 0,
            bgcolor: alpha(theme.palette.text.primary, 0.02),
            height: 40,
            '& fieldset': { borderColor: theme.palette.divider },
            '&:hover fieldset': { borderColor: 'primary.main' },
        }
    }),
    addSetButton: {
        mt: 1,
        fontWeight: 900,
        letterSpacing: '1px',
        fontSize: '0.65rem'
    }
};

import type { Theme } from '@mui/material/styles';
import { useTheme, alpha } from '@mui/material/styles';

export default function SetsFieldArray({ nestIndex, control, register }: SetsFieldArrayProps) {
    const theme = useTheme();
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
                        sx={styles.setField(theme)}
                    />
                    <TextField
                        {...register(`exercises.${nestIndex}.sets.${k}.weight`, { valueAsNumber: true })}
                        type="number"
                        size="small"
                        sx={styles.setField(theme)}
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
                color="primary"
            >
                APPEND SET
            </Button>
        </Box>
    );
}

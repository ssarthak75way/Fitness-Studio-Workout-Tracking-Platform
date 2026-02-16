import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Rating,
    TextField,
    Box,
    Typography
} from '@mui/material';
import { ratingService } from '../../services/index';
import { useToast } from '../../context/ToastContext';

interface Props {
    open: boolean;
    onClose: () => void;
    targetType: 'CLASS' | 'INSTRUCTOR';
    targetId: string;
    targetName: string;
    onSuccess: () => void;
    initialData?: { rating: number; review?: string };
}

const styles = {
    alert: { mb: 2 },
    ratingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        my: 2,
        gap: 1
    },
    textField: { mt: 1 }
};

export default function ReviewFormDialog({
    open,
    onClose,
    targetType,
    targetId,
    targetName,
    onSuccess,
    initialData
}: Props) {
    const [rating, setRating] = useState<number | null>(initialData?.rating || 5);
    const [review, setReview] = useState(initialData?.review || '');
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    const handleSubmit = async () => {
        if (!rating) {
            showToast('Please provide a star rating.', 'error');
            return;
        }

        setLoading(true);
        try {
            await ratingService.submitRating({
                targetType,
                targetId,
                rating,
                review
            });
            onSuccess();
            showToast('Review submitted successfully!', 'success');
            onClose();
        } catch (err: any) {
            showToast(err.response?.data?.message || 'Failed to submit review', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>
                Rate {targetName}
            </DialogTitle>
            <DialogContent>


                <Box sx={styles.ratingContainer}>
                    <Typography variant="subtitle1">Your Rating</Typography>
                    <Rating
                        value={rating}
                        onChange={(_, newValue) => setRating(newValue)}
                        size="large"
                    />
                </Box>

                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Your Review (Optional)"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Share your experience..."
                    variant="outlined"
                    sx={styles.textField}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading}
                >
                    {loading ? 'Submitting...' : 'Submit Review'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

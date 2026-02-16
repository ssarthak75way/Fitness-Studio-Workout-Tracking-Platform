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
    Typography,
    Alert
} from '@mui/material';
import { ratingService } from '../../services/index';

interface Props {
    open: boolean;
    onClose: () => void;
    targetType: 'CLASS' | 'INSTRUCTOR';
    targetId: string;
    targetName: string;
    onSuccess: () => void;
    initialData?: { rating: number; review?: string };
}

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
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!rating) {
            setError('Please provide a star rating.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await ratingService.submitRating({
                targetType,
                targetId,
                rating,
                review
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit review');
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
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 2, gap: 1 }}>
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
                    sx={{ mt: 1 }}
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

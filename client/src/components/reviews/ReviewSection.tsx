import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    List,
    ListItem,
    Avatar,
    Rating,
    Divider,
    Button,
    Paper,
    CircularProgress
} from '@mui/material';
import { RateReview as RateReviewIcon } from '@mui/icons-material';
import { ratingService } from '../../services/index';
import { useAuth } from '../../context/AuthContext';
import ReviewFormDialog from './ReviewFormDialog';
import { format } from 'date-fns';

interface Props {
    targetType: 'CLASS' | 'INSTRUCTOR';
    targetId: string;
    targetName: string;
}

const styles = {
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center',
        p: 4
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2
    },
    ratingOverview: {
        display: 'flex',
        alignItems: 'center',
        gap: 2
    },
    list: { p: 0 },
    noReviewsText: {
        p: 4,
        textAlign: 'center'
    },
    listItem: {
        py: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start'
    },
    reviewHeader: {
        display: 'flex',
        width: '100%',
        justifyContent: 'space-between',
        mb: 1
    },
    userInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: 1.5
    },
    avatar: {
        width: 32,
        height: 32,
        fontSize: '0.875rem'
    },
    rating: { mb: 1 }
};

export default function ReviewSection({ targetType, targetId, targetName }: Props) {
    const { user } = useAuth();
    const [data, setData] = useState<{ ratings: any[], averageRating: string }>({ ratings: [], averageRating: '0.0' });
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const res = await ratingService.getRatings(targetType, targetId);
            const { ratings, averageRating } = res.data || { ratings: [], averageRating: '0.0' };
            setData({ ratings, averageRating });
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [targetId]);

    if (loading && data.ratings.length === 0) {
        return (
            <Box sx={styles.loadingContainer}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={styles.header}>
                <Box sx={styles.ratingOverview}>
                    <Typography variant="h5" fontWeight="bold">{data.averageRating}</Typography>
                    <Box>
                        <Rating value={parseFloat(data.averageRating)} precision={0.5} readOnly size="small" />
                        <Typography variant="caption" display="block" color="text.secondary">
                            Based on {data.ratings.length} reviews
                        </Typography>
                    </Box>
                </Box>

                {user?.role === 'MEMBER' && (
                    <Button
                        variant="outlined"
                        startIcon={<RateReviewIcon />}
                        onClick={() => setModalOpen(true)}
                    >
                        Write a Review
                    </Button>
                )}
            </Box>

            <Paper variant="outlined">
                <List sx={styles.list}>
                    {data.ratings.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={styles.noReviewsText}>
                            No reviews yet.
                        </Typography>
                    ) : (
                        data.ratings.map((review, index) => (
                            <Box key={review._id}>
                                <ListItem sx={styles.listItem}>
                                    <Box sx={styles.reviewHeader}>
                                        <Box sx={styles.userInfo}>
                                            <Avatar
                                                src={review.user?.profileImage}
                                                sx={styles.avatar}
                                            >
                                                {review.user?.fullName?.[0]}
                                            </Avatar>
                                            <Typography variant="subtitle2" fontWeight="bold">
                                                {review.user?.fullName}
                                            </Typography>
                                        </Box>
                                        <Typography variant="caption" color="text.secondary">
                                            {format(new Date(review.createdAt), 'MMM dd, yyyy')}
                                        </Typography>
                                    </Box>
                                    <Rating value={review.rating} readOnly size="small" sx={styles.rating} />
                                    <Typography variant="body2" color="text.secondary">
                                        {review.review || "No comments provided."}
                                    </Typography>
                                </ListItem>
                                {index < data.ratings.length - 1 && <Divider />}
                            </Box>
                        ))
                    )}
                </List>
            </Paper>

            <ReviewFormDialog
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                targetType={targetType}
                targetId={targetId}
                targetName={targetName}
                onSuccess={fetchReviews}
                initialData={data.ratings.find(r => r.user?._id === user?._id)}
            />
        </Box>
    );
}

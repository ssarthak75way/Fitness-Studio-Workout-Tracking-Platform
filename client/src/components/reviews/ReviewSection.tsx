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
    CircularProgress,
    LinearProgress
} from '@mui/material';
import { RateReview as RateReviewIcon } from '@mui/icons-material';
import { ratingService } from '../../services/index';
import { useAuth } from '../../context/AuthContext';
import type {   User, RatingResponse } from '../../types';
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
        alignItems: 'flex-start',
        mb: 3
    },
    overviewContainer: {
        display: 'flex',
        gap: 4,
        flexWrap: 'wrap',
        flex: 1
    },
    ratingOverview: {
        display: 'flex',
        alignItems: 'center',
        gap: 2
    },
    histogramContainer: {
        flex: 1,
        minWidth: 200,
        maxWidth: 300
    },
    histogramRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        mb: 0.5
    },
    histogramStarText: { minWidth: 15 },
    histogramBar: { flex: 1, height: 8, borderRadius: 1 },
    histogramCountText: { minWidth: 20, textAlign: 'right' },
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
    const [data, setData] = useState<RatingResponse>({
        ratings: [],
        trimmedMean: '0.0',
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        canReview: false
    });
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const res = await ratingService.getRatings(targetType, targetId);
            const { ratings, trimmedMean, distribution, canReview } = res.data || {
                ratings: [], trimmedMean: '0.0', distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, canReview: false
            };
            setData({ ratings, trimmedMean, distribution, canReview });
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
                <Box sx={styles.overviewContainer}>
                    <Box sx={styles.ratingOverview}>
                        <Typography variant="h3" fontWeight="bold">{data.trimmedMean}</Typography>
                        <Box>
                            <Rating value={parseFloat(data.trimmedMean)} precision={0.5} readOnly size="large" />
                            <Typography variant="caption" display="block" color="text.secondary">
                                Based on {data.ratings.length} reviews (Trimmed Mean)
                            </Typography>
                        </Box>
                    </Box>

                    {/* Distribution Histogram */}
                    <Box sx={styles.histogramContainer}>
                        {[5, 4, 3, 2, 1].map((star) => {
                            const count = data.distribution?.[star] || 0;
                            const percentage = data.ratings.length > 0 ? (count / data.ratings.length) * 100 : 0;
                            return (
                                <Box key={star} sx={styles.histogramRow}>
                                    <Typography variant="caption" sx={styles.histogramStarText}>{star}</Typography>
                                    <Rating value={1} max={1} size="small" readOnly />
                                    <LinearProgress
                                        variant="determinate"
                                        value={percentage}
                                        sx={styles.histogramBar}
                                    />
                                    <Typography variant="caption" sx={styles.histogramCountText}>
                                        {count}
                                    </Typography>
                                </Box>
                            );
                        })}
                    </Box>
                </Box>

                {data.canReview && (
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
                                                src={(review.user as User)?.profileImage}
                                                sx={styles.avatar}
                                            >
                                                {(review.user as User)?.fullName?.[0]}
                                            </Avatar>
                                            <Typography variant="subtitle2" fontWeight="bold">
                                                {(review.user as User)?.fullName}
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
                initialData={data.ratings.find(r => (r.user as User)?._id === user?._id)}
            />
        </Box>
    );
}

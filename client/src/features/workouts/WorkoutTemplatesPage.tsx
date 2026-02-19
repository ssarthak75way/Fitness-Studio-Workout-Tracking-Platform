import { useState, useEffect } from 'react';
import {
    Box, Typography, Card, CardContent, Button, Chip,
    TextField, InputAdornment, CardActionArea,
    Dialog, DialogTitle, DialogContent, DialogActions,
    List, ListItem, ListItemText,
    useTheme,
    alpha,
    Stack,
    Skeleton
} from '@mui/material';
import {
    Search as SearchIcon,
    FitnessCenter as FitnessCenterIcon,
    Speed as SpeedIcon,
    PlayArrow as PlayArrowIcon,
    ArrowBack as ArrowBackIcon,
    Timer as TimerIcon,
    Repeat as RepeatIcon,
} from '@mui/icons-material';
import { workoutService } from '../../services';
import LogWorkoutModal from './LogWorkoutModal';
import { useNavigate } from 'react-router-dom';
import type { Theme } from '@mui/material';
import type { WorkoutTemplate, WorkoutFormValues } from '../../types';
import { motion, type Variants } from 'framer-motion';

const CATEGORIES = ['ALL', 'STRENGTH', 'CARDIO', 'HIIT', 'FLEXIBILITY'];

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const styles = {
    pageContainer: {
        p: 0,
        bgcolor: 'background.default',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
    },
    headerHero: (theme: Theme) => ({
        pt: { xs: 10, md: 14 },
        pb: { xs: 8, md: 12 },
        px: { xs: 3, md: 6 },
        position: 'relative',
        backgroundImage: theme.palette.mode === 'dark'
            ? `linear-gradient(rgba(6, 9, 15, 0.75), rgba(6, 9, 15, 1)), url(https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=2069&auto=format&fit=crop)`
            : `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.95)), url(https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=2069&auto=format&fit=crop)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        flexWrap: 'wrap',
        gap: 4,
        borderBottom: `1px solid ${theme.palette.divider}`,
        '&::before': {
            content: '"LIBRARY"',
            position: 'absolute',
            top: '20%',
            left: '5%',
            fontSize: { xs: '5rem', md: '12rem' },
            fontWeight: 950,
            color: theme.palette.mode === 'dark' ? alpha('#fff', 0.03) : alpha('#000', 0.03),
            letterSpacing: '20px',
            zIndex: 0,
            pointerEvents: 'none',
            lineHeight: 0.8
        }
    }),
    headerTitle: (theme: Theme) => ({
        fontWeight: 950,
        fontSize: { xs: '3.5rem', md: '6rem' },
        lineHeight: 0.85,
        letterSpacing: '-4px',
        color: theme.palette.text.primary,
        textTransform: 'uppercase',
        mb: 2,
        position: 'relative',
        zIndex: 1,
        '& span': {
            color: theme.palette.primary.main,
            textShadow: theme.palette.mode === 'dark' ? `0 0 40px ${alpha(theme.palette.primary.main, 0.5)}` : 'none'
        }
    }),
    heroSubtitle: {
        color: 'text.secondary',
        maxWidth: 600,
        fontWeight: 400,
        lineHeight: 1.6
    },
    backButton: (theme: Theme) => ({
        borderRadius: 0,
        py: 2, px: 4,
        fontWeight: 900,
        letterSpacing: '1px',
        borderColor: alpha(theme.palette.divider, 0.2),
        color: theme.palette.text.primary,
        backdropFilter: 'blur(10px)',
        '&:hover': {
            borderColor: theme.palette.primary.main,
            bgcolor: alpha(theme.palette.primary.main, 0.1)
        }
    }),
    sectionLabel: {
        color: 'primary.main',
        fontWeight: 900,
        letterSpacing: '5px',
        mb: 4,
        display: 'block',
        textTransform: 'uppercase',
        fontSize: '0.7rem',
        opacity: 0.8
    },
    contentWrapper: {
        px: { xs: 3, md: 6 },
        py: { xs: 4, md: 8 },
        flexGrow: 1,
        position: 'relative',
        zIndex: 1
    },
    filterContainer: (theme: Theme) => ({
        p: 3,
        borderRadius: 2,
        bgcolor: alpha(theme.palette.background.paper, 0.4),
        backdropFilter: 'blur(20px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        mb: 6,
        boxShadow: `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.05)}`
    }),
    filterStack: {
        flexGrow: 1,
        width: '100%'
    },
    categoryStack: {
        overflowX: 'auto',
        width: { xs: '100%', md: 'auto' },
        pb: { xs: 1, md: 0 }
    },
    categoryChip: (theme: Theme, selected: boolean) => ({
        fontWeight: 900,
        borderRadius: 1,
        height: 48,
        px: 2,
        letterSpacing: '1px',
        transition: 'all 0.3s ease',
        border: selected ? 'none' : `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        bgcolor: selected ? theme.palette.primary.main : 'transparent',
        color: selected ? '#fff' : theme.palette.text.secondary,
        '&:hover': {
            bgcolor: selected ? theme.palette.primary.dark : alpha(theme.palette.text.primary, 0.05),
            transform: 'translateY(-2px)'
        }
    }),
    templatesGrid: {
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
        gap: 4
    },
    card: (theme: Theme) => ({
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        bgcolor: alpha(theme.palette.background.paper, 0.3),
        backdropFilter: 'blur(20px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderRadius: 2,
        overflow: 'hidden',
        '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: `0 20px 40px -10px ${alpha(theme.palette.common.black, 0.2)}`,
            borderColor: alpha(theme.palette.primary.main, 0.4),
            '& .card-action-arrow': {
                transform: 'translate(4px, -4px)',
                opacity: 1
            }
        }
    }),
    cardActionArea: {
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start'
    },
    cardContent: { p: 4, flexGrow: 1 },
    difficultyChip: (theme: Theme, difficulty: string) => {
        const color = difficulty === 'BEGINNER' ? theme.palette.success.main :
            difficulty === 'INTERMEDIATE' ? theme.palette.warning.main : theme.palette.error.main;

        return {
            bgcolor: alpha(color, 0.1),
            color: color,
            fontWeight: 800,
            borderRadius: 0.5,
            letterSpacing: '1px',
            fontSize: '0.7rem'
        };
    },
    cardCategoryChip: (theme: Theme) => ({
        borderRadius: 0.5,
        fontWeight: 800,
        fontSize: '0.7rem',
        bgcolor: alpha(theme.palette.primary.main, 0.1),
        color: theme.palette.primary.main,
        letterSpacing: '1px'

    }),
    startButton: (theme: Theme) => ({
        borderRadius: 1.5,
        py: 1.5,
        fontWeight: 800,
        letterSpacing: '1px',
        boxShadow: `0 8px 16px -4px ${alpha(theme.palette.primary.main, 0.3)}`,
        '&:hover': {
            boxShadow: `0 12px 20px -4px ${alpha(theme.palette.primary.main, 0.4)}`,
            transform: 'translateY(-2px)'
        }
    }),
    dialogPaper: (theme: Theme) => ({
        borderRadius: 3,
        bgcolor: alpha(theme.palette.background.paper, 0.95),
        backdropFilter: 'blur(20px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: `0 40px 80px -20px ${alpha(theme.palette.common.black, 0.5)}`
    }),
    dialogTitle: {
        p: 4,
        pb: 0
    },
    dialogCategoryChip: (theme: Theme) => ({
        borderRadius: 0.5,
        fontWeight: 800,
        bgcolor: theme.palette.primary.main,
        color: '#fff'
    }),
    statBadge: (theme: Theme) => ({
        bgcolor: alpha(theme.palette.action.hover, 0.05),
        px: 1.5,
        py: 0.5,
        borderRadius: 1,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        color: theme.palette.text.secondary
    }),
    searchInput: (theme: Theme) => ({
        '& .MuiOutlinedInput-root': {
            borderRadius: 1,
            bgcolor: alpha(theme.palette.background.paper, 0.5),
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            '&:hover': {
                bgcolor: alpha(theme.palette.background.paper, 0.8)
            },
            '&.Mui-focused': {
                bgcolor: theme.palette.background.paper,
                boxShadow: `0 8px 20px -5px ${alpha(theme.palette.primary.main, 0.2)}`
            }
        }
    }),
    noTemplatesBox: {
        textAlign: 'center',
        py: 10
    },
    sequenceTitle: () => ({
        variant: 'overline',
        color: 'primary',
        fontWeight: 900,
        letterSpacing: '3px',
        display: 'block',
        mb: 3
    }),
    exerciseItem: (theme: Theme) => ({
        p: 2,
        mb: 2,
        borderRadius: 2,
        bgcolor: alpha(theme.palette.background.default, 0.5),
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
    }),
    dialogActions: {
        p: 4,
        pt: 0,
        gap: 2
    },
    closeButton: {
        borderRadius: 1.5,
        fontWeight: 800,
        color: 'text.secondary',
        px: 3
    },
    startWorkoutButton: (theme: Theme) => ({
        borderRadius: 1.5,
        py: 1.5,
        fontWeight: 800,
        letterSpacing: '1px',
        boxShadow: `0 8px 16px -4px ${alpha(theme.palette.primary.main, 0.3)}`,
        width: '100%',
        '&:hover': {
            boxShadow: `0 12px 20px -4px ${alpha(theme.palette.primary.main, 0.4)}`,
            transform: 'translateY(-2px)'
        }
    })
};

export default function WorkoutTemplatesPage() {
    const theme = useTheme();
    const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
    const [filteredTemplates, setFilteredTemplates] = useState<WorkoutTemplate[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [selectedTemplate, setSelectedTemplate] = useState<Partial<WorkoutFormValues> | null>(null);
    const [viewTemplate, setViewTemplate] = useState<WorkoutTemplate | null>(null);
    const [openLog, setOpenLog] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTemplates();
    }, []);

    useEffect(() => {
        let filtered = templates.filter(t =>
            t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.description.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (selectedCategory !== 'ALL') {
            filtered = filtered.filter(t => t.category === selectedCategory);
        }

        setFilteredTemplates(filtered);
    }, [searchTerm, selectedCategory, templates]);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const response = await workoutService.getWorkoutTemplates();
            const templatesData = response.data?.templates || [];

            if (templatesData.length === 0) {
                console.log('No templates found in API response');
            }

            setTemplates(templatesData);
            setFilteredTemplates(templatesData);
        } catch (error) {
            console.error('Failed to fetch templates:', error);
            // Optionally set empty state on error, but keeping invalid state might be better for debugging
            setTemplates([]);
            setFilteredTemplates([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUseTemplate = (template: WorkoutTemplate) => {
        setSelectedTemplate({
            title: template.name,
            exercises: template.exercises.map((ex) => ({
                name: ex.name,
                sets: Array(ex.sets).fill(0).map(() => ({ reps: ex.reps, weight: ex.weight || 0 })),
                notes: ex.notes
            }))
        });
        setOpenLog(true);
        setViewTemplate(null);
    };

    return (
        <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible" sx={styles.pageContainer}>
            {/* Cinematic Hero */}
            <Box sx={styles.headerHero(theme)}>
                <Box>
                    <Typography sx={styles.sectionLabel}>BLUEPRINTS FOR SUCCESS</Typography>
                    <Typography variant="h1" sx={styles.headerTitle(theme)}>
                        WORKOUT <Box component="span">LIBRARY</Box>
                    </Typography>
                    <Typography variant="h6" sx={styles.heroSubtitle}>
                        Battle-tested routines designed for peak performance. Select your protocol and begin the transformation.
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/workouts')}
                    sx={styles.backButton(theme)}
                >
                    RETURN TO HUB
                </Button>
            </Box>

            {/* Main Content Area */}
            <Box sx={styles.contentWrapper}>
                {/* Filter Section */}
                <Box sx={styles.filterContainer(theme)}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
                        <Box sx={styles.filterStack}>
                            <TextField
                                placeholder="Search protocols..."
                                variant="outlined"
                                fullWidth
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                sx={styles.searchInput(theme)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color: 'text.secondary', opacity: 0.7 }} />
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Box>
                        <Stack direction="row" spacing={1} sx={styles.categoryStack}>
                            {CATEGORIES.map(cat => (
                                <Chip
                                    key={cat}
                                    label={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    sx={styles.categoryChip(theme, selectedCategory === cat)}
                                />
                            ))}
                        </Stack>
                    </Stack>
                </Box>

                {/* Templates Grid */}
                {loading ? (
                    <Box sx={styles.templatesGrid}>
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Skeleton key={i} variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
                        ))}
                    </Box>
                ) : filteredTemplates.length > 0 ? (
                    <Box
                        sx={styles.templatesGrid}
                    >
                        {filteredTemplates.map((template) => (
                            <motion.div
                                key={template._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                                layout
                            >
                                <Card sx={styles.card(theme)}>
                                    <CardActionArea sx={styles.cardActionArea} onClick={() => setViewTemplate(template)}>
                                        <CardContent sx={styles.cardContent}>
                                            <Box display="flex" justifyContent="space-between" mb={3} width="100%">
                                                <Chip
                                                    label={template.category}
                                                    size="small"
                                                    sx={styles.cardCategoryChip(theme)}
                                                />
                                                <Chip
                                                    label={template.difficulty}
                                                    size="small"
                                                    sx={styles.difficultyChip(theme, template.difficulty)}
                                                />
                                            </Box>

                                            <Typography variant="h4" fontWeight={900} gutterBottom sx={{ letterSpacing: '-0.5px' }}>
                                                {template.name}
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    mb: 4,
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                    fontWeight: 500,
                                                    lineHeight: 1.6,
                                                    opacity: 0.8
                                                }}
                                            >
                                                {template.description}
                                            </Typography>

                                            <Box display="flex" gap={4} sx={{ color: 'text.secondary' }}>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <FitnessCenterIcon fontSize="small" sx={{ color: theme.palette.primary.main, opacity: 0.8 }} />
                                                    <Typography variant="button" fontWeight={800} sx={{ fontSize: '0.75rem' }}>
                                                        {template.exercises.length} MOVES
                                                    </Typography>
                                                </Box>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <TimerIcon fontSize="small" sx={{ color: theme.palette.secondary.main, opacity: 0.8 }} />
                                                    <Typography variant="button" fontWeight={800} sx={{ fontSize: '0.75rem' }}>
                                                        ~45 MIN
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </CardActionArea>
                                    <Box sx={{ p: 3, pt: 0, bgcolor: 'transparent' }}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            onClick={() => handleUseTemplate(template)}
                                            startIcon={<PlayArrowIcon />}
                                            sx={styles.startButton(theme)}
                                        >
                                            START SESSION
                                        </Button>
                                    </Box>
                                </Card>
                            </motion.div>
                        ))}
                    </Box>
                ) : (
                    <Box sx={styles.noTemplatesBox}>
                        <Typography variant="h5" color="text.secondary" gutterBottom>
                            No templates found
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.6 }}>
                            Try adjusting your search or filters
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* View Template Details Dialog */}
            <Dialog
                open={!!viewTemplate}
                onClose={() => setViewTemplate(null)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: styles.dialogPaper(theme) }}
                TransitionProps={{ timeout: 400 }}
            >
                {viewTemplate && (
                    <>
                        <DialogTitle sx={styles.dialogTitle}>
                            <Box display="flex" alignItems="center" gap={2} mb={2}>
                                <Chip
                                    label={viewTemplate.category}
                                    size="small"
                                    sx={styles.dialogCategoryChip(theme)}
                                />
                                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ letterSpacing: '2px' }}>
                                    {viewTemplate.difficulty}
                                </Typography>
                            </Box>
                            <Typography variant="h3" fontWeight={900} sx={{ letterSpacing: '-1px', mb: 1 }}>
                                {viewTemplate.name}
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                {viewTemplate.description}
                            </Typography>
                        </DialogTitle>

                        <DialogContent sx={{ p: 4 }}>
                            <Typography sx={{...styles.sequenceTitle}}>
                                SEQUENCE ({viewTemplate.exercises.length})
                            </Typography>

                            <List disablePadding>
                                {viewTemplate.exercises.map((ex, idx: number) => (
                                    <ListItem
                                        key={idx}
                                        sx={styles.exerciseItem(theme)}
                                    >
                                        <ListItemText
                                            primary={
                                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                                    <Typography variant="h6" fontWeight={800} sx={{ fontSize: '1rem' }}>
                                                        {ex.name}
                                                    </Typography>
                                                    <Typography variant="caption" fontWeight={900} color="text.secondary" sx={{ opacity: 0.5 }}>
                                                        {String(idx + 1).padStart(2, '0')}
                                                    </Typography>
                                                </Box>
                                            }
                                            secondary={
                                                <Box display="flex" gap={2}>
                                                    <Box display="flex" alignItems="center" gap={0.5} sx={styles.statBadge(theme)}>
                                                        <RepeatIcon sx={{ fontSize: 14 }} />
                                                        <Typography variant="caption" fontWeight={700}>{ex.sets} SETS</Typography>
                                                    </Box>
                                                    <Box display="flex" alignItems="center" gap={0.5} sx={styles.statBadge(theme)}>
                                                        <SpeedIcon sx={{ fontSize: 14 }} />
                                                        <Typography variant="caption" fontWeight={700}>{ex.reps} REPS</Typography>
                                                    </Box>
                                                    {(ex.weight || 0) > 0 && (
                                                        <Box display="flex" alignItems="center" gap={0.5} sx={styles.statBadge(theme)}>
                                                            <FitnessCenterIcon sx={{ fontSize: 14 }} />
                                                            <Typography variant="caption" fontWeight={700}>{ex.weight}kg</Typography>
                                                        </Box>
                                                    )}
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </DialogContent>

                        <DialogActions sx={styles.dialogActions}>
                            <Button
                                onClick={() => setViewTemplate(null)}
                                sx={styles.closeButton}
                            >
                                CLOSE
                            </Button>
                            <Button
                                variant="contained"
                                fullWidth
                                onClick={() => handleUseTemplate(viewTemplate)}
                                sx={styles.startWorkoutButton(theme)}
                            >
                                START WORKOUT
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            <LogWorkoutModal
                open={openLog}
                onClose={() => {
                    setOpenLog(false);
                    setSelectedTemplate(null);
                }}
                onSuccess={() => {
                    setOpenLog(false);
                    setSelectedTemplate(null);
                    navigate('/workouts');
                }}
                initialValues={selectedTemplate}
            />
        </Box>
    );
}
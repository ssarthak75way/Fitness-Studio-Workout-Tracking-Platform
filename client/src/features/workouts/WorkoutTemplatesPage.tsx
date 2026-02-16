import { useState, useEffect } from 'react';
import {
    Box, Typography, Card, CardContent, Button, Chip,
    TextField, InputAdornment, CardActionArea,
    Dialog, DialogTitle, DialogContent, DialogActions,
    List, ListItem, ListItemText,
    Grid,
    useTheme,
    alpha,
    Stack
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import SpeedIcon from '@mui/icons-material/Speed';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { workoutService } from '../../services';
import LogWorkoutModal from './LogWorkoutModal';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ['ALL', 'STRENGTH', 'CARDIO', 'HIIT', 'FLEXIBILITY'];

const styles = {
    pageContainer: { maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 3 } },
    headerTitle: (theme: any) => ({
        background: `linear-gradient(45deg, ${theme.palette.text.primary} 30%, ${theme.palette.primary.main} 90%)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    }),
    backButton: { borderRadius: 2 },
    filterContainer: (theme: any) => ({
        p: 3,
        borderRadius: 3,
        bgcolor: alpha(theme.palette.background.paper, 0.6),
        backdropFilter: 'blur(10px)',
        border: `1px solid ${theme.palette.divider}`,
        mb: 4,
        boxShadow: theme.shadows[1]
    }),
    searchInput: { borderRadius: 2, bgcolor: 'background.paper' },
    categoryChip: {
        fontWeight: 600,
        borderRadius: 2,
        height: 48,
        px: 1
    },
    card: (theme: any) => ({
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[8],
            borderColor: theme.palette.primary.main
        },
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 3
    }),
    categoryChipSmall: { fontWeight: 600, borderRadius: 1 },
    difficultyChip: (theme: any, difficulty: string) => ({
        bgcolor: difficulty === 'BEGINNER' ? alpha(theme.palette.info.main, 0.1) :
            difficulty === 'INTERMEDIATE' ? alpha(theme.palette.warning.main, 0.1) : alpha(theme.palette.error.main, 0.1),
        color: difficulty === 'BEGINNER' ? theme.palette.info.main :
            difficulty === 'INTERMEDIATE' ? theme.palette.warning.main : theme.palette.error.main,
        fontWeight: 700,
        borderRadius: 1
    }),
    cardDescription: {
        minHeight: 40,
        mb: 3,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
    },
    cardFooter: { color: 'text.secondary' },
    startButton: (theme: any) => ({
        borderRadius: 2,
        py: 1,
        fontWeight: 600,
        boxShadow: 'none',
        '&:hover': { boxShadow: theme.shadows[2] }
    }),
    dialogPaper: { borderRadius: 3 },
    dialogTitle: { pb: 1 },
    dialogContent: { border: 'none' },
    exercisesLabel: { mt: 1, fontWeight: 700, letterSpacing: '0.05em' },
    listItem: (theme: any, isLast: boolean) => ({
        py: 2,
        px: 0,
        borderBottom: !isLast ? `1px dashed ${theme.palette.divider}` : 'none'
    }),
    statBadge: (theme: any) => ({
        bgcolor: alpha(theme.palette.background.default, 0.5),
        px: 1,
        py: 0.5,
        borderRadius: 1
    }),
    dialogActions: { p: 3, gap: 1 }
};

export default function WorkoutTemplatesPage() {
    const theme = useTheme();
    const [templates, setTemplates] = useState<any[]>([]);
    const [filteredTemplates, setFilteredTemplates] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
    const [viewTemplate, setViewTemplate] = useState<any>(null);
    const [openLog, setOpenLog] = useState(false);
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
            const response = await workoutService.getWorkoutTemplates();
            setTemplates(response.data.templates);
            setFilteredTemplates(response.data.templates);
        } catch (error) {
            console.error('Failed to fetch templates:', error);
        }
    };

    const handleUseTemplate = (template: any) => {
        setSelectedTemplate({
            title: template.name,
            exercises: template.exercises.map((ex: any) => ({
                name: ex.name,
                sets: Array(ex.sets).fill(0).map(() => ({ reps: ex.reps, weight: ex.weight || 0 })),
                notes: ex.notes
            }))
        });
        setOpenLog(true);
        setViewTemplate(null);
    };

    return (
        <Box sx={styles.pageContainer}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
                <Box>
                    <Typography variant="h4" fontWeight="800" sx={styles.headerTitle(theme)}>
                        Workout Library
                    </Typography>
                    <Typography variant="body1" color="text.secondary" mt={0.5}>
                        Choose a pre-built routine to follow or customize.
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/workouts')}
                    sx={styles.backButton}
                >
                    Back to History
                </Button>
            </Box>

            <Box sx={styles.filterContainer(theme)}>
                <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2}>
                    <TextField
                        placeholder="Search workouts..."
                        variant="outlined"
                        fullWidth
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                            sx: styles.searchInput
                        }}
                    />
                    <Stack direction="row" gap={1} flexWrap="wrap">
                        {CATEGORIES.map(cat => (
                            <Chip
                                key={cat}
                                label={cat}
                                onClick={() => setSelectedCategory(cat)}
                                color={selectedCategory === cat ? "primary" : "default"}
                                variant={selectedCategory === cat ? "filled" : "outlined"}
                                clickable
                                sx={styles.categoryChip}
                            />
                        ))}
                    </Stack>
                </Box>
            </Box>

            <Grid container spacing={3}>
                {filteredTemplates.map((template) => (
                    <Grid size={{ xs: 12, md: 6, lg: 4 }} key={template._id}>
                        <Card sx={styles.card(theme)}>
                            <CardActionArea sx={{ flexGrow: 1 }} onClick={() => setViewTemplate(template)}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box display="flex" justifyContent="space-between" mb={2}>
                                        <Chip label={template.category} size="small" color="primary" variant="outlined" sx={styles.categoryChipSmall} />
                                        <Chip
                                            label={template.difficulty}
                                            size="small"
                                            variant="filled"
                                            sx={styles.difficultyChip(theme, template.difficulty)}
                                        />
                                    </Box>
                                    <Typography variant="h5" fontWeight="800" gutterBottom>
                                        {template.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={styles.cardDescription}>
                                        {template.description}
                                    </Typography>

                                    <Box display="flex" gap={3} sx={styles.cardFooter}>
                                        <Box display="flex" alignItems="center" gap={0.5}>
                                            <FitnessCenterIcon fontSize="small" color="inherit" />
                                            <Typography variant="body2" fontWeight={500}>
                                                {template.exercises.length} Exercises
                                            </Typography>
                                        </Box>
                                        <Box display="flex" alignItems="center" gap={0.5}>
                                            <SpeedIcon fontSize="small" color="inherit" />
                                            <Typography variant="body2" fontWeight={500}>
                                                {template.difficulty}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </CardActionArea>
                            <Box sx={{ p: 2, pt: 0 }}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={() => handleUseTemplate(template)}
                                    startIcon={<PlayArrowIcon />}
                                    sx={styles.startButton(theme)}
                                >
                                    Start Workout
                                </Button>
                            </Box>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* View Template Details Dialog */}
            <Dialog
                open={!!viewTemplate}
                onClose={() => setViewTemplate(null)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: styles.dialogPaper }}
                TransitionProps={{ timeout: 400 }}
            >
                {viewTemplate && (
                    <>
                        <DialogTitle component="div" sx={styles.dialogTitle}>
                            <Typography variant="h5" fontWeight="800">{viewTemplate.name}</Typography>
                            <Typography variant="body2" color="text.secondary">{viewTemplate.description}</Typography>
                        </DialogTitle>
                        <DialogContent dividers sx={styles.dialogContent}>
                            <Typography variant="subtitle2" color="primary" gutterBottom sx={styles.exercisesLabel}>
                                EXERCISES ({viewTemplate.exercises.length})
                            </Typography>
                            <List disablePadding>
                                {viewTemplate.exercises.map((ex: any, idx: number) => (
                                    <Box key={idx}>
                                        <ListItem sx={styles.listItem(theme, idx === viewTemplate.exercises.length - 1)}>
                                            <ListItemText
                                                primary={ex.name}
                                                primaryTypographyProps={{ fontWeight: 700, fontSize: '1rem' }}
                                                secondary={
                                                    <Box display="flex" gap={2} mt={0.5}>
                                                        <Box display="flex" alignItems="center" gap={0.5} sx={styles.statBadge(theme)}>
                                                            <Typography variant="body2" fontWeight={600}>{ex.sets} sets</Typography>
                                                        </Box>
                                                        <Box display="flex" alignItems="center" gap={0.5} sx={styles.statBadge(theme)}>
                                                            <Typography variant="body2" fontWeight={600}>{ex.reps} reps</Typography>
                                                        </Box>
                                                        {ex.weight > 0 && (
                                                            <Box display="flex" alignItems="center" gap={0.5} sx={styles.statBadge(theme)}>
                                                                <Typography variant="body2" fontWeight={600}>@{ex.weight}kg</Typography>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                    </Box>
                                ))}
                            </List>
                        </DialogContent>
                        <DialogActions sx={styles.dialogActions}>
                            <Button onClick={() => setViewTemplate(null)} sx={{ borderRadius: 2, fontWeight: 600 }} color="inherit">
                                Close
                            </Button>
                            <Button
                                variant="contained"
                                onClick={() => handleUseTemplate(viewTemplate)}
                                sx={{ borderRadius: 2, px: 4, fontWeight: 700 }}
                            >
                                Start Workout
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

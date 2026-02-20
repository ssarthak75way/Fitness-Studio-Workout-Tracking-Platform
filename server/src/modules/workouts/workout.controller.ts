import { Request, Response, NextFunction } from 'express';
import { WorkoutService } from './workout.service.js';
import WorkoutTemplate from './workout-template.model.js';
import { PlateauService } from './plateau.service.js';
import { PeriodizationService } from './periodization.service.js';
import PeriodizedProgram from './periodized-program.model.js';



export const logWorkout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workout = await WorkoutService.logWorkout(req.user!._id.toString(), req.body);
    res.status(201).json({ status: 'success', data: { workout } });
  } catch (error) {
    next(error);
  }
};

export const getWorkoutHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workouts = await WorkoutService.getWorkoutHistory(req.user!._id.toString());
    res.status(200).json({ status: 'success', data: { workouts } });
  } catch (error) {
    next(error);
  }
};

export const getPersonalRecords = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const records = await WorkoutService.getPersonalRecords(req.user!._id.toString());
    res.status(200).json({ status: 'success', data: { records } });
  } catch (error) {
    next(error);
  }
};

export const getWorkoutStreak = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const streak = await WorkoutService.calculateWorkoutStreak(req.user!._id.toString());
    res.status(200).json({ status: 'success', data: { streak } });
  } catch (error) {
    next(error);
  }
};

// Template controllers
export const getTemplates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, difficulty } = req.query;
    const filter: { isPublic: boolean; category?: string; difficulty?: string } = { isPublic: true };
    if (category) filter.category = category as string;
    if (difficulty) filter.difficulty = difficulty as string;

    const templates = await WorkoutTemplate.find(filter).populate('createdBy', 'fullName');
    res.status(200).json({ status: 'success', data: { templates } });
  } catch (error) {
    next(error);
  }
};

export const getTemplateById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const template = await WorkoutTemplate.findById(req.params.id).populate('createdBy', 'fullName');
    if (!template) {
      return res.status(404).json({ status: 'error', message: 'Template not found' });
    }
    res.status(200).json({ status: 'success', data: { template } });
  } catch (error) {
    next(error);
  }
};

export const createTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const template = await WorkoutTemplate.create({
      ...req.body,
      createdBy: req.user!._id.toString(),
    });
    res.status(201).json({ status: 'success', data: { template } });
  } catch (error) {
    next(error);
  }
};

export const updateTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const template = await WorkoutTemplate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!template) {
      return res.status(404).json({ status: 'error', message: 'Template not found' });
    }
    res.status(200).json({ status: 'success', data: { template } });
  } catch (error) {
    next(error);
  }
};

export const deleteTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const template = await WorkoutTemplate.findByIdAndDelete(req.params.id);
    if (!template) {
      return res.status(404).json({ status: 'error', message: 'Template not found' });
    }
    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    next(error);
  }
};

export const getAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const analytics = await WorkoutService.getWorkoutAnalytics(req.user!._id.toString());
    res.status(200).json({ status: 'success', data: { analytics } });
  } catch (error) {
    next(error);
  }
};

export const getPlateaus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plateaus = await PlateauService.detectPlateaus(req.user!._id.toString());
    res.status(200).json({ status: 'success', data: { plateaus } });
  } catch (error) {
    next(error);
  }
};

export const initiateProgram = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Initiating periodization program for user:', req.user?._id);
    const program = await PeriodizationService.generateProgram(req.user!._id.toString());
    console.log('Program generated successfully:', program._id);
    res.status(201).json({ status: 'success', data: { program } });

  } catch (error) {
    next(error);
  }
};

export const getSuggestedWeights = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { templateId } = req.params;
    const suggestions = await PeriodizationService.getPrescribedWeights(req.user!._id.toString(), templateId);

    if (!suggestions) {
      return res.status(404).json({
        status: 'error',
        message: 'No active periodized program found or template invalid'
      });
    }

    res.status(200).json({ status: 'success', data: { suggestions } });
  } catch (error) {
    next(error);
  }
};

export const getActiveProgram = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const program = await PeriodizedProgram.findOne({ user: req.user!._id.toString(), isActive: true });
    res.status(200).json({ status: 'success', data: { program } });
  } catch (error) {
    next(error);
  }
};

export const getAdvancedAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { exercise } = req.params;
    const { targetWeight } = req.query;

    const analytics = await WorkoutService.getAdvancedAnalytics(
      req.user!._id.toString(),
      exercise,
      targetWeight ? parseFloat(targetWeight as string) : undefined
    );

    if (!analytics) {
      return res.status(404).json({
        status: 'fail',
        message: 'Insufficient data for statistical modeling. Log at least 3 workouts for this exercise.'
      });
    }

    res.status(200).json({ status: 'success', data: { analytics } });
  } catch (error) {
    next(error);
  }
};
import { z } from 'zod';

export const createWorkoutSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    date: z.string().datetime().optional(), // ISO String
    durationMinutes: z.number().positive().optional(),
    notes: z.string().optional(),
    exercises: z.array(
      z.object({
        name: z.string().min(1, "Exercise name required"),
        sets: z.array(
          z.object({
            reps: z.number().min(1),
            weight: z.number().min(0),
            rpe: z.number().min(1).max(10).optional(),
          })
        ).min(1, "At least one set required"),
        notes: z.string().optional(),
      })
    ).min(1, "At least one exercise required"),
  }),
});

export type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>['body'];
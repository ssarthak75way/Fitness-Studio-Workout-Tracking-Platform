import { z } from 'zod';
import { ClassType } from './class.model';

// Schema for Creating a Class
export const createClassSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title too short"),
    description: z.string().optional(),
    type: z.nativeEnum(ClassType), // Validates against the Enum
    instructorId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Instructor ID").optional(), // Mongo ID Regex
    studioId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Studio ID"),
    startTime: z.string().datetime(), // ISO 8601 string
    durationMinutes: z.number().min(15).max(180),
    capacity: z.number().min(1).max(100),
    location: z.string().optional(),
    isRecurring: z.boolean().optional().default(false),
    recurrenceFrequency: z.enum(['DAILY', 'WEEKLY']).optional(),
    recurrenceCount: z.number().min(1).max(52).optional(),
  }),
});


// Type inference for the Controller
export type CreateClassInput = z.infer<typeof createClassSchema>['body'];
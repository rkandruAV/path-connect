import { z } from 'zod';

export const createUserSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  role: z.enum(['MENTOR', 'MENTEE']).optional(),
  currentPosition: z.string().max(200).optional(),
  targetRole: z.string().max(200).optional(),
  bio: z.string().max(2000).optional(),
  mentorProfile: z.object({
    expertise: z.array(z.string()).min(1).max(20),
    industry: z.string().max(100).optional(),
    yearsExperience: z.number().int().min(0).max(50).optional(),
    availability: z.array(z.string()).optional(),
    bio: z.string().max(2000).optional(),
  }).optional(),
});

export const updateUserSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  currentPosition: z.string().max(200).optional(),
  targetRole: z.string().max(200).optional(),
  bio: z.string().max(2000).optional(),
  photoUrl: z.string().url().optional(),
  mentorProfile: z.object({
    expertise: z.array(z.string()).min(1).max(20).optional(),
    industry: z.string().max(100).optional(),
    yearsExperience: z.number().int().min(0).max(50).optional(),
    availability: z.array(z.string()).optional(),
    bio: z.string().max(2000).optional(),
    isActive: z.boolean().optional(),
  }).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

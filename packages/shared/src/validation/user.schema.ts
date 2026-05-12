import { z } from 'zod';

export const socialLinksSchema = z.object({
  github: z.string().url('Invalid URL').optional().or(z.literal('')),
  linkedin: z.string().url('Invalid URL').optional().or(z.literal('')),
  twitter: z.string().url('Invalid URL').optional().or(z.literal('')),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
});

export const educationSchema = z.object({
  degree: z.string().min(1, 'Degree is required').max(200),
  institution: z.string().min(1, 'Institution is required').max(200),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  description: z.string().max(1000).optional(),
});

export const experienceSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  company: z.string().min(1, 'Company is required').max(200),
  location: z.string().max(200).optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  description: z.string().max(2000).optional(),
});

export const portfolioSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  url: z.string().url('Invalid URL').optional().or(z.literal('')),
  githubUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  screenshots: z.array(z.string()).default([]),
});

export const privacySettingsSchema = z.object({
  emailVisible: z.boolean().optional(),
  portfolioVisible: z.boolean().optional(),
  contactVisible: z.boolean().optional(),
  allowMessagesFrom: z.enum(['everyone', 'followers']).optional(),
  allowMentorshipRequests: z.enum(['everyone', 'followers']).optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  headline: z.string().max(200).optional(),
  bio: z.string().max(2000).optional(),
  skills: z.array(z.string().max(50)).max(50).optional(),
  location: z.string().max(100).optional(),
  experienceYears: z.number().min(0).max(80).optional(),
  availableForMentorship: z.boolean().optional(),
  availableForCollaboration: z.boolean().optional(),
  socialLinks: socialLinksSchema.optional(),
});

export const addEducationSchema = z.object({ education: educationSchema });
export const updateEducationSchema = z.object({ education: educationSchema.partial() });
export const addExperienceSchema = z.object({ experience: experienceSchema });
export const updateExperienceSchema = z.object({ experience: experienceSchema.partial() });
export const addPortfolioSchema = z.object({ portfolio: portfolioSchema });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type PrivacySettingsInput = z.infer<typeof privacySettingsSchema>;


import type { Timestamp } from 'firebase/firestore';

export interface StoryPage {
  pageNumber: number;
  text: string; // Original page text
  transformedDialogue?: string; // The dialogue script used for TTS
  imageUrl?: string;
  imageMatchesText?: boolean;
  voiceoverUrl?: string;
  animationUrl?: string;
  isLoadingImage?: boolean;
  isLoadingVoiceover?: boolean;
  isLoadingAnimation?: boolean;
  dataAiHint?: string;
}

export interface Storybook {
  id: string;
  userId: string;
  title: string;
  originalPrompt: string;
  childAge: number;
  voiceGender: 'male' | 'female';
  storyStyleDescription?: string; // Added for image consistency
  rewrittenStoryText?: string;
  pages: StoryPage[];
  createdAt: Date | Timestamp;
  isLoadingStory?: boolean;
}

// Schema for the story creation form
import { z } from 'zod';

export const storyCreationSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long." }).max(100, { message: "Title must be less than 100 characters." }),
  storyPrompt: z.string().min(10, { message: "Story prompt must be at least 10 characters long." }).max(2000, { message: "Story prompt must be less than 2000 characters." }),
  childAge: z.coerce.number().min(1, { message: "Child's age must be at least 1." }).max(12, { message: "Child's age must be 12 or younger." }),
  voiceGender: z.enum(['male', 'female'], { message: "Please select a voice gender." }),
  storyStyleDescription: z.string().max(300, { message: "Style description must be less than 300 characters." }).optional(), // Added
});

export type StoryCreationFormData = z.infer<typeof storyCreationSchema>;

export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});
export type LoginFormData = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
export type SignupFormData = z.infer<typeof signupSchema>;

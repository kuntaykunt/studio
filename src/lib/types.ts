
export interface StoryPage {
  pageNumber: number;
  text: string;
  imageUrl?: string;
  imageMatchesText?: boolean;
  videoUrl?: string; // Placeholder for video data URI or URL
  isLoadingImage?: boolean;
  isLoadingVideo?: boolean;
  dataAiHint?: string; // For individual page images
}

export interface Storybook {
  id: string;
  title: string; // User can set this or auto-generate
  originalPrompt: string;
  childAge: number;
  voiceGender: 'male' | 'female';
  rewrittenStoryText?: string; // The full rewritten story
  pages: StoryPage[];
  createdAt: Date;
  isLoadingStory?: boolean; // for the initial story generation
}

// Schema for the story creation form
import { z } from 'zod';

export const storyCreationSchema = z.object({
  storyPrompt: z.string().min(10, { message: "Story prompt must be at least 10 characters long." }).max(2000, { message: "Story prompt must be less than 2000 characters." }),
  childAge: z.coerce.number().min(1, { message: "Child's age must be at least 1." }).max(12, { message: "Child's age must be 12 or younger." }),
  voiceGender: z.enum(['male', 'female'], { message: "Please select a voice gender." }),
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
  path: ["confirmPassword"], // path of error
});
export type SignupFormData = z.infer<typeof signupSchema>;

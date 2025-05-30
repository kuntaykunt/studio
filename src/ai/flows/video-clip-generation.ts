
'use server';
/**
 * @fileOverview Video clip generation flow for creating short animated video clips with voiceover.
 * THIS FILE IS NOW DEPRECATED. Use animation-generation.ts and voice-generation.ts instead.
 *
 * - generateVideoClip - A function that generates a video clip for a given image and text.
 * - GenerateVideoClipInput - The input type for the generateVideoClip function.
 * - GenerateVideoClipOutput - The return type for the generateVideoClip function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateVideoClipInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "The image data URI to animate, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  storyText: z.string().describe('The text for the story page.'),
  voiceGender: z.enum(['male', 'female']).describe('The gender of the voiceover.'),
  childAge: z.number().describe('The age of the child for whom the story is intended.'),
});
export type GenerateVideoClipInput = z.infer<typeof GenerateVideoClipInputSchema>;

const GenerateVideoClipOutputSchema = z.object({
  videoDataUri: z.string().describe('The generated video data URI.'),
});
export type GenerateVideoClipOutput = z.infer<typeof GenerateVideoClipOutputSchema>;

export async function generateVideoClip(input: GenerateVideoClipInput): Promise<GenerateVideoClipOutput> {
  // This flow is deprecated. Logic has moved to animation-generation.ts and voice-generation.ts
  console.warn("generateVideoClip flow is deprecated. Use generateAnimation and generateVoiceover instead.");
  return Promise.resolve({videoDataUri: 'data:video/mp4;base64,deprecated-placeholder-video-data'});
}

// The rest of the file (prompt, flow definition) is effectively unused due to deprecation.
// Keeping it for history but should be removed in a future cleanup if the file itself is deleted.

const generateVideoClipPrompt = ai.definePrompt({
  name: 'generateVideoClipPrompt_DEPRECATED',
  input: {schema: GenerateVideoClipInputSchema},
  output: {schema: GenerateVideoClipOutputSchema},
  prompt: `DEPRECATED PROMPT: You are a video generation expert specializing in creating short, animated video clips for children's stories.

You will receive an image and the corresponding text for a page in a children's story. Your task is to create a short video clip based on the image and text.

Input Details:
- Story Text: {{{storyText}}}
- Image: {{media url=imageDataUri}}

Voiceover Requirements:
- The voiceover should use a clear, friendly, and engaging {{{voiceGender}}} voice.
- The voice style and pacing should be perfectly suited for a child aged {{{childAge}}}.
- Ensure narration is easy for a young child to follow, with warm intonation and playful energy where appropriate to the text.
- Consider a warm, engaging tone for a {{{childAge}}}-year-old. For younger children (1-3), use simpler language, very expressive and slower-paced narration. For older children (7-12), the narration can be slightly more complex and faster-paced, but still clear and engaging.

Video Output Requirements:
- The output should be a video data URI.
- The video should include the specified voiceover reading the story text.
- The video should be visually engaging, animating the provided image in a way that complements the story text and is delightful for young children.
- The video must not contain any inappropriate or unsafe content.

Based on the image and story text, create an animated video clip with the described voiceover. Return the video as a data URI.
`,
});

const generateVideoClipFlow = ai.defineFlow(
  {
    name: 'generateVideoClipFlow_DEPRECATED',
    inputSchema: GenerateVideoClipInputSchema,
    outputSchema: GenerateVideoClipOutputSchema,
  },
  async input => {
    return {videoDataUri: 'data:video/mp4;base64,deprecated-placeholder-video-data'}; // Placeholder
  }
);

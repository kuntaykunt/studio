
'use server';
/**
 * @fileOverview Animation generation flow for creating short animated clips from images.
 *
 * - generateAnimation - A function that generates an animation for a given image.
 * - GenerateAnimationInput - The input type for the generateAnimation function.
 * - GenerateAnimationOutput - The return type for the generateAnimation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAnimationInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "The image data URI to animate, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  storyText: z.string().describe('The context of the story page text (optional, for animation guidance).'),
  childAge: z.number().describe('The age of the child for whom the animation is intended.'),
});
export type GenerateAnimationInput = z.infer<typeof GenerateAnimationInputSchema>;

const GenerateAnimationOutputSchema = z.object({
  animationDataUri: z.string().describe('The generated animation data URI (e.g., a short GIF or video clip).'),
});
export type GenerateAnimationOutput = z.infer<typeof GenerateAnimationOutputSchema>;

export async function generateAnimation(input: GenerateAnimationInput): Promise<GenerateAnimationOutput> {
  return animationGenerationFlow(input);
}

const animationGenerationPrompt = ai.definePrompt({
  name: 'animationGenerationPrompt',
  input: {schema: GenerateAnimationInputSchema},
  output: {schema: GenerateAnimationOutputSchema},
  prompt: `You are an animation expert specializing in creating short, engaging animated clips for children's stories from static images.

You will receive a static image and optionally the corresponding story text for context. Your task is to create a short, simple animation based on the image.

Input Details:
- Image: {{media url=imageDataUri}}
- Story Context (optional): {{{storyText}}}

Animation Requirements:
- The animation should be simple, playful, and visually engaging for a child aged {{{childAge}}}.
- Consider subtle movements, fades, or zooms that bring the static image to life in a delightful way.
- The animation should be very short (e.g., a few seconds).
- The output should be an animation data URI (e.g., GIF or short video format).
- The animation must not contain any inappropriate or unsafe content.

Based on the image, create a simple, child-friendly animation. Return the animation as a data URI.
`,
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
    ],
  }
});

const animationGenerationFlow = ai.defineFlow(
  {
    name: 'animationGenerationFlow',
    inputSchema: GenerateAnimationInputSchema,
    outputSchema: GenerateAnimationOutputSchema,
  },
  async input => {
    // const {output} = await animationGenerationPrompt(input); // This would be the call if the model supported direct animation generation.
    // return output!;

    // For now, since actual animation generation isn't directly implemented/supported, we'll return a placeholder.
    // Future development would involve configuring appropriate Genkit models 
    // and updating this flow to call them. The prompt above is structured to guide such a model.
    return {animationDataUri: 'data:image/gif;base64,placeholder-animation-data'}; // Placeholder (e.g., GIF)
  }
);

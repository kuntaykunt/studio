
'use server';
/**
 * @fileOverview Animation generation flow for creating short animated video clips from images.
 *
 * - generateAnimation - A function that generates an animation (video clip) for a given image.
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
  storyText: z.string().describe('The context of the story page text (optional, for video guidance).'),
  childAge: z.number().describe('The age of the child for whom the video clip is intended.'),
});
export type GenerateAnimationInput = z.infer<typeof GenerateAnimationInputSchema>;

const GenerateAnimationOutputSchema = z.object({
  animationDataUri: z.string().describe('The generated animation/video data URI (e.g., a short MP4 or GIF).'),
});
export type GenerateAnimationOutput = z.infer<typeof GenerateAnimationOutputSchema>;

export async function generateAnimation(input: GenerateAnimationInput): Promise<GenerateAnimationOutput> {
  return animationGenerationFlow(input);
}

const animationGenerationPrompt = ai.definePrompt({
  name: 'animationGenerationPrompt',
  input: {schema: GenerateAnimationInputSchema},
  output: {schema: GenerateAnimationOutputSchema},
  prompt: `You are a creative video generation expert specializing in producing short, engaging video clips for children's stories from static images and text.

You will receive a static image and the corresponding story text for context. Your task is to create a short video clip based on the image, bringing it to life with subtle animations and movements that match the story text.

Input Details:
- Image: {{media url=imageDataUri}}
- Story Context: {{{storyText}}}

Video Clip Requirements:
- The video clip should be very short (e.g., 3-5 seconds).
- Style: Visually appealing, colorful, and engaging for a child aged {{{childAge}}}.
- Animation: Incorporate simple animations like panning, zooming, character wiggles, blinking eyes, or environmental effects (e.g., sparkling stars, rustling leaves) that enhance the story page. The animation should directly relate to the provided image and story context.
- The output should be a video data URI (e.g., MP4 or GIF format suitable for web).
- The video must not contain any inappropriate or unsafe content. It should be a scene illustration only, without any added text overlays.

Based on the image and story text, generate a short, child-friendly video clip. Return the video clip as a data URI.
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
    // const {output} = await animationGenerationPrompt(input); // This would be the call if the model supported direct video generation.
    // return output!;

    // For now, since actual video/animation generation isn't directly implemented/supported via simple ai.generate() for advanced models like Veo,
    // we'll return a placeholder.
    // Future development would involve either Genkit supporting such models directly with polling,
    // or this flow calling an external service that uses the @google/genai SDK.
    console.log(`Animation generation for age ${input.childAge} with text context "${input.storyText.substring(0,50)}..." and image starting with ${input.imageDataUri.substring(0,50)}... would happen here.`);
    return {animationDataUri: 'data:video/mp4;base64,placeholder-video-animation-data'}; // Placeholder (e.g., MP4)
  }
);


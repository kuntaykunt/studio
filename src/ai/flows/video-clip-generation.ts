'use server';
/**
 * @fileOverview Video clip generation flow for creating short animated video clips with voiceover.
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
  return generateVideoClipFlow(input);
}

const generateVideoClipPrompt = ai.definePrompt({
  name: 'generateVideoClipPrompt',
  input: {schema: GenerateVideoClipInputSchema},
  output: {schema: GenerateVideoClipOutputSchema},
  prompt: `You are a video generation expert specializing in creating short, animated video clips for children's stories.

You will receive an image and the corresponding text for a page in a children's story. Your task is to create a short video clip based on the image and text. The video should be appropriate for the specified child's age.

Voice Gender: {{{voiceGender}}}
Child Age: {{{childAge}}}
Story Text: {{{storyText}}}
Image: {{media url=imageDataUri}}

Output Requirements:
- The video should be a data URI.
- The video should include a voiceover reading the story text with the specified gender.
- The video should be visually engaging and appropriate for young children.
- The video should not contain any inappropriate or unsafe content.

Create a video clip based on the above information. Return the video data URI.
`,
});

const generateVideoClipFlow = ai.defineFlow(
  {
    name: 'generateVideoClipFlow',
    inputSchema: GenerateVideoClipInputSchema,
    outputSchema: GenerateVideoClipOutputSchema,
  },
  async input => {
    //const result = await ai.generate({
    //  prompt: input.storyText,
    //  model: 'googleai/gemini-2.0-flash-exp',
    //  config: {
    //    responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE, IMAGE only won't work
    //  },
    //});
    //console.log(media.url);

    // For now, since video generation isn't directly supported, we'll return a placeholder.
    return {videoDataUri: 'data:video/mp4;base64,placeholder-video-data'}; // Placeholder

    // Once video generation is supported, the code would look something like this:
    // const { videoDataUri } = await generateVideoClipPrompt(input);
    // return { videoDataUri };
  }
);

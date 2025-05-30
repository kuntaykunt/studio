
'use server';

/**
 * @fileOverview Generates images for each page of a children's story.
 *
 * - generateStoryImages - A function that generates images for each page of a story.
 * - GenerateStoryImagesInput - The input type for the generateStoryImages function.
 * - GenerateStoryImagesOutput - The return type for the generateStoryImages function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStoryImagesInputSchema = z.object({
  storyPages: z.array(
    z.object({
      pageText: z.string().describe('The text content of the story page.'),
    })
  ).describe('An array of story pages, each containing the text for that page.'),
  childAge: z.number().describe('The age of the child for whom the story is intended.'),
});
export type GenerateStoryImagesInput = z.infer<typeof GenerateStoryImagesInputSchema>;

const GenerateStoryImagesOutputSchema = z.array(
  z.object({
    pageText: z.string().describe('The text content of the story page.'),
    imageUrl: z.string().describe('The data URI of the generated image for the story page.'),
    imageMatchesText: z.boolean().describe('Whether the generated image appropriately matches the story page text.')
  })
);
export type GenerateStoryImagesOutput = z.infer<typeof GenerateStoryImagesOutputSchema>;

export async function generateStoryImages(input: GenerateStoryImagesInput): Promise<GenerateStoryImagesOutput> {
  return generateStoryImagesFlow(input);
}

const pageImageMatchCheckPrompt = ai.definePrompt({
  name: 'pageImageMatchCheckPrompt',
  input: {
    schema: z.object({
      pageText: z.string(),
      childAge: z.number(),
    }),
  },
  output: {
    schema: z.object({
      imageMatchesText: z.boolean().describe("True if a child-friendly, scene-only illustration for the page text would be appropriate, false otherwise. The illustration should not contain any text itself.")
    })
  },
  prompt: `You are an AI assistant evaluating if an image would be appropriate for a children's storybook page.
The image should be a colorful, whimsical scene-only illustration, appealing to a {{childAge}}-year-old child.
IMPORTANTLY, the illustration itself MUST NOT contain any text, letters, or words.

Given the following story page text, would such an illustration (scene-only, no text in image, colorful, for a {{childAge}}-year-old) be suitable and accurately represent the text?

Story Page Text: {{{pageText}}}

Return true for imageMatchesText if it's suitable, false otherwise.
  `,
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
    ],
  },
});

const generateStoryImagesFlow = ai.defineFlow(
  {
    name: 'generateStoryImagesFlow',
    inputSchema: GenerateStoryImagesInputSchema,
    outputSchema: GenerateStoryImagesOutputSchema,
  },
  async input => {
    const results = await Promise.all(
      input.storyPages.map(async (page) => {
        const imageGenPromptText = `A children's storybook illustration depicting the following scene: "${page.pageText}". The style should be colorful, whimsical, and appealing to a ${input.childAge}-year-old child. IMPORTANT: DO NOT include any text, letters, or words in the image. The image should be a scene illustration only.`;
        
        const {media} = await ai.generate({
          model: 'googleai/gemini-2.0-flash-exp', // Ensure this model supports image generation as configured
          prompt: imageGenPromptText,
          config: {
            responseModalities: ['TEXT', 'IMAGE'],
            safetySettings: [
              { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
              { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
              { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
              { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
            ],
          },
        });

        // This call now primarily checks if a scene-only image is appropriate for the text.
        const {output: matchOutput} = await pageImageMatchCheckPrompt({
          pageText: page.pageText,
          childAge: input.childAge,
        });

        return {
          pageText: page.pageText,
          imageUrl: media.url, // The URL from the actual image generation
          imageMatchesText: matchOutput!.imageMatchesText 
        };
      })
    );

    return results;
  }
);

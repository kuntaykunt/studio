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

const pageImageGenerationPrompt = ai.definePrompt({
  name: 'pageImageGenerationPrompt',
  input: {
    schema: z.object({
      pageText: z.string(),
      childAge: z.number(),
    }),
  },
  output: {
    schema: z.object({
      imageUrl: z.string(),
      imageMatchesText: z.boolean()
    })
  },
  prompt: `You are an AI assistant that generates images for children's storybooks.

  Given the text of a story page and the age of the child, generate an image that is appropriate and relevant.
  Return also a boolean value that represents whether the generated image matches the story text.

  The image must be child-safe and appropriate for a child of age {{childAge}}.

  Story Page Text: {{{pageText}}}

  Output the image as a data URI and the match boolean in the output schema.
  `,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
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
      input.storyPages.map(async page => {
        const {media} = await ai.generate({
          model: 'googleai/gemini-2.0-flash-exp',
          prompt: `Generate an image of ${page.pageText}`,
          config: {
            responseModalities: ['TEXT', 'IMAGE'],
            safetySettings: [
              {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_ONLY_HIGH',
              },
              {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_NONE',
              },
              {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE',
              },
              {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_LOW_AND_ABOVE',
              },
            ],
          },
        });

        const {output} = await pageImageGenerationPrompt({
          pageText: page.pageText,
          childAge: input.childAge,
        });

        return {
          pageText: page.pageText,
          imageUrl: media.url,
          imageMatchesText: output!.imageMatchesText
        };
      })
    );

    return results;
  }
);

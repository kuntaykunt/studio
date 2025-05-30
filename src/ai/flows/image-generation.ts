
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
  storyStyleDescription: z.string().optional().describe('An optional description of the desired overall art style or main character appearance to maintain consistency across pages.'),
});
export type GenerateStoryImagesInput = z.infer<typeof GenerateStoryImagesInputSchema>;

const GenerateStoryImagesOutputSchema = z.array(
  z.object({
    pageText: z.string().describe('The text content of the story page.'),
    imageUrl: z.string().optional().describe('The data URI of the generated image for the story page, if successful.'),
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
      storyStyleDescription: z.string().optional(),
    }),
  },
  output: {
    schema: z.object({
      imageMatchesText: z.boolean().describe("True if a child-friendly, scene-only illustration for the page text would be appropriate, false otherwise. The illustration should not contain any text itself and should adhere to any provided style description.")
    })
  },
  prompt: `You are an AI assistant evaluating if an image would be appropriate for a children's storybook page.
The image should be a colorful, whimsical scene-only illustration, appealing to a {{childAge}}-year-old child.
{{#if storyStyleDescription}}It should also attempt to follow this style guidance: "{{storyStyleDescription}}".{{/if}}
IMPORTANTLY, the illustration itself MUST NOT contain any text, letters, or words.

Given the following story page text, would such an illustration be suitable and accurately represent the text?

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
    console.log('[generateStoryImagesFlow] Starting image generation for input:', JSON.stringify(input, null, 2));
    const results = await Promise.all(
      input.storyPages.map(async (page, index) => {
        const stylePrefix = input.storyStyleDescription ? input.storyStyleDescription + ". " : "";
        const imageGenPromptText = `${stylePrefix}A children's storybook illustration depicting the following scene: "${page.pageText}". The style should be colorful, whimsical, and appealing to a ${input.childAge}-year-old child. IMPORTANT: DO NOT include any text, letters, or words in the image. The image should be a scene illustration only.`;
        console.log(`[generateStoryImagesFlow] Page ${index + 1} - Image Gen Prompt: "${imageGenPromptText.substring(0, 100)}..."`);

        let generatedImageUrl: string | undefined;
        try {
          const {media, text, error} = await ai.generate({
            model: 'googleai/gemini-2.0-flash-exp',
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

          console.log(`[generateStoryImagesFlow] Page ${index + 1} - AI.generate response:`, { media: media, text: text, error: error});

          if (error) {
            console.error(`[generateStoryImagesFlow] Page ${index + 1} - Image generation error from ai.generate:`, error);
          }
          if (media?.url) {
            generatedImageUrl = media.url;
            console.log(`[generateStoryImagesFlow] Page ${index + 1} - Generated image URL (first 100 chars): ${generatedImageUrl.substring(0,100)}...`);
          } else {
            console.warn(`[generateStoryImagesFlow] Page ${index + 1} - No media.url received from image generation.`);
          }
        } catch (imageGenError) {
          console.error(`[generateStoryImagesFlow] Page ${index + 1} - Critical error during image generation for page text: "${page.pageText}"`, imageGenError);
          // Keep generatedImageUrl as undefined, schema allows it.
        }


        // This call now primarily checks if a scene-only image is appropriate for the text.
        let imageMatchesTextResult = false; // Default to false
        try {
            const {output: matchOutput} = await pageImageMatchCheckPrompt({
                pageText: page.pageText,
                childAge: input.childAge,
                storyStyleDescription: input.storyStyleDescription,
            });
            imageMatchesTextResult = matchOutput?.imageMatchesText ?? false;
            console.log(`[generateStoryImagesFlow] Page ${index + 1} - Image match check result: ${imageMatchesTextResult}`);
        } catch (matchCheckError) {
            console.error(`[generateStoryImagesFlow] Page ${index + 1} - Image match check failed for page text: "${page.pageText}"`, matchCheckError);
            // imageMatchesTextResult remains false
        }


        return {
          pageText: page.pageText,
          imageUrl: generatedImageUrl,
          imageMatchesText: imageMatchesTextResult
        };
      })
    );
    console.log('[generateStoryImagesFlow] Finished image generation. Results:', JSON.stringify(results.map(r => ({ pageText: r.pageText.substring(0,20), imageUrlExists: !!r.imageUrl, imageMatchesText: r.imageMatchesText})), null, 2));
    return results;
  }
);


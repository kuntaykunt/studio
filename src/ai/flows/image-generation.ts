
'use server';

/**
 * @fileOverview Generates images for each page of a children's story,
 * attempting to use the previous page's image as context for consistency.
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
  async (input: GenerateStoryImagesInput): Promise<GenerateStoryImagesOutput> => {
    try {
      console.log('[generateStoryImagesFlow] Starting sequential image generation for input:', JSON.stringify({ childAge: input.childAge, numPages: input.storyPages.length, style: input.storyStyleDescription && input.storyStyleDescription.substring(0,50) + '...'}, null, 2));
      
      const results: GenerateStoryImagesOutput = [];
      let previousImageUrl: string | undefined = undefined;

      for (let i = 0; i < input.storyPages.length; i++) {
        const page = input.storyPages[i];
        const stylePrefix = input.storyStyleDescription ? input.storyStyleDescription + ". " : "";
        let generatedImageUrl: string | undefined;
        let imageGenPromptConfig: string | Array<{text?: string; media?: {url: string}}>;

        if (i === 0 || !previousImageUrl) {
          imageGenPromptConfig = `${stylePrefix}A children's storybook illustration depicting the following scene: "${page.pageText}". The style should be colorful, whimsical, and appealing to a ${input.childAge}-year-old child. IMPORTANT: DO NOT include any text, letters, or words in the image. The image should be a scene illustration only.`;
          console.log(`[generateStoryImagesFlow] Page ${i + 1} (New Image) - Image Gen Prompt (text only): "${(typeof imageGenPromptConfig === 'string' ? imageGenPromptConfig : (imageGenPromptConfig as Array<any>)[0]?.text || '').substring(0, 150)}..."`);
        } else {
          imageGenPromptConfig = [
            { media: { url: previousImageUrl } }, 
            { text: `${stylePrefix}Using the previous image as a starting point, continue the story by illustrating the following scene: "${page.pageText}". The style should remain colorful, whimsical, and appealing to a ${input.childAge}-year-old child, consistent with the previous image. IMPORTANT: DO NOT include any text, letters, or words in the new image. The image should be a scene illustration only, evolving from the previous one.` }
          ];
          console.log(`[generateStoryImagesFlow] Page ${i + 1} (Contextual Image) - Using previous image. Text Prompt: "${(imageGenPromptConfig[1].text || '').substring(0,150)}..."`);
        }

        try {
          const {media, text, error: genError} = await ai.generate({ // Renamed 'error' to 'genError' to avoid conflict
            model: 'googleai/gemini-2.0-flash-exp', 
            prompt: imageGenPromptConfig,
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

          console.log(`[generateStoryImagesFlow] Page ${i + 1} - AI.generate response:`, { mediaUrlExists: !!media?.url, textResponse: text, errorFromGenerate: genError});

          if (genError) {
            console.error(`[generateStoryImagesFlow] Page ${i + 1} - Image generation error from ai.generate:`, genError);
          }
          if (media?.url && typeof media.url === 'string') {
            generatedImageUrl = media.url;
            previousImageUrl = generatedImageUrl; 
            console.log(`[generateStoryImagesFlow] Page ${i + 1} - Generated image URL (first 100 chars): ${generatedImageUrl.substring(0,100)}...`);
          } else {
            console.warn(`[generateStoryImagesFlow] Page ${i + 1} - No media.url received or it's not a string. Media object:`, media);
          }
        } catch (imageGenError) {
          console.error(`[generateStoryImagesFlow] Page ${i + 1} - Critical error during image generation for page text: "${page.pageText}"`, imageGenError);
        }

        let imageMatchesTextResult = false;
        if (generatedImageUrl) { // Only check match if an image was generated
            try {
                const {output: matchOutput} = await pageImageMatchCheckPrompt({
                    pageText: page.pageText,
                    childAge: input.childAge,
                    storyStyleDescription: input.storyStyleDescription,
                });
                imageMatchesTextResult = matchOutput?.imageMatchesText ?? false;
                console.log(`[generateStoryImagesFlow] Page ${i + 1} - Image match check result: ${imageMatchesTextResult}`);
            } catch (matchCheckError) {
                console.error(`[generateStoryImagesFlow] Page ${i + 1} - Image match check failed for page text: "${page.pageText}"`, matchCheckError);
            }
        } else {
            console.log(`[generateStoryImagesFlow] Page ${i + 1} - Skipping image match check as no image was generated.`);
        }


        results.push({
          pageText: page.pageText,
          imageUrl: generatedImageUrl,
          imageMatchesText: imageMatchesTextResult,
        });
      } // End of loop

      console.log('[generateStoryImagesFlow] Finished sequential image generation. Results summary:', JSON.stringify(results.map(r => ({ pageText: r.pageText.substring(0,20)+'...', imageUrlExists: !!r.imageUrl, imageMatchesText: r.imageMatchesText})), null, 2));
      return results;

    } catch (flowError) {
      console.error('[generateStoryImagesFlow] CRITICAL UNHANDLED ERROR IN FLOW:', flowError);
      // Return a valid output schema indicating failure for all pages
      return input.storyPages.map(page => ({
        pageText: page.pageText,
        imageUrl: undefined,
        imageMatchesText: false,
      }));
    }
  }
);


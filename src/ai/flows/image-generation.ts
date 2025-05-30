
'use server';

/**
 * @fileOverview Generates images for each page of a children's story,
 * attempting to use the previous page's image as context for consistency.
 * The initial visual style description is applied only to the first image.
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
  storyStyleDescription: z.string().optional().describe('An optional description of the desired overall art style or main character appearance to maintain consistency across pages. This is primarily used for the first image.'),
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
      storyStyleDescription: z.string().optional(), // Style description is still relevant for checking appropriateness
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
    console.log('[generateStoryImagesFlow] Entered flow. Input keys:', Object.keys(input));
    if (input.storyPages) {
      console.log('[generateStoryImagesFlow] Number of pages to process:', input.storyPages.length);
    }
    console.log(`[generateStoryImagesFlow] Provided storyStyleDescription (first 50 chars): "${(input.storyStyleDescription || "").substring(0, 50)}..."`);


    try {
      const results: GenerateStoryImagesOutput = [];
      let previousImageUrl: string | undefined = undefined;

      for (let i = 0; i < input.storyPages.length; i++) {
        const page = input.storyPages[i];
        console.log(`[generateStoryImagesFlow] Processing page ${i + 1}/${input.storyPages.length}: "${page.pageText.substring(0,50)}..."`);

        let imageGenPromptConfig: string | Array<{text?: string; media?: {url: string}}>;
        const commonInstructions = `IMPORTANT: The image must be a scene illustration only and contain NO text, letters, or words. It should be appealing to a ${input.childAge}-year-old child.`;

        if (i === 0 || !previousImageUrl) {
          // First image or previous image generation failed (so we treat current as a new first image)
          if (input.storyStyleDescription && input.storyStyleDescription.trim() !== '') {
            imageGenPromptConfig = `${input.storyStyleDescription}. Create a children's storybook illustration depicting the following scene: "${page.pageText}". ${commonInstructions}`;
          } else {
            // AI Default style for the very first image
            imageGenPromptConfig = `Create a children's storybook illustration depicting the following scene: "${page.pageText}". The style should be colorful and whimsical. ${commonInstructions}`;
          }
          console.log(`[generateStoryImagesFlow] Page ${i + 1} (New Image) - Image Gen Prompt (first 200 chars): "${(imageGenPromptConfig as string).substring(0,200)}..."`);
        } else {
          // Subsequent images, using previousImageUrl as context
          // The storyStyleDescription is NOT re-applied here; style is inferred from previousImageUrl.
          const contextualPromptText = `Using the previous image as a reference, continue the story by illustrating this scene: "${page.pageText}". Maintain visual consistency with the provided image and its style. ${commonInstructions}`;
          
          imageGenPromptConfig = [
            { media: { url: previousImageUrl } },
            { text: contextualPromptText }
          ];
          console.log(`[generateStoryImagesFlow] Page ${i + 1} (Contextual Image) - Text Prompt (first 150 chars): "${contextualPromptText.substring(0,150)}..."`);
        }


        let generatedImageUrl: string | undefined;
        try {
          const {media, text: imageGenTextResponse, error: genError} = await ai.generate({
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

          console.log(`[generateStoryImagesFlow] Page ${i + 1} - AI.generate response:`, { mediaUrlExists: !!media?.url, textResponse: imageGenTextResponse ? imageGenTextResponse.substring(0,100) + '...' : null, errorFromGenerate: genError});

          if (genError) {
            console.error(`[generateStoryImagesFlow] Page ${i + 1} - Image generation error from ai.generate:`, JSON.stringify(genError, null, 2));
          }

          if (media?.url && typeof media.url === 'string' && media.url.startsWith('data:image')) {
            generatedImageUrl = media.url;
            previousImageUrl = generatedImageUrl; // Set for the next iteration
            console.log(`[generateStoryImagesFlow] Page ${i + 1} - Generated image URL (first 100 chars): ${generatedImageUrl.substring(0,100)}...`);
          } else {
            console.warn(`[generateStoryImagesFlow] Page ${i + 1} - No valid media.url received or it's not a string/image. Media object:`, media);
            previousImageUrl = undefined; // Reset if current image gen failed to avoid passing bad context
          }
        } catch (imageGenError: any) {
          let errorMsg = 'Unknown error during single image generation.';
          if (imageGenError instanceof Error) errorMsg = imageGenError.message;
          else if (typeof imageGenError === 'string') errorMsg = imageGenError;
          else { try { errorMsg = JSON.stringify(imageGenError); } catch(e) { errorMsg = "Non-serializable error object in imageGenError."}}
          console.error(`[generateStoryImagesFlow] Page ${i + 1} - Critical error during image generation for page text: "${page.pageText.substring(0,50)}..."`, errorMsg, imageGenError instanceof Error ? imageGenError.stack : '');
          previousImageUrl = undefined; // Reset if critical error
        }

        let imageMatchesTextResult = false;
        if (generatedImageUrl) { // Only check if an image was successfully generated
            try {
                // The storyStyleDescription is still relevant for the match check, as it defines the user's overall intent.
                const {output: matchOutput, error: matchCheckGenError} = await pageImageMatchCheckPrompt({
                    pageText: page.pageText,
                    childAge: input.childAge,
                    storyStyleDescription: input.storyStyleDescription,
                });

                if (matchCheckGenError) {
                    console.error(`[generateStoryImagesFlow] Page ${i + 1} - Image match check prompt error from ai.generate:`, JSON.stringify(matchCheckGenError, null, 2));
                }
                imageMatchesTextResult = matchOutput?.imageMatchesText ?? false;
                console.log(`[generateStoryImagesFlow] Page ${i + 1} - Image match check result: ${imageMatchesTextResult}. Match output:`, matchOutput);
            } catch (matchCheckError: any) {
                let errorMsg = 'Unknown error during image match check.';
                if (matchCheckError instanceof Error) errorMsg = matchCheckError.message;
                else if (typeof matchCheckError === 'string') errorMsg = matchCheckError;
                else { try { errorMsg = JSON.stringify(matchCheckError); } catch(e) { errorMsg = "Non-serializable error object in matchCheckError."}}
                console.error(`[generateStoryImagesFlow] Page ${i + 1} - Image match check failed for page text: "${page.pageText.substring(0,50)}"`, errorMsg, matchCheckError instanceof Error ? matchCheckError.stack : '');
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

    } catch (flowError: any) {
      let errorMessage = 'Unknown error during image generation flow.';
      if (flowError instanceof Error) {
        errorMessage = flowError.message;
      } else if (typeof flowError === 'string') {
        errorMessage = flowError;
      } else {
        try {
          errorMessage = JSON.stringify(flowError);
        } catch (e) {
          errorMessage = 'Error object could not be stringified.';
        }
      }
      console.error(`[generateStoryImagesFlow] CRITICAL UNHANDLED ERROR IN FLOW: ${errorMessage}`, flowError instanceof Error ? flowError.stack : 'No stack available. Raw error object:', flowError);
      
      // Return an array of failures matching the output schema
      return input.storyPages.map(page => ({
        pageText: page.pageText,
        imageUrl: undefined,
        imageMatchesText: false,
      }));
    }
  }
);

    
// src/ai/flows/child-safe-story-generation.ts
'use server';

/**
 * @fileOverview Rewrites the story text based on prompt from parents in child-friendly language considering the age of the child.
 *
 * - childSafeStoryGeneration - A function that handles the story rewriting process.
 * - ChildSafeStoryGenerationInput - The input type for the childSafeStoryGeneration function.
 * - ChildSafeStoryGenerationOutput - The return type for the childSafeStoryGeneration function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChildSafeStoryGenerationInputSchema = z.object({
  storyText: z.string().describe('The original story text input by the parent.'),
  childAge: z.number().describe('The age of the child for whom the story is being rewritten.'),
});
export type ChildSafeStoryGenerationInput = z.infer<
  typeof ChildSafeStoryGenerationInputSchema
>;

const ChildSafeStoryGenerationOutputSchema = z.object({
  rewrittenStory: z
    .string()
    .describe('The rewritten story text, tailored for the specified child age.'),
});
export type ChildSafeStoryGenerationOutput = z.infer<
  typeof ChildSafeStoryGenerationOutputSchema
>;

export async function childSafeStoryGeneration(
  input: ChildSafeStoryGenerationInput
): Promise<ChildSafeStoryGenerationOutput> {
  return childSafeStoryGenerationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'childSafeStoryGenerationPrompt',
  input: {schema: ChildSafeStoryGenerationInputSchema},
  output: {schema: ChildSafeStoryGenerationOutputSchema},
  prompt: `You are a helpful AI assistant that rewrites stories to be child-friendly.

Rewrite the following story for a child of age {{childAge}}:

Original Story: {{{storyText}}}

Rewritten Story:`,
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

const childSafeStoryGenerationFlow = ai.defineFlow(
  {
    name: 'childSafeStoryGenerationFlow',
    inputSchema: ChildSafeStoryGenerationInputSchema,
    outputSchema: ChildSafeStoryGenerationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

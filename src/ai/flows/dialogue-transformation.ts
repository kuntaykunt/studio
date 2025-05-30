
'use server';
/**
 * @fileOverview Transforms single-page story text into a dialogue format between a Narrator and a Character.
 *
 * - transformTextToDialogue - A function that handles the text-to-dialogue transformation.
 * - DialogueTransformationInput - The input type for the function.
 * - DialogueTransformationOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DialogueTransformationInputSchema = z.object({
  storyPageText: z.string().describe('The original text content of the story page.'),
  childAge: z.number().describe('The age of the child for whom the story is intended.'),
  // Potentially add characterName if we want to pass it explicitly in the future
});
export type DialogueTransformationInput = z.infer<typeof DialogueTransformationInputSchema>;

const DialogueTransformationOutputSchema = z.object({
  dialogueText: z
    .string()
    .describe('The story page text rewritten as a dialogue between Narrator and Character.'),
});
export type DialogueTransformationOutput = z.infer<typeof DialogueTransformationOutputSchema>;

export async function transformTextToDialogue(
  input: DialogueTransformationInput
): Promise<DialogueTransformationOutput> {
  return dialogueTransformationFlow(input);
}

const dialoguePrompt = ai.definePrompt({
  name: 'dialogueTransformationPrompt',
  input: {schema: DialogueTransformationInputSchema},
  output: {schema: DialogueTransformationOutputSchema},
  prompt: `You are an expert scriptwriter for children's audiobooks.
Your task is to convert a piece of story text, intended for a {{childAge}}-year-old child, into a dialogue script.
The script should be between a "Narrator" and the primary "Character" involved in that specific piece of text.

Instructions:
- If the text is purely descriptive, sets the scene, or describes actions from an omniscient point of view, assign it to the "Narrator".
- If the text contains direct speech from a character, or describes their direct actions or thoughts from their perspective, assign it to "Character".
- If a specific character's name is clearly identifiable within the provided page text (e.g., "Elara said...", "Timmy thought..."), use that character's name instead of the generic "Character" for their lines. If no specific name is evident, use "Character".
- Ensure the original meaning and narrative flow of the story text are preserved.
- The language, tone, and complexity must be appropriate and engaging for a {{childAge}}-year-old child.
- The output MUST be only the dialogue script, formatted with each speaker on a new line, like this example:
  Narrator: [Narrator's part of the story]
  Character: [Character's speech or thought]
  Narrator: [More narration]

Original Page Text:
"{{{storyPageText}}}"

Rewritten Dialogue Script:
`,
  config: {
    temperature: 0.5, // Slightly lower temperature for more focused scriptwriting
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
    ],
  },
});

const dialogueTransformationFlow = ai.defineFlow(
  {
    name: 'dialogueTransformationFlow',
    inputSchema: DialogueTransformationInputSchema,
    outputSchema: DialogueTransformationOutputSchema,
  },
  async (input: DialogueTransformationInput) => {
    const {output} = await dialoguePrompt(input);
    if (!output?.dialogueText) {
      // Fallback if the model doesn't produce the expected output
      console.warn("Dialogue transformation did not return expected dialogueText. Falling back to original text for TTS.");
      return { dialogueText: `Narrator: ${input.storyPageText}` }; // Simple fallback
    }
    return output;
  }
);


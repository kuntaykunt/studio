
'use server';
/**
 * @fileOverview Voice generation flow for creating voiceovers for story pages.
 *
 * - generateVoiceover - A function that generates a voiceover for given text.
 * - GenerateVoiceoverInput - The input type for the generateVoiceover function.
 * - GenerateVoiceoverOutput - The return type for the generateVoiceover function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateVoiceoverInputSchema = z.object({
  storyText: z.string().describe('The text for the story page voiceover.'),
  voiceGender: z.enum(['male', 'female']).describe('The gender of the voiceover.'),
  childAge: z.number().describe('The age of the child for whom the story is intended, to tailor voice style.'),
});
export type GenerateVoiceoverInput = z.infer<typeof GenerateVoiceoverInputSchema>;

const GenerateVoiceoverOutputSchema = z.object({
  audioDataUri: z.string().describe('The generated audio data URI for the voiceover.'),
});
export type GenerateVoiceoverOutput = z.infer<typeof GenerateVoiceoverOutputSchema>;

export async function generateVoiceover(input: GenerateVoiceoverInput): Promise<GenerateVoiceoverOutput> {
  return voiceGenerationFlow(input);
}

const voiceGenerationPrompt = ai.definePrompt({
  name: 'voiceGenerationPrompt',
  input: {schema: GenerateVoiceoverInputSchema},
  output: {schema: GenerateVoiceoverOutputSchema},
  prompt: `You are an expert voice actor specializing in children's story narration.
Your task is to generate a voiceover for the provided story text.

Story Text: {{{storyText}}}

Voice Requirements:
- Use a clear, warm, and engaging {{{voiceGender}}} voice.
- The voice style, pacing, and intonation should be perfectly suited for a child aged {{{childAge}}}.
- Ensure narration is easy for a young child to follow, with playful energy where appropriate to the text.
- The output should be an audio data URI.

Generate the voiceover.
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

const voiceGenerationFlow = ai.defineFlow(
  {
    name: 'voiceGenerationFlow',
    inputSchema: GenerateVoiceoverInputSchema,
    outputSchema: GenerateVoiceoverOutputSchema,
  },
  async input => {
    // const {output} = await voiceGenerationPrompt(input); // This would be the call if the model supported direct audio generation.
    // return output!;

    // For now, since actual audio generation isn't directly implemented/supported 
    // with the current basic Genkit setup for this model, we'll return a placeholder.
    // Future development would involve configuring appropriate Genkit models (like Gemini with TTS capabilities)
    // and updating this flow to call them. The prompt above is structured to guide such a model.
    return {audioDataUri: 'data:audio/wav;base64,placeholder-audio-data'}; // Placeholder
  }
);

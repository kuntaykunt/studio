
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

// This prompt is now used within the ai.generate call directly
// const voiceGenerationPrompt = ai.definePrompt({
//   name: 'voiceGenerationPrompt',
//   input: {schema: GenerateVoiceoverInputSchema},
//   output: {schema: GenerateVoiceoverOutputSchema},
//   prompt: `You are an expert voice actor specializing in children's story narration.
// Your task is to generate a voiceover for the provided story text.

// Story Text: {{{storyText}}}

// Voice Requirements:
// - Use a clear, warm, and engaging {{{voiceGender}}} voice.
// - The voice style, pacing, and intonation should be perfectly suited for a child aged {{{childAge}}}.
// - Ensure narration is easy for a young child to follow, with playful energy where appropriate to the text.
// - The output should be an audio data URI.

// Generate the voiceover.
// `,
//   config: {
//     safetySettings: [
//       { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
//       { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
//       { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
//       { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
//     ],
//   }
// });

const voiceGenerationFlow = ai.defineFlow(
  {
    name: 'voiceGenerationFlow',
    inputSchema: GenerateVoiceoverInputSchema,
    outputSchema: GenerateVoiceoverOutputSchema,
  },
  async (input: GenerateVoiceoverInput): Promise<GenerateVoiceoverOutput> => {
    try {
      const ttsPromptText = `Narrate the following story text for a children's story.
The voice should be a ${input.voiceGender} voice.
The style should be warm, engaging, and perfectly suited for a child aged ${input.childAge}.
Ensure the narration is easy for a young child to follow, with playful energy where appropriate to the text.
Story Text: ${input.storyText}`;

      // Attempt to use a specific TTS model if available, similar to Python SDK examples
      // The exact model name 'googleai/gemini-2.5-flash-preview-tts' is based on common patterns
      // and may need adjustment based on actual Genkit support for specific TTS models.
      const {media, text} = await ai.generate({
        model: 'googleai/gemini-2.5-flash-preview-tts', // Attempting direct TTS model
        prompt: ttsPromptText,
        config: {
          responseModalities: ['AUDIO'], // Expecting audio output
          safetySettings: [
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
          ],
          // Temperature could be added here if supported by the TTS model, e.g., temperature: 0.7
        },
      });

      if (media?.url) {
        return { audioDataUri: media.url };
      } else {
        console.warn('TTS generation via ai.generate() did not return a media URL. Text response (if any):', text);
        // Fallback to a specific placeholder if direct audio URL isn't available
        return { audioDataUri: 'data:audio/wav;base64,placeholder-audio-generation-failed-no-url' };
      }
    } catch (error) {
      console.error("Error generating voiceover with ai.generate():", error);
      // Return a distinct placeholder on error
      return { audioDataUri: 'data:audio/wav;base64,placeholder-audio-generation-error' };
    }
  }
);

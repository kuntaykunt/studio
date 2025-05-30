
'use server';
/**
 * @fileOverview Voice generation flow for creating voiceovers for story pages.
 * It now first transforms the page text into a dialogue script.
 *
 * - generateVoiceover - A function that generates a voiceover for given text.
 * - GenerateVoiceoverInput - The input type for the generateVoiceover function.
 * - GenerateVoiceoverOutput - The return type for the generateVoiceover function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { transformTextToDialogue, type DialogueTransformationInput } from './dialogue-transformation'; 

// Schemas are kept internal to this 'use server' file
const GenerateVoiceoverInputSchema = z.object({
  storyText: z.string().describe('The original text for the story page voiceover.'),
  voiceGender: z.enum(['male', 'female']).describe('The gender of the voiceover.'),
  childAge: z.number().describe('The age of the child for whom the story is intended, to tailor voice style.'),
});
export type GenerateVoiceoverInput = z.infer<typeof GenerateVoiceoverInputSchema>;

const GenerateVoiceoverOutputSchema = z.object({
  audioDataUri: z.string().describe('The generated audio data URI for the voiceover.'),
  transformedDialogue: z.string().optional().describe('The dialogue script used for TTS.'),
});
export type GenerateVoiceoverOutput = z.infer<typeof GenerateVoiceoverOutputSchema>;

export async function generateVoiceover(input: GenerateVoiceoverInput): Promise<GenerateVoiceoverOutput> {
  return voiceGenerationFlow(input);
}

const voiceGenerationFlow = ai.defineFlow(
  {
    name: 'voiceGenerationFlow',
    inputSchema: GenerateVoiceoverInputSchema,
    outputSchema: GenerateVoiceoverOutputSchema,
  },
  async (input: GenerateVoiceoverInput): Promise<GenerateVoiceoverOutput> => {
    let dialogueScript = '';
    try {
      // Step 1: Transform original page text to dialogue script
      const dialogueInput: DialogueTransformationInput = {
        storyPageText: input.storyText,
        childAge: input.childAge,
      };
      const dialogueOutput = await transformTextToDialogue(dialogueInput);
      dialogueScript = dialogueOutput.dialogueText;
    } catch (dialogueError) {
      console.error("Error transforming text to dialogue:", dialogueError);
      // Fallback: use original text with a Narrator prefix if transformation fails
      dialogueScript = `Narrator: ${input.storyText}`; 
    }
    
    try {
      console.log(`Attempting TTS for dialogue (age: ${input.childAge}, gender: ${input.voiceGender}):\n"${dialogueScript.substring(0, 250)}..."`); 
      
      const ttsPromptText = `Narrate the following children's story dialogue.
The voice should be a ${input.voiceGender} voice.
The style should be warm, engaging, and perfectly suited for a child aged ${input.childAge}.
Ensure the narration is easy for a young child to follow, with playful energy where appropriate to the text.
The dialogue is between a Narrator and one or more Characters. If the model supports distinct voices for speakers indicated by "Narrator:" and "Character:", please use them.

Dialogue Script:
${dialogueScript}`;

      const {media, text} = await ai.generate({
        model: 'googleai/gemini-2.5-flash-preview-tts', 
        prompt: ttsPromptText,
        config: {
          responseModalities: ['AUDIO'], 
          safetySettings: [
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
          ],
        },
      });

      // More stringent check for a valid media URL
      if (media?.url && media.url.trim() !== '' && media.url.startsWith('data:audio')) {
        console.log('TTS generation successful. Received audio data URI starting with:', media.url.substring(0, 100) + "...");
        return { audioDataUri: media.url, transformedDialogue: dialogueScript };
      } else {
        console.warn('TTS generation via ai.generate() did NOT return a valid audio data URI.');
        console.warn('Received media object (stringified):', JSON.stringify(media, null, 2));
        console.warn('Received text response (if any):', text); // Log any text response from the model
        return { 
            audioDataUri: 'data:audio/wav;base64,placeholder-audio-generation-failed-invalid-url', // Specific placeholder
            transformedDialogue: dialogueScript 
        };
      }
    } catch (error) {
      console.error("Critical error during voiceover generation with ai.generate():", error);
      return { 
          audioDataUri: 'data:audio/wav;base64,placeholder-audio-generation-threw-error', // Specific placeholder
          transformedDialogue: dialogueScript
      };
    }
  }
);


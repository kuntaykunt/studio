
import { config } from 'dotenv';
config();

import '@/ai/flows/image-generation.ts';
import '@/ai/flows/animation-generation.ts'; // Renamed from video-clip-generation
import '@/ai/flows/child-safe-story-generation.ts';
import '@/ai/flows/voice-generation.ts'; 
import '@/ai/flows/dialogue-transformation.ts'; // Added new flow

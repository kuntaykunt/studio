
export interface VisualStyle {
  id: string;
  name: string;
  description: string;
}

export const visualStyleOptions: VisualStyle[] = [
  {
    id: 'ai_default',
    name: 'AI Default (No Specific Style)',
    description: '',
  },
  {
    id: 'watercolor',
    name: 'Classic Watercolor Storybook',
    description:
      'Art Style: Soft, hand-painted watercolor with gentle gradients and delicate textures, reminiscent of traditional children’s books like Beatrix Potter. Color Palette: Pastel tones (soft pinks, blues, greens, and yellows) with warm accents for the dragon’s scales and golden eyes. Muted earth tones for the Whispering Woods. Background Elements: Lush, dreamy forest with wispy trees and glowing fireflies. The pond sparkles with gentle ripples, and flowers dot the clearing. Use light, translucent brushstrokes for a magical feel. Mood: Warm, inviting, and nostalgic, perfect for bedtime stories.',
  },
  {
    id: 'cartoon',
    name: 'Whimsical Cartoon',
    description:
      'Art Style: Bold, clean lines with a modern cartoon aesthetic, similar to Pixar shorts or Adventure Time. Exaggerated proportions for a playful vibe. Color Palette: Bright, saturated colors—emerald green for the dragon, vibrant red for apples, and deep blues and purples for the Whispering Woods. High contrast for visual pop. Background Elements: Exaggerated, curvy trees with polka-dot leaves. The pond is a bright turquoise with cartoonish fish doing flips. Fireflies are oversized, glowing orbs. Mood: Fun, energetic, and full of personality, appealing to kids who love animated shows.',
  },
  {
    id: 'sketchbook',
    name: 'Hand-Drawn Sketchbook',
    description:
      'Art Style: Loose, pencil-sketch style with cross-hatching and minimal coloring, like a child’s doodle come to life. Think Harold and the Purple Crayon. Color Palette: Mostly grayscale with pencil textures, accented with pops of color—green for the dragon’s scales, red for apples, and gold for the dragon’s eyes. Background Elements: Rough, sketchy forest with jagged trees and squiggly leaves. The pond is a wobbly circle with sketchy fish. Fireflies are little scribbled stars. Mood: Imaginative and raw, encouraging kids to feel like they could draw the story themselves.',
  },
  {
    id: 'digital_pop',
    name: 'Vibrant Digital Pop',
    description:
      'Art Style: Sleek, digital art with bold outlines and smooth gradients, inspired by modern children’s apps or games like Toca Boca. Color Palette: Neon-bright colors—lime green for the dragon, hot pink and orange for the forest, and electric blue for the pond. High saturation for a lively feel. Background Elements: A bold, abstract forest with geometric trees and glowing, neon fireflies. The pond is a vibrant, reflective surface with digital sparkles. Mood: Modern, energetic, and techy, perfect for kids who love digital games.',
  },
  {
    id: 'claymation',
    name: 'Soft Claymation Aesthetic',
    description:
      'Art Style: Textured, 3D-like visuals mimicking stop-motion claymation, with a tactile, handmade feel, like Wallace and Gromit or Coraline. Color Palette: Warm, earthy tones—olive green for the dragon, terracotta for the forest, and soft blues for the pond. Subtle texture for a clay-like look. Background Elements: A tactile forest with lumpy trees and bumpy leaves. The pond has a glossy, wet clay look, and fireflies are tiny glowing beads. Mood: Cozy, handmade, and quirky, giving a warm, crafted feel.',
  },
  {
    id: 'retro_book',
    name: 'Retro Picture Book',
    description:
      'Art Style: Flat, mid-century-inspired illustrations with bold shapes and limited colors, like The Little Golden Books or Where the Wild Things Are. Color Palette: A limited palette of mustard yellow, forest green, teal, and coral. Black outlines for definition. Background Elements: Flat, patterned trees with polka dots or stripes. The pond is a teal oval with simple fish shapes. Fireflies are yellow dots. Mood: Nostalgic, bold, and charming, with a timeless storybook feel.',
  },
  {
    id: 'fantasy_glow',
    name: 'Fantasy Glow',
    description:
      'Art Style: Luminous, ethereal digital painting with a magical, glowing aesthetic, inspired by fantasy art like The Hobbit illustrations. Color Palette: Deep jewel tones—emerald, sapphire, and amethyst—for the forest, with glowing accents of gold and turquoise for the dragon and pond. Background Elements: A dreamy forest with misty air and glowing fireflies that look like floating stars. The pond is a mirror-like surface with radiant fish. Mood: Enchanting, magical, and awe-inspiring, perfect for sparking wonder in kids.',
  },
];

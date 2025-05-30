
export interface LearningTag {
  id: string;
  name: string;
  learningFocus: string;
  descriptionForPrompt: string;
  fullDescription: string;
  activity: string;
}

export const learningTags: LearningTag[] = [
  {
    id: 'counting_math',
    name: 'Counting (Math)',
    learningFocus: 'Basic counting and number recognition.',
    descriptionForPrompt: "Incorporate scenes where characters share items (e.g., food or objects), allowing for counting of items or recipients. This reinforces number sense and one-to-one correspondence.",
    fullDescription: "When a character shares items (e.g., food or objects) with others in the story, children can count the items or recipients, reinforcing number sense and one-to-one correspondence.",
    activity: "Pause during a scene where items are shared. Ask children to count the items (e.g., “How many pieces of food are shared? Let’s count: 1, 2, 3!”) or the characters receiving them. Use fingers, draw items on paper, or use small objects (e.g., blocks) to count aloud, encouraging kids to tap or clap for each number."
  },
  {
    id: 'addition_subtraction_math',
    name: 'Addition and Subtraction (Math)',
    learningFocus: 'Simple addition and subtraction concepts.',
    descriptionForPrompt: "Illustrate simple addition or subtraction when characters give away or collect items, showing how quantities change (e.g., reducing a total by sharing or adding items to a group).",
    fullDescription: "When a character gives away or collects items, the story can illustrate adding or subtracting quantities, such as reducing a total by sharing or adding items to a group.",
    activity: "After a sharing scene, ask, “If the character had 5 items and gave away 2, how many are left?” Use fingers, draw items, or use objects to show the math (e.g., 5 - 2 = 3). Alternatively, if items are collected, ask, “If they had 3 and found 2 more, how many now?” (3 + 2 = 5)."
  },
  {
    id: 'gardening_plant_life_cycle',
    name: 'Gardening (Plant Life Cycle)',
    learningFocus: 'Understanding plant needs and growth.',
    descriptionForPrompt: "If the story involves plants or crops, introduce the concept of plants needing care like water and sunlight to grow. Show plants struggling or thriving based on this care.",
    fullDescription: "If the story involves a natural setting where plants or crops are mentioned (e.g., struggling or thriving), it can introduce the concept of plants needing care, such as water and sunlight, to grow.",
    activity: "Discuss why plants in the story might need help (e.g., lack of water). Have children plant a seed (e.g., bean or sunflower) in a cup with soil, water it, and place it in sunlight. Track growth over days, connecting it to the story’s theme of caring for nature."
  },
  {
    id: 'sharing_fairness_social_math',
    name: 'Sharing and Fairness (Social-Emotional Math)',
    learningFocus: 'Dividing resources equally to practice fairness.',
    descriptionForPrompt: "When characters share resources, explore concepts of equal division and the social value of fairness. Show how sharing equally can be achieved.",
    fullDescription: "When characters share resources (e.g., food or objects) with others, it provides a chance to explore division and the social value of fairness.",
    activity: "Give children a small number of items (e.g., 8 candies or blocks) and ask them to share equally among a few characters (e.g., 2 or 4 friends). Ask, “How many does each get?” (e.g., 8 ÷ 2 = 4). Use toys or drawings to represent characters and discuss how sharing makes everyone happy."
  },
  {
    id: 'patterns_math',
    name: 'Patterns (Math)',
    learningFocus: 'Recognizing and creating patterns.',
    descriptionForPrompt: "If the story describes colorful or repeating elements (e.g., in nature or a character’s actions), introduce pattern recognition, such as alternating colors or sequences of actions.",
    fullDescription: "If the story describes colorful or repeating elements (e.g., in nature or a character’s actions), it can introduce pattern recognition, such as alternating colors or actions.",
    activity: "During a scene with repetitive elements (e.g., colorful objects), show children a simple pattern (e.g., blue, yellow, blue, yellow) using beads, paper, or toys. Ask them to continue the pattern or create their own inspired by the story (e.g., “Make a pattern like the colors in the story!”). Encourage them to name the pattern."
  },
  {
    id: 'environmental_awareness_ecology',
    name: 'Environmental Awareness (Gardening/Ecology)',
    learningFocus: 'Understanding ecosystems and caring for nature.',
    descriptionForPrompt: "If the story features animals or plants in a natural setting, highlight the importance of a balanced ecosystem and how characters' actions can affect living things positively or negatively.",
    fullDescription: "If the story involves animals or plants in a natural setting, it can highlight the importance of a balanced ecosystem and how actions affect living things.",
    activity: "Create a craft representing the story’s environment (e.g., a paper plate “pond” with drawn animals and plants). Discuss what plants and animals need to thrive (e.g., water, food). Ask, “How did the character help nature? What can we do?” Encourage ideas like watering plants or recycling."
  },
  {
    id: 'measurement_math',
    name: 'Measurement (Math)',
    learningFocus: 'Exploring size and comparison.',
    descriptionForPrompt: "If the story contrasts characters or objects of different sizes, introduce opportunities to compare sizes and discuss basic measurement concepts like bigger, smaller, taller, shorter.",
    fullDescription: "If the story contrasts characters or objects of different sizes (e.g., a small hero and a large creature), it offers opportunities to compare sizes and introduce basic measurement.",
    activity: "After a scene with size differences, ask children to compare objects (e.g., “Is the hero’s tool bigger or smaller than the creature’s?”). Use a ruler or string to measure toys or drawings (e.g., a 4-inch “tool” vs. a 12-inch “creature”). Have kids draw story elements and compare their sizes on paper."
  }
];

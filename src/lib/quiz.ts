// Quiz questions inspired by Lavanila's perfume quiz.
// Each answer maps to one or more accords.

export interface QuizQuestion {
  question: string;
  options: { label: string; description: string; accords: string[] }[];
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: "How would you describe your everyday vibe?",
    options: [
      { label: "Calm & grounded", description: "Cozy nights, warm drinks, quiet mornings", accords: ["woody", "amber", "vanilla"] },
      { label: "Bright & energetic", description: "Always on the go, sunshine person", accords: ["citrus", "fresh", "aromatic"] },
      { label: "Romantic & dreamy", description: "Soft, elegant, a little mysterious", accords: ["floral", "powdery", "rose"] },
      { label: "Bold & adventurous", description: "Unconventional, attention-grabbing", accords: ["leather", "oud", "smoky"] },
    ],
  },
  {
    question: "Which setting sounds most like you?",
    options: [
      { label: "A cozy cabin in the woods", description: "Fireplace, pine trees, wool blankets", accords: ["woody", "earthy", "smoky"] },
      { label: "A Mediterranean terrace", description: "Sea breeze, lemon trees, golden light", accords: ["citrus", "marine", "fresh"] },
      { label: "A garden in full bloom", description: "Roses, jasmine, morning dew", accords: ["floral", "green", "white floral"] },
      { label: "A bustling night market", description: "Spices, sweets, warm air", accords: ["warm spicy", "sweet", "gourmand"] },
    ],
  },
  {
    question: "Pick a season that matches your energy.",
    options: [
      { label: "Autumn", description: "Mellow, introspective, comforting", accords: ["amber", "warm spicy", "vanilla"] },
      { label: "Spring", description: "Fresh, vibrant, full of possibility", accords: ["floral", "green", "citrus"] },
      { label: "Summer", description: "Bright, spontaneous, carefree", accords: ["tropical", "fruity", "aquatic"] },
      { label: "Winter", description: "Intimate, deep, rich", accords: ["oud", "leather", "woody"] },
    ],
  },
  {
    question: "What kind of candle would you light?",
    options: [
      { label: "Vanilla & sandalwood", description: "Warm, creamy, enveloping", accords: ["vanilla", "sweet", "amber"] },
      { label: "Fresh linen & sea salt", description: "Clean, airy, crisp", accords: ["fresh", "marine", "musky"] },
      { label: "Rose & peony", description: "Soft, floral, romantic", accords: ["rose", "floral", "powdery"] },
      { label: "Cedarwood & tobacco", description: "Smoky, refined, complex", accords: ["woody", "tobacco", "leather"] },
    ],
  },
  {
    question: "Which scent notes make you lean in?",
    options: [
      { label: "Vanilla & caramel", description: "Warm, gourmand, comforting", accords: ["vanilla", "sweet", "caramel"] },
      { label: "Bergamot & lemon", description: "Zesty, bright, uplifting", accords: ["citrus", "fresh", "aromatic"] },
      { label: "Jasmine & iris", description: "Elegant, soft, timeless", accords: ["floral", "iris", "white floral"] },
      { label: "Pepper & incense", description: "Smoky, spicy, mysterious", accords: ["warm spicy", "smoky", "earthy"] },
    ],
  },
];

/**
 * Tally quiz answers to find the user's top accords.
 * Each selected option contributes its accords with equal weight.
 * Returns accords sorted by frequency (most common first).
 */
export function tallyQuizAccords(selectedIndices: number[]): string[] {
  const counts: Record<string, number> = {};

  for (let q = 0; q < selectedIndices.length; q++) {
    const optionIdx = selectedIndices[q];
    if (optionIdx < 0 || !QUIZ_QUESTIONS[q]) continue;
    const accords = QUIZ_QUESTIONS[q].options[optionIdx]?.accords ?? [];
    for (const accord of accords) {
      counts[accord] = (counts[accord] ?? 0) + 1;
    }
  }

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([accord]) => accord);
}

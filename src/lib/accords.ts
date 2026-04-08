// Accord color system ported from the original Streamlit app
// Maps accord names to [background, foreground] color pairs

const ACCORD_COLORS: Record<string, [string, string]> = {
  // Fresh: teal
  fresh: ["#e0f4f7", "#0e7490"],
  aquatic: ["#e0f4f7", "#0e7490"],
  ozonic: ["#e0f4f7", "#0e7490"],
  marine: ["#e0f4f7", "#0e7490"],
  salty: ["#e0f4f7", "#0e7490"],
  clean: ["#e0f4f7", "#0e7490"],
  // Floral: mauve
  floral: ["#fce7f3", "#9d174d"],
  rose: ["#fce7f3", "#9d174d"],
  "white floral": ["#fce7f3", "#9d174d"],
  iris: ["#fce7f3", "#9d174d"],
  violet: ["#fce7f3", "#9d174d"],
  jasmine: ["#fce7f3", "#9d174d"],
  "orange blossom": ["#fce7f3", "#9d174d"],
  lily: ["#fce7f3", "#9d174d"],
  peony: ["#fce7f3", "#9d174d"],
  "yellow floral": ["#fce7f3", "#9d174d"],
  tuberose: ["#fce7f3", "#9d174d"],
  // Woody: warm brown
  woody: ["#fdf2e4", "#92400e"],
  cedar: ["#fdf2e4", "#92400e"],
  sandalwood: ["#fdf2e4", "#92400e"],
  vetiver: ["#fdf2e4", "#92400e"],
  oud: ["#f5e6d8", "#7c2d12"],
  // Citrus: yellow
  citrus: ["#fef9c3", "#854d0e"],
  fruity: ["#fef3c7", "#b45309"],
  tropical: ["#fef3c7", "#b45309"],
  // Oriental/Warm: clay
  vanilla: ["#fde8c8", "#92400e"],
  amber: ["#fde8c8", "#92400e"],
  balsamic: ["#fde8c8", "#92400e"],
  sweet: ["#fde8c8", "#92400e"],
  gourmand: ["#fde8c8", "#92400e"],
  caramel: ["#fde8c8", "#92400e"],
  chocolate: ["#fde8c8", "#92400e"],
  honey: ["#fde8c8", "#92400e"],
  lactonic: ["#fde8c8", "#92400e"],
  cacao: ["#fde8c8", "#92400e"],
  coconut: ["#fde8c8", "#92400e"],
  coffee: ["#fde8c8", "#92400e"],
  // Spicy: maroon
  "warm spicy": ["#fee2e2", "#991b1b"],
  "fresh spicy": ["#fee2e2", "#991b1b"],
  spicy: ["#fee2e2", "#991b1b"],
  cinnamon: ["#fee2e2", "#991b1b"],
  // Aromatic/Herbal: green
  aromatic: ["#dcfce7", "#166534"],
  lavender: ["#dcfce7", "#166534"],
  herbal: ["#dcfce7", "#166534"],
  fougere: ["#dcfce7", "#166534"],
  conifer: ["#dcfce7", "#166534"],
  // Earthy/Green: olive
  earthy: ["#ecfccb", "#3f6212"],
  mossy: ["#ecfccb", "#3f6212"],
  green: ["#ecfccb", "#3f6212"],
  patchouli: ["#ecfccb", "#3f6212"],
  // Leather: dark tan
  leather: ["#f3e8d0", "#78350f"],
  suede: ["#f3e8d0", "#78350f"],
  // Musky/Powdery: gray
  musky: ["#f3f4f6", "#4b5563"],
  powdery: ["#f3f4f6", "#6b7280"],
  animalic: ["#f3f4f6", "#4b5563"],
  musk: ["#f3f4f6", "#4b5563"],
  aldehydic: ["#f3f4f6", "#6b7280"],
  // Smoky/Dark
  smoky: ["#e7e5e4", "#44403c"],
  tobacco: ["#e7e5e4", "#44403c"],
  // Boozy
  rum: ["#fde8c8", "#78350f"],
  whiskey: ["#fde8c8", "#78350f"],
  wine: ["#f5e6d8", "#7c2d12"],
  champagne: ["#fef9c3", "#854d0e"],
};

const DEFAULT_COLOR: [string, string] = ["#f3f4f6", "#6b7280"];

export function getAccordColor(accord: string): { bg: string; fg: string } {
  const [bg, fg] = ACCORD_COLORS[accord.toLowerCase()] ?? DEFAULT_COLOR;
  return { bg, fg };
}

export const GENDER_SYMBOL: Record<string, string> = {
  "for women": "\u2640",
  "for men": "\u2642",
  "for women and men": "\u26A5",
};

// The main accord families for the filter builder and quiz
export const ACCORD_FAMILIES: Record<string, string[]> = {
  Fresh: ["fresh", "aquatic", "ozonic", "marine", "clean"],
  Floral: ["floral", "rose", "white floral", "iris", "violet", "tuberose", "yellow floral"],
  Woody: ["woody", "cedar", "sandalwood", "oud"],
  Citrus: ["citrus", "fruity", "tropical"],
  "Warm & Sweet": ["vanilla", "amber", "sweet", "gourmand", "caramel", "chocolate", "honey", "cacao", "coconut", "coffee"],
  Spicy: ["warm spicy", "fresh spicy", "cinnamon"],
  Aromatic: ["aromatic", "lavender", "herbal"],
  Earthy: ["earthy", "mossy", "green", "patchouli"],
  Leather: ["leather"],
  Musky: ["musky", "powdery", "aldehydic"],
  Smoky: ["smoky", "tobacco"],
};

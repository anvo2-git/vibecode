/**
 * Static descriptions and note examples for each major accord family.
 * Used by the /info page.
 */

export interface AccordInfo {
  name: string;
  family: string;
  description: string;
  spikedWith: string;  // what it smells like in plain language
  commonNotes: string[];
}

export const ACCORD_INFO: AccordInfo[] = [
  // Fresh
  { name: "fresh", family: "Fresh", description: "Clean, airy, and invigorating. Think of the smell after rain or freshly laundered linen.", spikedWith: "Cool, crisp, breezy", commonNotes: ["bergamot", "green tea", "linen", "cucumber", "water lily"] },
  { name: "aquatic", family: "Fresh", description: "Oceanic and watery. Evokes sea spray, coastal air, and marine landscapes.", spikedWith: "Watery, salty, cool", commonNotes: ["sea salt", "seaweed", "water notes", "melon", "lotus"] },
  { name: "ozonic", family: "Fresh", description: "The smell of air after a thunderstorm. Metallic, clean, and atmospheric.", spikedWith: "Electric, atmospheric, clean", commonNotes: ["ozone", "rain", "mineral notes", "air accord"] },
  { name: "marine", family: "Fresh", description: "Specifically oceanic — kelp, salt, driftwood. More naturalistic than aquatic.", spikedWith: "Salty, oceanic, briny", commonNotes: ["ambergris", "sea salt", "driftwood", "algae"] },
  { name: "clean", family: "Fresh", description: "Soap, detergent, freshly washed skin. Comfort in a bottle.", spikedWith: "Soapy, soft, laundered", commonNotes: ["white musk", "soap", "aldehydes", "linen"] },

  // Floral
  { name: "floral", family: "Floral", description: "The broadest category. Can range from a single soliflore to a lush garden bouquet.", spikedWith: "Petal-soft, romantic, garden-like", commonNotes: ["jasmine", "rose", "lily", "peony", "magnolia"] },
  { name: "rose", family: "Floral", description: "The queen of perfumery. Can be velvety and deep (Turkish rose) or bright and dewy (Bulgarian rose).", spikedWith: "Romantic, velvety, classic", commonNotes: ["damask rose", "rose absolute", "rose oxide", "geranium"] },
  { name: "white floral", family: "Floral", description: "Heady, opulent, and sometimes narcotic. The big, bold flowers that bloom at night.", spikedWith: "Intoxicating, creamy, lush", commonNotes: ["jasmine", "tuberose", "gardenia", "ylang-ylang", "orange blossom"] },
  { name: "iris", family: "Floral", description: "Powdery, elegant, and cool. One of the most refined notes in perfumery.", spikedWith: "Powdery, sophisticated, violet-like", commonNotes: ["orris root", "iris butter", "violet leaf", "suede"] },
  { name: "violet", family: "Floral", description: "Sweet, powdery, and slightly green. Has a nostalgic, old-fashioned charm.", spikedWith: "Powdery, sweet, retro", commonNotes: ["violet leaf", "ionones", "parma violet", "orris"] },
  { name: "tuberose", family: "Floral", description: "Intensely creamy, almost buttery. One of the most powerful white florals.", spikedWith: "Buttery, narcotic, opulent", commonNotes: ["tuberose absolute", "coconut", "jasmine", "gardenia"] },
  { name: "yellow floral", family: "Floral", description: "Bright, sunny flowers. Less heavy than white florals, more cheerful.", spikedWith: "Sunny, bright, honeyed", commonNotes: ["mimosa", "champaca", "osmanthus", "narcissus", "freesia"] },

  // Woody
  { name: "woody", family: "Woody", description: "The backbone of most perfumes. Ranges from dry and pencil-shaving to creamy and enveloping.", spikedWith: "Warm, grounding, natural", commonNotes: ["cedarwood", "sandalwood", "vetiver", "guaiac wood", "cashmeran"] },
  { name: "cedar", family: "Woody", description: "Dry, crisp, and pencil-like. A sharp, clean wood that adds structure.", spikedWith: "Dry, sharp, pencil shavings", commonNotes: ["Virginia cedar", "Atlas cedar", "cedarwood oil"] },
  { name: "sandalwood", family: "Woody", description: "Creamy, milky, and warm. The most comforting of the woods.", spikedWith: "Creamy, milky, smooth", commonNotes: ["Indian sandalwood", "Australian sandalwood", "Mysore sandalwood"] },
  { name: "oud", family: "Woody", description: "Dark, animalic, and complex. The resinous heartwood prized in Middle Eastern perfumery.", spikedWith: "Dark, medicinal, smoky-sweet", commonNotes: ["agarwood", "oud oil", "cypriol", "guaiac wood"] },

  // Citrus
  { name: "citrus", family: "Citrus", description: "Bright, zesty, and energising. The classic top-note family that lifts any fragrance.", spikedWith: "Zesty, sparkling, uplifting", commonNotes: ["bergamot", "lemon", "grapefruit", "orange", "mandarin", "lime"] },
  { name: "fruity", family: "Citrus", description: "Sweet, juicy fruits beyond citrus. Playful and youthful.", spikedWith: "Juicy, sweet, playful", commonNotes: ["peach", "apple", "pear", "raspberry", "blackcurrant", "mango"] },
  { name: "tropical", family: "Citrus", description: "Exotic, sun-drenched fruits. Vacation in a bottle.", spikedWith: "Exotic, lush, sun-kissed", commonNotes: ["coconut", "pineapple", "passion fruit", "mango", "lychee"] },

  // Warm & Sweet
  { name: "vanilla", family: "Warm & Sweet", description: "Warm, comforting, and universally appealing. Can be gourmand-sweet or dry and smoky.", spikedWith: "Cozy, sweet, comforting", commonNotes: ["vanilla bean", "vanillin", "tonka bean", "benzoin"] },
  { name: "amber", family: "Warm & Sweet", description: "A warm, resinous blend. Not a single ingredient but a fantasy accord of labdanum, benzoin, and vanilla.", spikedWith: "Warm, golden, resinous", commonNotes: ["labdanum", "benzoin", "vanilla", "copal", "styrax"] },
  { name: "sweet", family: "Warm & Sweet", description: "General sweetness that can come from many sources — sugar, caramel, honey, or synthetic musks.", spikedWith: "Sugary, indulgent, dessert-like", commonNotes: ["caramel", "praline", "marshmallow", "cotton candy"] },
  { name: "gourmand", family: "Warm & Sweet", description: "Edible, dessert-like fragrances. The 'good enough to eat' category.", spikedWith: "Edible, bakery-like, indulgent", commonNotes: ["chocolate", "coffee", "caramel", "praline", "cinnamon bun"] },
  { name: "coffee", family: "Warm & Sweet", description: "Rich, roasted, and slightly bitter. Adds depth and a modern edge.", spikedWith: "Roasted, bitter, energising", commonNotes: ["espresso", "coffee bean", "mocha", "roasted notes"] },
  { name: "honey", family: "Warm & Sweet", description: "Golden, thick sweetness with animalic undertones. Warm and sensual.", spikedWith: "Golden, waxy, animalic-sweet", commonNotes: ["beeswax", "honey absolute", "mead", "royal jelly"] },

  // Spicy
  { name: "warm spicy", family: "Spicy", description: "Baking spices and warmth. Cozy, rich, and enveloping.", spikedWith: "Warm, baking spice, rich", commonNotes: ["cinnamon", "clove", "nutmeg", "cardamom", "star anise"] },
  { name: "fresh spicy", family: "Spicy", description: "Bright, peppery spice with a zing. Energetic rather than cozy.", spikedWith: "Peppery, bright, invigorating", commonNotes: ["black pepper", "pink pepper", "ginger", "elemi", "juniper"] },
  { name: "cinnamon", family: "Spicy", description: "Specifically the warm, sweet bark note. Festive and comforting.", spikedWith: "Warm, sweet-spicy, festive", commonNotes: ["cinnamon bark", "cassia", "cinnamon leaf"] },

  // Aromatic
  { name: "aromatic", family: "Aromatic", description: "Herbal, medicinal, and fresh. The backbone of classic men's barbershop fragrances.", spikedWith: "Herbal, medicinal, camphoraceous", commonNotes: ["sage", "rosemary", "thyme", "basil", "artemisia"] },
  { name: "lavender", family: "Aromatic", description: "Calming, herbal, and slightly camphoraceous. A pillar of fougere fragrances.", spikedWith: "Calming, herbal, soapy", commonNotes: ["French lavender", "lavandin", "lavender absolute"] },
  { name: "herbal", family: "Aromatic", description: "Green, medicinal herbs. Like walking through a herb garden.", spikedWith: "Green, medicinal, garden-fresh", commonNotes: ["basil", "mint", "thyme", "tarragon", "oregano"] },

  // Earthy
  { name: "earthy", family: "Earthy", description: "Soil, forest floor, petrichor. The smell of the ground after rain.", spikedWith: "Damp, forest-floor, grounding", commonNotes: ["vetiver", "patchouli", "mushroom", "dirt accord", "oakmoss"] },
  { name: "mossy", family: "Earthy", description: "Damp forest moss and lichen. A key component of chypre fragrances.", spikedWith: "Damp, green, forest-like", commonNotes: ["oakmoss", "tree moss", "lichen", "fern"] },
  { name: "green", family: "Earthy", description: "Crushed leaves, stems, and grass. Crisp, dewy, and naturalistic.", spikedWith: "Leafy, dewy, stem-like", commonNotes: ["galbanum", "violet leaf", "fig leaf", "grass", "ivy"] },
  { name: "patchouli", family: "Earthy", description: "Dark, earthy, and slightly sweet. Can be hippie-earthy or refined and chocolatey.", spikedWith: "Earthy, dark, chocolatey", commonNotes: ["patchouli leaf", "patchouli oil", "dark patchouli"] },

  // Leather
  { name: "leather", family: "Leather", description: "Smoky, animalic, and luxurious. From supple suede to rugged saddle leather.", spikedWith: "Smoky, animalic, luxurious", commonNotes: ["birch tar", "castoreum", "suede", "isobutyl quinoline"] },

  // Musky
  { name: "musky", family: "Musky", description: "Skin-like and intimate. Modern musks are clean and laundry-fresh; older ones are animalic.", spikedWith: "Skin-like, intimate, soft", commonNotes: ["white musk", "ambrette", "galaxolide", "musk ketone"] },
  { name: "powdery", family: "Musky", description: "Soft, matte, and cosmetic. Like face powder, lipstick, or baby powder.", spikedWith: "Soft, cosmetic, matte", commonNotes: ["iris", "heliotrope", "violet", "rice powder", "aldehydes"] },
  { name: "aldehydic", family: "Musky", description: "Sparkling, soapy, and abstract. The fizzy quality that made Chanel No. 5 famous.", spikedWith: "Fizzy, soapy, sparkling", commonNotes: ["aldehydes C-11", "aldehydes C-12", "metallic notes"] },

  // Smoky
  { name: "smoky", family: "Smoky", description: "Campfire, incense, and charred wood. Dramatic and atmospheric.", spikedWith: "Campfire, incense, charred", commonNotes: ["incense", "birch tar", "cade", "smoke accord", "guaiac wood"] },
  { name: "tobacco", family: "Smoky", description: "Dried, sweet tobacco leaf. Sophisticated and autumnal.", spikedWith: "Dried, sweet-herbaceous, papery", commonNotes: ["tobacco leaf", "pipe tobacco", "tobacco blossom", "hay"] },
];

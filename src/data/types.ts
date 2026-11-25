export type CardKind = 'L' | 'W' | 'D';

export interface FlashcardItem {
  id: string;
  h: string; // Hangeul text
  c: string; // Correct romanization
  w: string; // Wrong distractor romanization
  kind: CardKind;
  type: string; // Category / Sub-label
  m: string; // Indonesian meaning / note
}

export type ModuleTier = 'free' | 'pro';

export interface CurriculumModule {
  id: string;
  order: string;
  title: string;
  subtitle: string;
  tier: ModuleTier;
  categoryTags: string[];
  estimatedMinutes: number;
  description: string;
  cards: FlashcardItem[];
}

export interface JamoSlot {
  unicodeIndex: number; // Standard Unicode Choseong (0..18), Jungseong (0..20), or Jongseong (0..27)
  char: string;
  roman: string;
  label: string;
}

export interface SyllablePuzzle {
  id: string;
  targetChar: string;
  roman: string;
  meaning: string;
  hint: string;
  initialIdx: number;
  medialIdx: number;
  finalIdx: number;
}

export interface SentencePuzzle {
  id: string;
  tier: ModuleTier;
  topic: string;
  korean: string;
  roman: string;
  meaning: string;
  tokens: string[];
  grammarTip: string;
}

export interface WritingGlyphGuide {
  id: string;
  char: string;
  roman: string;
  name: string;
  category: 'Konsonan' | 'Vokal';
  strokeCount: number;
  tips: string;
  strokes: string[]; // SVG polyline path in 0..200 coordinate space
}

export interface ParticlePuzzle {
  id: string;
  tier: ModuleTier;
  topic: string;
  sentenceBefore: string;
  sentenceAfter: string;
  meaningId: string;
  romanFull: string;
  correctOption: string;
  options: string[];
  explanation: string;
}

export interface BatchimRuleExample {
  korean: string;
  pronounced: string;
  roman: string;
  meaning: string;
  note: string;
}

export interface BatchimGuideSection {
  id: string;
  title: string;
  badge: string;
  summary: string;
  examples: BatchimRuleExample[];
}

export interface DictionaryExampleSentence {
  korean: string;
  roman: string;
  indonesian: string;
}

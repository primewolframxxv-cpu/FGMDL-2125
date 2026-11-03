export type StepId = 'GATE' | 'INTRO' | 'QUESTIONS' | 'COOKIES' | 'PUZZLE';

export interface CheckinAnswers {
  mood: number;
  moodNote: string;
  academics: number;
  academicsNote: string;
  christmas: number;
  christmasNote: string;
}

export type CookieMotif =
  | 'strawberries'
  | 'chicken'
  | 'pumpkin'
  | 'coconut'
  | 'watermelon'
  | 'pink_bow'
  | 'syringe'
  | 'tulip'
  | 'sunflower'
  | 'carnation'
  | 'song';

export interface FortuneCookie {
  id: string;
  motif: CookieMotif;
  label: string;
  quote: string;
  source?: string;
  category: 'caring' | 'motivation' | 'scripture' | 'special';
}

export interface SongDetails {
  title: string;
  artist: string;
  note: string;
  lyricsSnippet: string;
  streamingUrl?: string;
}

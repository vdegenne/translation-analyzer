export const Langs = ['Japanese', 'French'] as const;

export type Language = typeof Langs[number];

export type Translation = {
  lang: Language;
  source: string;
  translated: string;
}
export const Langs = ['Japanese', 'French'] as const;

export type Translation = {
  lang: typeof Langs[number];
  source: string;
  translated: string;
}
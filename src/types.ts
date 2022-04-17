export const Langs = ['Japanese', 'Korean', 'French'] as const;

export type Language = typeof Langs[number];

export type Translation = {
  lang: Language;
  source: string;
  translated: string;
}

// export type Mode = 'discovery'|'practice';
//
export type Kanji = [id:number, character:string, jlpt:number, meaning1:string, meaning2:string];
//
// export type Collection = {
//   name: string;
//   kanjis: string[]; // save the kanji (1 character) rather than all the data. To save space.
// }


export type JlptWordEntry = [word:string, hiragana: ''|string, english:string]
export type LemmaEntry = {r:string, f:string, l:string}

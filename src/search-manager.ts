import { html, LitElement, nothing, PropertyValueMap } from 'lit'
import { customElement, query, queryAll, state } from 'lit/decorators.js'
import { JlptWordEntry, Kanji } from './types';

import lemmas from '../docs/data/lemmas.json'
import { searchManagerStyles } from './styles/searchManagerStyles';
import { googleImageSearch, jisho, mdbg, naver, playJapaneseAudio } from './util';
import {hasChinese} from 'asian-regexps'

import '@material/mwc-dialog'
import '@material/mwc-textfield'
import '@material/mwc-tab-bar'
import '@material/mwc-button'
import '@material/mwc-formfield'
import '@material/mwc-checkbox'
import '@material/mwc-menu'
import '@material/mwc-icon-button'
import { Dialog } from '@material/mwc-dialog';
import { TextField } from '@material/mwc-textfield';

import './search-item-element'
import './concealable-span'
import './search-history'

import {SearchHistory} from "./search-history";
import { ConcealableSpan } from './concealable-span';

import _kanjis from '../docs/data/kanjis.json'
import jlpt5 from'../docs/data/jlpt5-words.json'
import jlpt4 from '../docs/data/jlpt4-words.json'
import jlpt3 from '../docs/data/jlpt3-words.json'
import jlpt2 from '../docs/data/jlpt2-words.json'
import jlpt1 from '../docs/data/jlpt1-words.json'
import { sharedStyles } from './styles/sharedStyles';
import { Menu } from '@material/mwc-menu';
import { SearchItemElement } from './search-item-element';
export const jlpts: JlptWordEntry[][] = [
  jlpt5 as JlptWordEntry[],
  // [],

  jlpt4 as JlptWordEntry[],
  // [],

  jlpt3 as JlptWordEntry[],
  // [],

  jlpt2 as JlptWordEntry[],
  // [],

  jlpt1 as JlptWordEntry[],
  // [],
]
// const data: {[dictionary:string]: JlptWordEntry[]|LemmaEntry[]} = {
//   'jlpt4': jlpt4 as JlptWordEntry[]
// }
// const jlpts = [jlpt5, jlpt4, jlpt3]

export type Dictionaries = 'jlpt5'|'jlpt4'|'jlpt3'|'jlpt2'|'jlpt1'|'not found';

export type SearchItem = {
  type: ViewType;
  dictionary: Dictionaries;
  word: string;
  hiragana?: string;
  english?: string;
  frequency?: number;
  exactSearch?: boolean;
}
const views = ['words', 'kanji'] as const
declare type ViewType = typeof views[number];
declare type SearchHistoryItem = { search: string, view: ViewType };
declare global {
  interface Window {
    searchManager: SearchManager;
  }
}

@customElement('search-manager')
export class SearchManager extends LitElement {
  @state() view: ViewType = 'words';
  @state() query: string = '';
  @state() result: SearchItem[] = []

  @state() showKanjiResult = false
  @state() showWordsResult = true

  // private _searchCache: {[query:string]: SearchItem[]} = {}
  // private _searchHistory: SearchHistoryItem[] = [{search: 'test', view: 'words'}]
  // private _history: SearchHistory = new SearchHistory(this)
  @query('search-history') _history!: SearchHistory;

  @state() blindMode = false
  // private _hideInformationsOnSearchOption = true
  // @state() showShowAllInfoButton = this._hideInformationsOnSearchOption

  @query('mwc-dialog') dialog!: Dialog;
  @query('mwc-textfield') textfield!: TextField;
  @queryAll('#words-results search-item-element') searchItemElements!: SearchItemElement[];
  // @queryAll('concealable-span') concealableSpans!: ConcealableSpan[];
  // @queryAll('concealable-span[concealed]') concealedSpans!: ConcealableSpan[];

  constructor () {
    super()
    window.searchManager = this
    this.addEventListener('click', (e) => {
      const target = e.composedPath()[0] as HTMLSpanElement;
      if (target.hasAttribute('hideInfo')) {
        target.removeAttribute('hideInfo')
      }
    })
    this.addEventListener('span-revealed', e=>{
      this.requestUpdate()
    })

    this.addEventListener('keypress', e=>{
      e.stopImmediatePropagation()
      e.stopPropagation()
      // e.preventDefault()
      e.cancelBubble  = true
      return false
    })
  }

  /** STYLES **/
  static styles = [searchManagerStyles, sharedStyles];

  /** RENDER **/
  render () {
    const wordsResult = this.result.filter(i=>i.type=='words')
    const kanjiResult = this.result.filter(i=>i.type=='kanji')

    // @TODO here we change the view attribute in the currently used element in the search history list

    // console.log(this.query)
    return html`
    <mwc-dialog style="/*--mdc-dialog-min-width:calc(100vw - 32px);*/">
      <!-- <mwc-tab-bar
          @MDCTabBar:activated=${(e)=>this.view=views[e.detail.index]}
          activeIndex=${views.indexOf(this.view)}>
        <mwc-tab label=words></mwc-tab>
        <mwc-tab label=kanji></mwc-tab>
      </mwc-tab-bar> -->

      <!-- SEARCH BAR -->
      <div style="display:flex;align-items:center;position:relative">
          <div style="position:relative;flex:1">
              <mwc-textfield .value=${this.query}
                             @keypress=${e => {
                                 if (e.key === 'Enter') {
                                     this.search(this.textfield.value)
                                 }
                             }}
                             iconTrailing=close></mwc-textfield>
              <mwc-icon-button icon=close style="position:absolute;top:4px;right:4px;"
                               @click=${() => {
                                   this.query = '';
                                   this.textfield.value = '';
                                   this.textfield.focus()
                               }}></mwc-icon-button>
          </div>

          <div style="position: relative">
            <mwc-icon-button icon="casino" @click=${(e)=>{this.onCasinoButtonClick(e)}}></mwc-icon-button>
            <mwc-menu fixed
                    @action=${(e)=>{this.onMenuListItemAction(e)}}>
                <mwc-list-item>
                    <span>jlpt5</span>
                </mwc-list-item>
                <mwc-list-item>
                    <span>jlpt4</span>
                </mwc-list-item>
                <mwc-list-item>
                    <span>jlpt3</span>
                </mwc-list-item>
                <mwc-list-item>
                    <span>jlpt2</span>
                </mwc-list-item>
                <mwc-list-item>
                    <span>jlpt1</span>
                </mwc-list-item>
            </mwc-menu>
          </div>
      </div>
      <!-- choice checkboxes -->
      <div>
        <mwc-formfield label="kanji">
          <mwc-checkbox ?checked=${this.showKanjiResult}
            ?disabled=${this.showKanjiResult && !this.showWordsResult}
            @change=${e=>{this.showKanjiResult=e.target.checked}}></mwc-checkbox>
        </mwc-formfield>
        <mwc-formfield label="words">
          <mwc-checkbox ?checked=${this.showWordsResult}
            ?disabled=${this.showWordsResult && !this.showKanjiResult}
            @change=${e=>{this.showWordsResult=e.target.checked}}></mwc-checkbox>
        </mwc-formfield>
      </div>


      <!-- KANJI RESULT -->
      <div id="kanji-results" ?hide=${!this.showKanjiResult}>
        <p>Kanji Results</p>
        ${kanjiResult.length === 0 ? html`no result` : nothing}
        ${kanjiResult.map(i=>{
          return html`<search-item-element .item=${i} .searchManager=${this} .revealed=${true}></search-item-element>`
          return html`
          <div class=item>
            <div style="display:flex;justify-content:space-between;margin:12px 0 5px 0;">
              <span class="word">${i.word}</span>
              ${i.hiragana ? html`
              <concealable-span class=hiragana>${i.hiragana}</concealable-span>` : nothing}
              <div style="flex:1"></div>
              ${i.frequency ? html`
              <span class=lemma>${i.frequency}</span>` : nothing}
              <span class="dictionary ${i.dictionary.replace(' n', '')}-color"
                @click=${()=>mdbg(i.word)}>${i.dictionary}</span>
            </div>
            <!-- <concealable-span class=english>${i.english}</concealable-span> -->
            <span class=english>${i.english}</span>
          </div>
          `
        })}
      </div>

      <!-- WORDS RESULT -->
      <div id="words-results" ?hide=${!this.showWordsResult}>
        <p>Words Results</p>
        ${wordsResult.length === 0 ? html`no result` : nothing}
        ${wordsResult.map(i=>html`<search-item-element .item=${i} .searchManager=${this} .revealed=${!this.blindMode}></search-item-element>`)}
      </div>

        <search-history .searchManager="${this}" slot=secondaryAction></search-history>

      <mwc-formfield slot=secondaryAction label="blind mode" style="--mdc-checkbox-ripple-size:32px;margin-right:10px">
        <mwc-checkbox ?checked=${this.blindMode}
          @change=${e=>{this.toggleBlindMode()}}></mwc-checkbox>
      </mwc-formfield>
      <mwc-button outlined slot="secondaryAction" dialogAction="close">close</mwc-button>
    </mwc-dialog>
    `
  }

  async updated () {
    await Promise.all([...this.searchItemElements].map(e=>e.updateComplete))
    // this.showShowAllInfoButton = [...this.searchItemElements].some(el => el.hasConcealedSpans())

    // ;[...this.shadowRoot!.querySelectorAll('mwc-menu')].forEach((el: Menu)=>{
    //   el.anchor = el.previousElementSibling
    // })
  }

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    const dialogOpenedInitializingFct = () => {
      const surface = this.dialog.shadowRoot!.querySelector('.mdc-dialog__surface')!
      // @ts-ignore
      surface.style.minHeight = 'calc(100% - 32px)'
      this.dialog.removeEventListener('opened', dialogOpenedInitializingFct)
    }
    this.dialog.addEventListener('opened', dialogOpenedInitializingFct)
    this.textfield.updateComplete.then(()=>{
      this.textfield.shadowRoot!.querySelector('i')!.style.color = 'transparent'
    })
  }



  search (query: string, pushToHistory = true) {
    if (query === this.query) {
      return
    }
    this.query = query

    // push the query in the history object
    if (pushToHistory) {
      this._history.pushHistory(query)
    }

    this.result = this.searchData(query)
  }

  public searchData (query: string) {
    // if the search is cached we give the cached version first
    const cached = this._history.getCachedQuery(query)
    if (cached) {
      return cached
    }

    let searchResult: SearchItem[] = []

    /** Words search */
    jlpts.forEach((entries, n) => {
      const result: SearchItem[] =
        jlpts[n]
          .filter(e=>{
            return e[0].includes(query!)
              || (e[1] && e[1].includes(query!))
              || e[2].includes(query!)
          })
          .map(r=>{
            return this.attachFrequencyValue({
              type: 'words',
              dictionary: `jlpt${5 - n}` as Dictionaries,
              word: r[0],
              english: r[2],
              hiragana: r[1] || undefined,
              exactSearch: r[0] === query
            })
          });
      searchResult.push(...result)
    });
    // add the exact search if not found
    const exactSearch = searchResult.find(i=>i.word===query);
    if (!exactSearch) {
      searchResult.unshift({
        type: 'words',
        dictionary: 'not found',
        word:query,
        exactSearch: true
      })
    }

    /** Kanji search */
    if (hasChinese(query)) {
      // we assume the search is purely kanji-oriented
      // in that case we search each character
      for (const character of query.split('')) {
        if (!hasChinese(character)) {
          // if the character is not a kanji we ignore
          continue
        }
        const kanji = (_kanjis as Kanji[]).find(k=>k[1]===character)
        if (kanji) {
          searchResult.push(this.attachFrequencyValue({
            type: 'kanji',
            dictionary: `jlpt${kanji[2]}` as Dictionaries,
            word: kanji[1],
            english: `${kanji[3]}//${kanji[4]}`,
            exactSearch: kanji[1] === query
          }))
        }
        else {
          // if a kanji was not found we include the result in the list
          // to be able to access the search information menu
          searchResult.push({
            type: 'kanji',
            dictionary: 'not found',
            word: character,
            exactSearch: character === query
          })
        }
      }
    }
    else {
      // we assume the search is purely english-oriented
      searchResult.push(...
        (_kanjis as Kanji[])
          .filter(k=>k[3].includes(query) || k[4].includes(query))
          .sort(function (k1, k2) { return k2[2] - k1[2] })
          .map<SearchItem>(kanji=>this.attachFrequencyValue({
            type: 'kanji',
            dictionary: `jlpt${kanji[2]}` as Dictionaries,
            word: kanji[1],
            english: `${kanji[3]}//${kanji[4]}`
          }))
      )
    }

    // if (this.blindMode) {
    //   this.searchItemElements.forEach(e=>e.conceal())
    // }
    // else {
    //   this.searchItemElements.forEach(e=>e.reveal())
    // }
    // should include Lemmas in the search ?

    // cache the result
    this._history.addToCache(query, searchResult)

    return searchResult
  }

  attachFrequencyValue (item: SearchItem) {
    const lemma = lemmas.find(e=>e.l===item.word)
    if (lemma) {
      item.frequency = lemma.f
    }
    return item
  }

  toggleBlindMode () {
    this.blindMode = !this.blindMode
    // if (this.blindMode) {
    //   this.searchItemElements.forEach(e=>e.conceal())
    // }
    // else {
    //   this.searchItemElements.forEach(e=>e.reveal())
    // }
  }

  show(query?: string, view?: ViewType) {
    if (query) {
      this.search(query)
    }
    if (view) {
      this.view = view
    }
    this.dialog.show()
  }

  get open () {
    return this.dialog.open
  }

  close () {
    this.dialog.close()
  }

  private onCasinoButtonClick(e) {
    const button = e.target
    const menu = button.nextElementSibling
    menu.anchor = button
    menu.show()
    // this.open()
  }

  private onMenuListItemAction(e) {
    // const jlpt = 5 - e.detail.index
    // const candidates = jlpts[e.detail.index]
    // const random = candidates[~~(Math.random()*candidates.length)]
    // this.show(random[0], 'words')
    this.show(getRandomWord([5 - e.detail.index])[0])
  }
}

export function getRandomWord (jlptsArray = [5, 4, 3, 2, 1]) {
  const allWords = jlptsArray.map(jlpt => jlpts[5 - jlpt]).flat()
  return allWords[~~(Math.random()*allWords.length)]
}

export function getExactSearch (word: string) {
  for (const wordEntry of jlpts.flat()) {
    if (wordEntry[0]==word || wordEntry[1]==word) {
      return wordEntry
    }
  }
}
export function wordExists(word: string) {
  return getExactSearch(word) !== undefined
}

// export function firstWordFoundFromCharacter (character: string) {
//   for (const jlpt of jlpts) {
//     const result = jlpt.find(w=>w[0].includes(character))
//     if (result) {
//       return result
//     }
//   }
//   return null
// }

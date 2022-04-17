import {LitElement, html, css, PropertyValueMap, nothing, PropertyValues} from 'lit'
import { customElement, query, queryAll, state } from 'lit/decorators.js'
import '@material/mwc-snackbar'
import '@material/mwc-button'
import '@material/mwc-icon-button'
import '@material/mwc-slider'
// import '@material/mwc-dialog'
// import '@material/mwc-textfield'
// import '@material/mwc-checkbox'
import './search-manager'
import './speech'

import './paste-box'
import { PasteBox } from './paste-box'
import { Translation } from './types'
import {jlpts, SearchManager} from "./search-manager";
import { playJapaneseAudio } from './util'
import {speakEnglish, speakJapanese} from "./speech";
import {IconButton} from "@material/mwc-icon-button";

declare global {
  interface Window {
    app: AppContainer;
    toast: (labelText: string, timeoutMs?: number) => void;
  }
}

@customElement('app-container')
export class AppContainer extends LitElement {
  @state() translation?: Translation;
  @state() paragraphIndex = 0
  @state() fontSize = 24;

  // private _parts: string[][] = []

  @query('paste-box') pasteBox!: PasteBox;
  @queryAll('.part') parts!: HTMLSpanElement[];
  @queryAll('.paragraph') paragraphs!: HTMLDivElement[];
  // next hidden part
  @query('.paragraph[selected] .part[hide]') nextHiddenPart?: HTMLSpanElement;
  @query('.paragraph[selected] mwc-icon-button[icon=volume_up]') speakButton!: IconButton;
  @query('.paragraph[selected] .source') source!: HTMLDivElement;

  @query('search-manager') searchManager!: SearchManager;

  get currentSource (): string {
    return this.translation?.source.split('\n').filter(p=>p)[this.paragraphIndex]!
  }

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }
    #translations {
      flex: 1;
      display: flex;
      align-items: center;
      padding-bottom: 116px;
      overflow: auto;
    }
  .paragraph {
    font-size: 3em;
    margin: 0 18px;
  }
  .paragraph:not([selected]) {
    display: none;
  }
  .source {
    /* cursor: pointer; */
    font-family: 'Shippori Mincho', serif;
  }
    .part[hide] {
      user-select: none;
      cursor: pointer;
      border-radius: 3px;
    }
  [hide] {
    background-color: #e0e0e0 !important;
    color: transparent !important;
  }

    header {
      width: 100%;
      /*position: absolute;
      top: 0;*/
      
    }

    #paragraph-controls {
      /* display: flex;
      flex-direction: column;
      align-content: center;
      justify-content: space-between; */
      width: 100%;
      position: fixed;
      bottom: 0;
      padding: 10px;
      box-sizing: border-box;
    }
  `

  render () {
    // console.log('rendered')
    // let translation, _parts;
    let _parts;
    if (this.translation) {
      // translation = this.translation
      let paragraphs = this.translation.source.split('\n').filter(p=>p) // the filter removes empty lines
      switch (this.translation.lang) {
        case 'French':
          // break the paragraphs into words
          _parts = paragraphs.map(p=>p.replace(/\ /g, ' <space> ').split(' ').map(w=>(w == '<space>')?' ':w))
          break

        case 'Japanese':
        case 'Korean':
          // break the paragraphs into character (letter)
          _parts = paragraphs.map(p=>p.split(''))
          break
      }
    }

    return html`
        <style>
            .paragraph {
                font-size: ${this.fontSize}px !important;
            }
        </style>
    <header style="display:flex;align-items:center;justify-content:space-between">
      <div style="flex: 1"></div>
        <mwc-icon-button icon="search"
                         @click=${() => {
                             this.onSearchButtonClick()
                         }}>
        </mwc-icon-button>
      <mwc-icon-button icon=settings
                       @click=${()=>{this.pasteBox.open()}}></mwc-icon-button>
        <mwc-icon-button
                @click=${()=>{window.open('https://github.com/vdegenne/translation-analyzer/tree/master/docs', '_blank')}}>
            <img src="./img/github.ico">
        </mwc-icon-button>
    </header>

    <div id=translations>
      ${this.translation ? html`
       <!-- for each paragraph -->
       ${_parts.map((paragraph, i)=>{
         // console.log(this.translation)
         const translatedParagraph = this.translation!.translated.split('\n').filter(p=>p)[i]
         return html`
         <div class=paragraph ?selected=${this.paragraphIndex === i}>
           <div class=source>
             ${paragraph.map(part => html`<span class=part ?hide=${part !== ' '}>${part}</span>`)}
           </div>
           <hr style="margin: 0">
           <div class=translated>${translatedParagraph}</div>
         </div>
       `
       })}
      ` : nothing
      }
    </div>

        
        <div id=paragraph-controls>
        ${this.translation && _parts.length > 1 ? html`
            <div style="display: flex;align-items: center;justify-content: space-between;width: 100%">
              <mwc-icon-button icon=arrow_back
                  ?disabled=${this.paragraphIndex === 0}
                  @click=${()=>{this.previousPage()}}></mwc-icon-button>
                <div>${this.paragraphIndex + 1}</div>
                <mwc-icon-button icon=arrow_forward
                  ?disabled=${this.paragraphIndex === _parts.length - 1}
                  @click=${()=>{this.nextPage()}}></mwc-icon-button>
            </div>
        ` : nothing }
            <div style="display: flex;align-items: center">
                <mwc-slider
                        discrete
                        withTickMarks
                        step="1"
                        min="5"
                        max="50"
                        value=${this.fontSize}
                        style="display: block;flex:1"
                        @input=${e=>{this.fontSize = e.detail.value}}
                ></mwc-slider>
                <mwc-icon-button icon=volume_up @click=${()=>{this.speak()}}></mwc-icon-button>
                <mwc-icon-button icon="remove_red_eye"
                                 @click=${()=>{this.onRemoveRedEyeClick()}}></mwc-icon-button>
            </div>
        </div>

    <paste-box></paste-box>

    <search-manager></search-manager>
    `
  }

  protected updated(_changedProperties: PropertyValues) {
    this.shadowRoot!.querySelector('mwc-slider')!.layout()
    super.updated(_changedProperties);
  }

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    this.addEventListener('upload', e=>this.load((e as CustomEvent).detail.translation))
    this.addEventListener('click', (e) => {
      const target = e.composedPath()[0] as HTMLElement
      if (target.classList.contains('part') && target.hasAttribute('hide')) {
        this.onParagraphClick()
      }
    })

    window.addEventListener('keypress', e=>{
      if (e.key=='s') {
        this.speak()
      }
      if (e.key=='1') {
        const selection = document.getSelection()?.toString()
        if (selection) {
          this.searchManager.open(selection, 'words')
        }
      }
    })
  }

  previousPage () {
    if (this.paragraphIndex - 1 !== -1) {
      this.paragraphIndex--
    }
  }
  nextPage () {
    if (this.paragraphIndex + 1 !== this.paragraphs.length) {
      this.paragraphIndex++
    }
  }

  onParagraphClick () {
    const nextHiddenPart = this.nextHiddenPart
    if (nextHiddenPart) {
      nextHiddenPart.removeAttribute('hide')
    }
  }

  speak () {
    // play selection or all
    let text = document.getSelection()?.toString()
    if (!text) {
      // text = this.currentSource;
      text = [...this.source.querySelectorAll('.part:not([hide])')].map(el=>el.textContent!.trim()).join('')
    }
    if (this.translation?.lang=='Japanese') {
      // is the selection in the words
      const result = this.searchManager.searchData(text).filter(s=>s.type=='words' && s.exactSearch && s.dictionary !== 'not found')
      if (result.length) {
        playJapaneseAudio(result[0].hiragana || result[0].word)
      }
      else {
        speakJapanese(text)
      }
    }
  }

  async load (translation: Translation) {
    if (this.translation && this.translation.lang == translation.lang && this.translation.source == translation.source && this.translation.translated == translation.translated) {
      return
    }
    this.translation = translation;
    this.paragraphIndex = 0
    await this.updateComplete
    this.parts.forEach(el=>{if(el.innerText!==' ') {el.setAttribute('hide', '')}})
    return
    // let paragraphs = translation.source.split('\n').filter(p=>p) // the filter removes empty lines
    // switch (translation.lang) {
    //   case 'French':
    //     // break the paragraphs into words
    //     this._parts = paragraphs.map(p=>p.replace(/\ /g, ' <space> ').split(' ').map(w=>(w == '<space>')?' ':w))
    //     break
    //
    //   case 'Japanese':
    //     // break the paragraphs into character (letter)
    //     this._parts = paragraphs.map(p=>p.split(''))
    //     break
    // }
  }

  public async fetchTranslations (word: string) {
    let url;
    switch (this.pasteBox.translation.lang) {
      case "Japanese":
        url = `https://assiets.vdegenne.com/japanese/tatoeba/${encodeURIComponent(word)}`
        break
      case "Korean":
        url = `https://assiets.vdegenne.com/korean/examples/from/japanese/${encodeURIComponent(word)}`
        break
      default:
        return
    }

    const response = await fetch(url)
    const translations = await response.json()

    if (translations.length === 0) {
      window.toast('no results')
      return
    }

    let translation: Translation
    switch (this.pasteBox.translation.lang) {
      case "Japanese":
        translation = {
          lang: 'Japanese',
          source : translations.map(t=>t.j).join('\n'),
          translated : translations.map(t=>t.e).join('\n')
        }
        break
      case "Korean":
        translation = {
          lang: 'Korean',
          source : translations.map(t=>t.k).join('\n'),
          translated : translations.map(t=>t.j).join('\n')
        }
        break
    }

    this.pasteBox.load(translation)
    this.pasteBox.submit()
    this.searchManager.close()
  }

  private onSearchButtonClick() {
    const selection = document.getSelection()!.toString()
    if (selection) {
      this.searchManager.open(selection, 'words')
    }
    else {
      this.searchManager.open()
    }
  }

  private onRemoveRedEyeClick() {
    this.onParagraphClick()
  }
}

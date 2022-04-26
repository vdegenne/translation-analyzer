import {LitElement, html, css, PropertyValueMap, nothing, PropertyValues, render} from 'lit'
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
import './context-menu'
import './loop-player'

import './paste-box'
import { PasteBox } from './paste-box'
import { Translation } from './types'
import {getRandomWord, SearchManager} from "./search-manager";
import {googleImageSearch, playJapaneseAudio, ringTheBell} from './util'
import {cancelSpeech, speak, speakEnglish, speakJapanese} from "./speech";
import {IconButton} from "@material/mwc-icon-button";
import {isFullJapanese} from "asian-regexps";
import { ContextMenu } from './context-menu'
import {LoopPlayer} from "./loop-player";
import {Slider} from "@material/mwc-slider";

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
  @state() fontSize = 42;

  private _playbackRate = .7

  //
  @queryAll('.part') partElements!: HTMLSpanElement[];
  @queryAll('.paragraph[selected] .source .part') sourcePartElements!: HTMLSpanElement[];
  @queryAll('.paragraph') paragraphElements!: HTMLDivElement[];

  // next hidden part
  @query('.paragraph[selected] .source') sourceElement!: HTMLDivElement;
  @query('.paragraph[selected] .source .part[conceal]') nextConcealedPart!: HTMLSpanElement;
  @query('.paragraph[selected] .translated') translatedElement!: HTMLDivElement;

  // @query('.paragraph[selected] mwc-icon-button[icon=volume_up]') speakButton!: IconButton;

  @query('#feedback') feedbackBox!: HTMLDivElement;
  @query('paste-box') pasteBox!: PasteBox;
  @query('loop-player') loopPlayer!: LoopPlayer;
  @query('search-manager') searchManager!: SearchManager;
  @query('context-menu') contextMenu!: ContextMenu;
  @query('mwc-slider#speed-slider') speedSlider!: Slider;


  get sourceContent (): string {
    return this.translation?.source.split('\n').filter(p=>p)[this.paragraphIndex]!
  }

  get visibleSourceContent () {
    const includes: HTMLSpanElement[] = []
    for (const el of this.sourcePartElements) {
      if (el.hasAttribute('conceal')) {
        break
      }
      includes.push(el)
    }
    return includes.map(el=>el.textContent).join('')
  }

  get hasMoreTranslation () {
    return this.paragraphIndex + 1 != this.paragraphElements.length
  }

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }
    [hide] {
      visibility: hidden;
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
    .part[conceal] {
      user-select: none;
      cursor: pointer;
      /* border-radius: 3px; */
    }
  [conceal] {
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
    
   .slider-popbox {
     background-color: #e0e0e0;
     position: absolute;
     top:-48px;
     width:100%;
     border-radius: 10px;
   } 
  `

  get selection () {
    return document.getSelection()?.toString()
  }

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
      <div id=feedback style="flex: 1"></div>
        <!-- <mwc-icon-button icon="search"
                         @click=${() => {
                             this.openSearchManager()
                         }}>
        </mwc-icon-button> -->
        <loop-player .appContainer=${this}></loop-player>
        <mwc-icon-button icon="casino"
            @click=${()=>{this.onCasinoButtonClick()}}></mwc-icon-button>
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
             ${paragraph.map(part => html`<span class=part ?conceal=${part !== ' '}>${part}</span>`)}
           </div>
           <hr style="margin: 0">
           <div class=translated 
                @click=${()=>{speakEnglish(translatedParagraph)}}>${translatedParagraph}</div>
         </div>
       `
       })}
      ` : nothing
      }
    </div>

        
        <div id=paragraph-controls>
        ${this.translation && _parts.length > 1 ? html`
            <div style="display: flex;align-items: center;justify-content: center;width: 100%">
              <mwc-icon-button icon=arrow_back
                  ?disabled=${this.paragraphIndex === 0}
                  @click=${()=>{this.previousPage()}}></mwc-icon-button>
                <div>${this.paragraphIndex + 1}</div>
                <mwc-icon-button icon=arrow_forward
                  ?disabled=${this.paragraphIndex === _parts.length - 1}
                  @click=${()=>{this.nextPage()}}></mwc-icon-button>
            </div>
        ` : nothing }
            <div style="display: flex;align-items: center;position: relative">
                <mwc-icon-button icon="remove_red_eye"
                                 @click=${()=>{this.speakNextPart()}}></mwc-icon-button>
                <mwc-icon-button icon=volume_up @click=${()=>{this.speakSource()}}></mwc-icon-button>
                <mwc-icon-button icon=search
                                 @click=${(e) => {
                                     if (this.selection) {
                                         this.contextMenu.moveMenuTo(e.x, e.y)
                                         this.contextMenu.show(this.selection)
                                     } else {
                                         this.openSearchManager()
                                     }
                                 }}></mwc-icon-button>
                
                <!-- SPEED ADJUSTMENT -->
                <div class="slider-popbox" hide>
                    <mwc-slider
                            id="speed-slider"
                            discrete
                            withTickMarks
                            min="30"
                            max="100"
                            step="10"
                            value=${this._playbackRate*100}
                            @change=${e=> {this._playbackRate = e.detail.value / 100}}
                    ></mwc-slider>
                </div>
                <mwc-icon-button icon="speed"
                    @click=${(e)=>{e.target.previousElementSibling.toggleAttribute('hide')}}></mwc-icon-button>
                
                <mwc-slider
                        discrete
                        withTickMarks
                        step="1"
                        min="5"
                        max="80"
                        value=${this.fontSize}
                        style="display: block;flex:1"
                        @input=${e=>{this.fontSize = e.detail.value}}
                ></mwc-slider>
            </div>
        </div>

    <paste-box></paste-box>

    <search-manager></search-manager>
        
        <context-menu></context-menu>
    `
  }

  protected updated(_changedProperties: PropertyValues) {
    this.shadowRoot!.querySelector('mwc-slider')!.layout()
    super.updated(_changedProperties);
  }

  protected async firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): Promise<void> {
    let mouseHold = false
    this.addEventListener('upload', e => this.load((e as CustomEvent).detail.translation))
    window.addEventListener('contextmenu', e => {
      if (e.button == 2)
        e.preventDefault()
    })

    /** Mouse **/
    this.addEventListener('mousedown', (e) => {
      /* contextual menu ? */
      if (e.button == 2) {
        if (this.selection || this.contextMenu.value) {
          this.contextMenu.moveMenuTo(e.x, e.y)
          this.contextMenu.show(this.selection)
        }
        return
      }

      const target = e.composedPath()[0] as HTMLElement

      /* close slider popbox and do nothing ? */
      if (!this.speedSlider.parentElement!.hasAttribute('hide')) {
        if (target.id == 'speed-slider') { return }
        this.speedSlider.parentElement!.setAttribute('hide', '')
        return
      }

      mouseHold = true // mouse hold state

      // if we've clicked on a part
      if (target.classList.contains('part') && target.hasAttribute('conceal')) {
        this.speakNextPart()
        // this.onParagraphClick()
      }

      // if we've click in the back
      if (e.button==0 && ['app', 'translations'].includes(target.id) && !this.selection && !this.contextMenu.open) {
        this.speakNextPart()
        // this.onParagraphClick()
      }
    })
    this.addEventListener('mouseup', e=>mouseHold=false)

    /** Keyboard **/
    window.addEventListener('keydown', e => {
      if (this.searchManager.open) { return }
      if (e.code == 'KeyS') {
        this.speakSource()
      }
      if (e.code == 'Digit1') {
        const selection = this.selection
        if (selection) {
          this.searchManager.show(selection, 'words')
        }
      }
      if (e.code=='KeyA') {
        if (this.selection)
          googleImageSearch(this.selection)
      }
      if (e.code=='KeyE') {
        this.translatedElement.click()
      }

      if (e.code == 'Space') {
        e.preventDefault()
        this.speakNextPart()
      }

      if (e.code=='ArrowLeft' || e.code=='KeyA') {
        ;(this.shadowRoot!.querySelector('[icon=arrow_back]') as IconButton).click()
      }
      if (e.code=='ArrowRight' || e.code=='KeyD') {
        ;(this.shadowRoot!.querySelector('[icon=arrow_forward]') as IconButton).click()
      }
    })
    // window.addEventListener('pointerdown', (e) => {
    // })

    this.pasteBox.loadFromRemote().then(() => {
      this.pasteBox.submit()
    })


    /******************
     * interval that seeks for selection change
     *******************************************/
    let selection
    setInterval(()=>{
      const documentSelection = this.selection
      if (!mouseHold && documentSelection && documentSelection.length != 0 && documentSelection != selection) {
        const searchResult = this.searchManager.searchData(documentSelection, ['words']).filter(i=>i.dictionary!='not found')
        if (searchResult.length) {
          render(
            html`${searchResult[0].word} ${searchResult[0].hiragana ? `(${searchResult[0].hiragana})` : nothing}`,
            this.feedbackBox
          )
        }
        selection = documentSelection
      }
    }, 1200)

    /** decimal values **/
    this.speedSlider.valueToValueIndicatorTransform = (A) => ''+(A/100)
  }

  previousPage () {
    if (this.paragraphIndex - 1 !== -1) {
      this.paragraphIndex--
    }
  }
  nextPage () {
    if (this.paragraphIndex + 1 !== this.paragraphElements.length) {
      this.paragraphIndex++
    }
  }

  revealNextPart () {
    const nextConcealedPart = this.nextConcealedPart
    if (nextConcealedPart) {
      nextConcealedPart.removeAttribute('conceal')
    }
  }

  async speakSource (selectionPriority= true) {
    // play selection or all
    let text = this.selection
    if (!selectionPriority || text == '') {
      text = this.visibleSourceContent
      // text = [...this.sourceElement.querySelectorAll('.part:not([hide])')].map(el=>el.textContent!.trim()).join('')
    }

    try {
      if (!text) { throw new Error() }
      // @TODO : the function here should throw if it was intentionally stopped
      await this.speak(text)
    } catch (e) {
      return
    }

    if (text == this.sourceContent) {
      // bell
      await ringTheBell()
    }
  }

  async speak (text:string, rate = this._playbackRate) {
    if (isFullJapanese(text)) {
      // is the selection in the words
      const result = this.searchManager.searchData(text).filter(s=>s.type=='words' && s.exactSearch && s.dictionary !== 'not found')
      // if (result.length) {
        try {
          if (result.length == 0 || text.length > 6) {
            throw new Error(); // intentionally triggering an exception to call the rollback speaker
          }
          await playJapaneseAudio(result.length ? (result[0].hiragana || result[0].word) : text)
        } catch (e) {
          cancelSpeech() // cancel in case a speech is alredy playing
          await speakJapanese(result.length ? (result[0].hiragana || result[0].word) : text, 1, rate)
        }
      // }
      // else {
      //   speakJapanese(text)
      // }
    }
  }

  async speakVisibleSource () {
    // console.log(this.visibleSourceContent)
    this.speakSource(false) // play the visible source without selection matter
  }

  async speakTranslatedParagraph () {
    await speakEnglish(this.translatedElement.textContent!)
  }

  async load (translation: Translation) {
    if (this.translation && this.translation.lang == translation.lang && this.translation.source == translation.source && this.translation.translated == translation.translated) {
      return
    }
    this.translation = translation;
    this.paragraphIndex = 0
    await this.updateComplete
    this.concealAllParts()
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

  concealAllParts () {
    // @TODO conceal punctuations
    this.partElements.forEach(el=>{if(el.innerText!==' ') {el.setAttribute('conceal', '')}})
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
      return null
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

    return translation
  }

  private openSearchManager() {
    const selection = document.getSelection()!.toString()
    if (selection) {
      this.searchManager.show(selection, 'words')
    }
    else {
      this.searchManager.show()
    }
  }

  public async speakNextPart() {
    // window.getSelection()?.removeAllRanges()
    this.revealNextPart()
    await this.speakSource(false)
  }

  private async onCasinoButtonClick() {
    // pick a random word
    const word=getRandomWord([5,4])
    await this.fetchTranslations(word[0])
    this.feedbackBox.textContent = `fetched : ${word[0]}`
  }
}

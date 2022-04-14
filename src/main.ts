import { LitElement, html, css, PropertyValueMap, nothing } from 'lit'
import { customElement, query, queryAll, state } from 'lit/decorators.js'
import '@material/mwc-snackbar'
import '@material/mwc-button'
import '@material/mwc-icon-button'
// import '@material/mwc-dialog'
// import '@material/mwc-textfield'
// import '@material/mwc-checkbox'

import './paste-box'
import { PasteBox } from './paste-box'
import { Translation } from './types'

declare global {
  interface Window {
    app: AppContainer;
    toast: (labelText: string, timeoutMs?: number) => void;
  }
}

@customElement('app-container')
export class AppContainer extends LitElement {
  @state() paragraphIndex = 0

  @state() translation?: Translation;

  private _parts: string[][] = []

  @query('paste-box') pasteBox!: PasteBox;
  @queryAll('.part') parts!: HTMLSpanElement[];
  @queryAll('.paragraph') paragraphs!: HTMLDivElement[];
  // next hidden part
  @query('.paragraph[selected] .part[hide]') nextHiddenPart?: HTMLSpanElement;

  static styles = css`
  .part {
    user-select: none;
  }
  .source {
    cursor: pointer;
  }
  .paragraph:not([selected]) {
    display: none;
  }
  [hide] {
    background-color: #e0e0e0 !important;
    color: transparent !important;
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
          // break the paragraphs into character (letter)
          _parts = paragraphs.map(p=>p.split(''))
          break
      }
    }

    return html`
    <header style="display:flex;align-items:center;justify-content:space-between">
      <div></div>
      <mwc-icon-button icon=settings
        @click=${()=>{this.pasteBox.open()}}></mwc-icon-button>
    </header>

    <div id=paragraphs @click=${e=>{this.onParagraphClick()}}>
      ${this.translation ? html`
       <!-- for each paragraph -->
       ${_parts.map((paragraph, i)=>{
         console.log(this.translation)
         const translatedParagraph = this.translation!.translated.split('\n').filter(p=>p)[i]
         return html`
         <div class=paragraph ?selected=${this.paragraphIndex === i}>
           <div class=source>
             ${paragraph.map(part => html`<span class=part ?hide=${part !== ' '}>${part}</span>`)}
           </div>
           <hr>
           <div>${translatedParagraph}</div>
         </div>
       `
       })}
      ` : nothing
      }
    </div>

    ${this.translation && _parts.length > 1 ? html`
    <div style="display:flex;align-items:center;justify-content:space-between;width:100%">
      <mwc-icon-button icon=arrow_back
        ?disabled=${this.paragraphIndex === 0}
        @click=${()=>{this.previousPage()}}></mwc-icon-button>
      <div>${this.paragraphIndex + 1}</div>
      <mwc-icon-button icon=arrow_forward
        ?disabled=${this.paragraphIndex === _parts.length - 1}
        @click=${()=>{this.nextPage()}}></mwc-icon-button>
    </div>
    ` : nothing }

    <mwc-icon-button
        @click=${()=>{window.open('https://github.com/vdegenne/translation-analyzer/tree/master/docs', '_blank')}}>
      <img src="./img/github.ico">
    </mwc-icon-button>

    <paste-box></paste-box>
    `
  }

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    this.addEventListener('upload', e=>this.load((e as CustomEvent).detail.translation))
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

  async load (translation: Translation) {
    if (this.translation && this.translation.lang == translation.lang && this.translation.source == translation.source && this.translation.translated == translation.translated) {
      return
    }
    this.translation = translation;
    this.paragraphIndex = 0
    await this.updateComplete
    this.parts.forEach(el=>{if(el.innerText!==' ') {el.setAttribute('hide', '')}})
    return
    let paragraphs = translation.source.split('\n').filter(p=>p) // the filter removes empty lines
    switch (translation.lang) {
      case 'French':
        // break the paragraphs into words
        this._parts = paragraphs.map(p=>p.replace(/\ /g, ' <space> ').split(' ').map(w=>(w == '<space>')?' ':w))
        break

      case 'Japanese':
        // break the paragraphs into character (letter)
        this._parts = paragraphs.map(p=>p.split(''))
        break
    }
  }
}

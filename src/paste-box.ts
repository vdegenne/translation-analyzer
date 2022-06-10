import { css, html, LitElement, PropertyValueMap } from 'lit'
import { customElement, query, state } from 'lit/decorators.js'
import '@material/mwc-dialog'
import '@material/mwc-icon-button'
import '@material/mwc-select'
import '@material/mwc-textarea'
import copy from '@vdegenne/clipboard-copy'
import { Dialog } from '@material/mwc-dialog';
import { Langs, Language, Translation } from './types'
import { Select } from '@material/mwc-select'
import { TextArea } from '@material/mwc-textarea'

@customElement('paste-box')
export class PasteBox extends LitElement {

  /**
   * Queries
   */
  @query('mwc-dialog') dialog!: Dialog;
  @query('mwc-select') select!: Select;
  @query('textarea:nth-of-type(1)') sourceArea!: HTMLTextAreaElement;
  @query('textarea:nth-of-type(2)') translationArea!: HTMLTextAreaElement;
  @query('mwc-textarea') importTextArea!: TextArea;

  /**
   * STYLES
   */
  static styles = css`
    mwc-select {
      width: 100%;
    }
    textarea {
      display: block;
      width: 100%;
      resize: vertical;
      box-sizing: border-box;
      min-height: 200px;
      margin: 12px 0;
    }
  `

  /**
   * RENDER
   */
  render() {
    return html`
    <mwc-dialog heading="Editing Box" style="--mdc-dialog-min-width:calc(100vw - 32px)">
      <mwc-select name=lang fixedMenuPosition value="Japanese">
        ${Langs.map(l=>html`<mwc-list-item value=${l}>${l}</mwc-list-item>`)}
      </mwc-select>

      <textarea @keyup=${()=>this.requestUpdate()}></textarea>

      <textarea @keyup=${()=>this.requestUpdate()}></textarea>

      <mwc-button unelevated slot="secondaryAction" icon=download
        @click=${()=>{this.loadFromRemote()}}>remote</mwc-button>
      <mwc-button unelevated slot="secondaryAction" icon=file_copy
        @click=${()=>{this.copyData()}}>data</mwc-button>
      <mwc-icon-button icon=save_alt slot=secondaryAction
        @click=${()=>{(this.shadowRoot!.querySelector('#pasteboxDialog') as Dialog).show()}}></mwc-icon-button>
      <mwc-button outlined slot=secondaryAction dialogAction=close>close</mwc-button>
      <mwc-button unelevated slot="primaryAction"
        ?disabled=${!this.submitable}
        @click=${()=>{this.submit()}}>submit</mwc-button>
    </mwc-dialog>


    <mwc-dialog id=pasteboxDialog heading="Paste box">
      <mwc-textarea
        rows=12
        style="width:100%;"
      ></mwc-textarea>
      <mwc-button unelevated slot="primaryAction" dialogAction=close
        @click=${()=>{this.load(JSON.parse(this.importTextArea.value))}}>import</mwc-button>
    </mwc-dialog>
    `
  }

  /**
   * First updated
   */
  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    this.loadFromLocal()
  }

  /**
   * Is the form submitable?
   */
  get submitable () {
    return this.translationArea && this.translationArea.value && this.sourceArea.value
  }

  /**
   * Request the data on the interface as a translation
   */
  get translation (): Translation {
    return {
      lang: this.select.value as Language,
      translated: this.translationArea.value,
      source: this.sourceArea.value
    }
  }

  /**
   * Submit the data from the interface in an event
   */
  submit () {
    if (!this.submitable) return

    this.dispatchEvent(new CustomEvent('upload', {
      composed: true,
      detail: {
        translation: this.translation
      }
    }))

    this.saveToLocalStorage()
    window.app.firstPage()

    this.dialog.close()
  }

  /**
   * Load a translation on the interface
   */
  load(translation: Translation) {
    this.select.value = translation.lang
    this.sourceArea.value = translation.source
    this.translationArea.value = translation.translated
    this.requestUpdate()
  }

  /**
   * Load the remote data and load it into the interface
   */
  async loadFromRemote() {
    const response = await fetch('./data.json')
    const translation=await response.json() as Translation
    if (translation) {
      this.load(translation)
    }
  }

  /**
   * Load translation from the local storage
   */
  loadFromLocal () {
    let localData: string|Translation|null = localStorage.getItem('translation-practice:translation')
    if (localData != null) {
      localData = JSON.parse(localData) as Translation
      this.load(localData)
      window.app.load(localData)
    }
  }

  /**
   * Save translation to localStorage
   */
  saveToLocalStorage() {
    localStorage.setItem('translation-practice:translation', JSON.stringify(this.translation))
  }

  /**
   * Show the dialog
   */
  show () {
    this.dialog.show()
  }

  /**
   * Copy the translation from the interface into the clipboard
   */
  copyData() {
    copy(JSON.stringify(this.translation))
    window.toast('data copied to clipboard')
  }
}
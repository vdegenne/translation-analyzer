import { css, html, LitElement } from 'lit'
import { customElement, query, state } from 'lit/decorators.js'
import '@material/mwc-dialog'
import '@material/mwc-icon-button'
import '@material/mwc-select'
import copy from '@vdegenne/clipboard-copy'
import { Dialog } from '@material/mwc-dialog';
import { Langs, Language, Translation } from './types'
import { Select } from '@material/mwc-select'

@customElement('paste-box')
export class PasteBox extends LitElement {
  @query('mwc-dialog') dialog!: Dialog;
  @query('mwc-select') select!: Select;
  @query('textarea:nth-of-type(1)') sourceArea!: HTMLTextAreaElement;
  @query('textarea:nth-of-type(2)') translationArea!: HTMLTextAreaElement;

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

  render() {
    return html`
    <mwc-dialog heading="Editing Box" style="--mdc-dialog-min-width:calc(100vw - 32px)">
      <mwc-select name=lang .value=${Langs[0]} fixedMenuPosition>
        ${Langs.map(l=>html`<mwc-list-item value=${l}>${l}</mwc-list-item>`)}
      </mwc-select>

      <textarea @keyup=${()=>this.requestUpdate()}></textarea>

      <textarea @keyup=${()=>this.requestUpdate()}></textarea>

      <mwc-button unelevated slot="secondaryAction" icon=download
        @click=${()=>{this.loadFromRemote()}}>remote</mwc-button>
      <mwc-button unelevated slot="secondaryAction" icon=file_copy
        @click=${()=>{this.copyData()}}>data</mwc-button>
      <mwc-button outlined slot=secondaryAction dialogAction=close>close</mwc-button>
      <mwc-button unelevated slot="primaryAction"
        ?disabled=${!this.submitable}
        @click=${()=>{this.submit()}}>submit</mwc-button>
    </mwc-dialog>
    `
  }

  get submitable () {
    return this.translationArea && this.translationArea.value && this.sourceArea.value
  }

  get translation (): Translation {
    return {
      lang: this.select.value as Language,
      translated: this.translationArea.value,
      source: this.sourceArea.value
    }
  }

  submit () {
    if (!this.submitable) return

    this.dispatchEvent(new CustomEvent('upload', {
      composed: true,
      detail: {
        translation: this.translation
      }
    }))

    this.dialog.close()
  }

  copyData() {
    copy(JSON.stringify(this.translation))
    window.toast('data copied to clipboard')
  }

  open () {
    this.dialog.show()
  }

  async loadFromRemote() {
    const response = await fetch('./data.json')
    const translation=await response.json() as Translation
    if (translation) {
      this.load(translation)
    }
  }

  load(translation: Translation) {
    this.select.value = translation.lang
    this.sourceArea.value = translation.source
    this.translationArea.value = translation.translated
    this.requestUpdate()
  }
}
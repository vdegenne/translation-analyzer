import {html, LitElement} from "lit";
import {customElement, state} from "lit/decorators.js";
import {getRandomWord} from "./search-manager";
import {AppContainer} from "./main";

@customElement('loop-player')
export class LoopPlayer extends LitElement {
  @state() playing: boolean|undefined = undefined

  private appContainer!: AppContainer;
  private _timeout?: NodeJS.Timeout;
  private _freshTranslation = true

  protected render() {
    return html`
      <mwc-icon-button icon="${this.playing ? 'stop_arrow' : 'play_arrow'}"
        @click=${()=>{this.togglePlay()}}></mwc-icon-button>
    `
  }

  private async togglePlay() {
    this.clearTimeout()
    if (this.playing) {
      this.playing = false
    }
    else {
      // on very first click we fetch a new word
      if (this.playing == undefined) {
        while ((await window.app.fetchTranslations(getRandomWord()[0])) == null);
        console.log('loaded')
      }
      this._timeout = setTimeout(this.executionFunction.bind(this), 1000)
      this.playing = true
    }
  }

  async executionFunction () {
    if (this.playing == false) { return }
    let nextTimeoutMs = 5000
    // const firstPart = this.appContainer.shadowRoot!.querySelector('.paragraph[selected] .part')!
    if (this._freshTranslation) {
      // console.log('speaking the translated paragraph')
      await this.appContainer.speakTranslatedParagraph()
      nextTimeoutMs = 7000
      this._freshTranslation = false
    }
    else if (this.appContainer.nextConcealedPart !== null) {
      // console.log('reading next part')
      // this.appContainer.revealNextPart()
      // await this.appContainer.speakVisibleSource()
      await this.appContainer.speakNextPart()
      // await this.appContainer.onRemoveRedEyeClick()
      if (this.appContainer.nextConcealedPart !== null) {
        nextTimeoutMs = 9000
      }
      else {
        nextTimeoutMs = 20 * 1000 // jumping to the next translation
      }
    }
    else if (/* is there a next translation or should we fetch a new set? */ this.appContainer.hasMoreTranslation) {
      // console.log('switching to next page')
      this.appContainer.nextPage()
      nextTimeoutMs = 2000
      this._freshTranslation = true
    }
    else {
      console.log('no next page we fetch a new word')
      // we fetch a new translation set
      while ((await window.app.fetchTranslations(getRandomWord()[0])) == null)
      nextTimeoutMs = 2000 // will speak the english part
      this._freshTranslation = true
    }

    this._timeout = setTimeout(this.executionFunction.bind(this), nextTimeoutMs)
  }

  clearTimeout () {
    if (this._timeout) {
      clearTimeout(this._timeout)
      this._timeout = undefined
    }
  }
}
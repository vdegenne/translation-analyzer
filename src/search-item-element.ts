import { html, LitElement, nothing, PropertyValueMap } from 'lit';
import { customElement, property, query, queryAll, state } from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js'
import {live} from 'lit/directives/live.js'
import { searchItemStyles } from './styles/searchItemElementStyles';
import { getKanjiData, googleImageSearch, jisho, mdbg, naver, playJapaneseAudio, tatoeba } from './util';
import {SearchItem, SearchManager} from './search-manager'

import '@material/mwc-menu'
import { ListItem } from '@material/mwc-list/mwc-list-item';

import './concealable-span'
import { Menu } from '@material/mwc-menu';
import { ConcealableSpan } from './concealable-span';
import { sharedStyles } from './styles/sharedStyles';


@customElement('search-item-element')
export class SearchItemElement extends LitElement {
  @property({type: Object }) item!: SearchItem;

  @state() revealed: boolean = false;

  private searchManager!: SearchManager;

  @query('#anchor') anchor!: HTMLDivElement;
  @query('mwc-menu') menu!: Menu;
  @query('mwc-list-item#google-images') googleImagesListItem!: ListItem;
  @query('mwc-list-item#jisho') jishoListItem!: ListItem;
  @query('mwc-list-item#mdbg') mdbgListItem!: ListItem;
  @query('mwc-list-item#naver') naverListItem!: ListItem;
  @query('mwc-list-item#listen') listenListItem!: ListItem;
  @queryAll('concealable-span') concealableSpans!: ConcealableSpan[];
  @queryAll('concealable-span[concealed]') concealedSpans!: ConcealableSpan[];

  static styles = [searchItemStyles, sharedStyles];

  render () {
    const tagClassMap = classMap({
      'tag': true,
      'dictionary': true,
      'not-found': this.item.dictionary === 'not found',
      'jlpt5-color': this.item.dictionary === 'jlpt5',
      'jlpt4-color': this.item.dictionary === 'jlpt4',
      'jlpt3-color': this.item.dictionary === 'jlpt3',
      'jlpt2-color': this.item.dictionary === 'jlpt2',
      'jlpt1-color': this.item.dictionary === 'jlpt1',
    })

    return html`
    <!-- ANCHOR
      The anchor is used when a right click is registered.
      It serves as an unvisible anchor for the contextual menu
    -->
    <div id=anchor>
      <!-- MENU -->
      <mwc-menu quick fixed @click=${(e)=>{this.menu.show()}}>
        <mwc-list-item noninteractive>
          <span style="font-family:'Sawarabi Mincho'">${this.item.word}</span>
        </mwc-list-item>
        <li divider role="separator"></li>
        <!-- google images -->
        <mwc-list-item id="google-images" graphic=icon @click=${()=>{googleImageSearch(this.item.word)}}>
          <span>Google Images</span>
          <mwc-icon slot=graphic style="color:#2196f3">images</mwc-icon>
        </mwc-list-item>
        <!-- jisho -->
        <mwc-list-item id="jisho" graphic=icon @click=${()=>{jisho(this.item.word)}}>
          <span>Jisho</span>
          <img src="./img/jisho.ico" slot="graphic">
        </mwc-list-item>
        <mwc-list-item id="mdbg" graphic=icon @click=${()=>{mdbg(this.item.word)}}>
          <span>MDBG</span>
          <img src="./img/mdbg.ico" slot="graphic">
        </mwc-list-item>
        <mwc-list-item id="naver" graphic=icon @click=${()=>{naver(this.item.word)}}>
          <span>Naver</span>
          <img src="./img/naver.ico" slot="graphic">
        </mwc-list-item>
        <mwc-list-item id="tatoeba" graphic=icon @click=${()=>{tatoeba(this.item.word)}}>
          <span>Tatoeba</span>
          <img src="./img/tatoeba.ico" slot="graphic">
        </mwc-list-item>
        <li divider role=separator padded></li>
        <mwc-list-item graphic=icon @click=${()=>{window.app.fetchTranslations(this.item.word)}}>
            <span>Fetch translations</span>
            <mwc-icon slot="graphic" style="color:#f44336">archive</mwc-icon>
        </mwc-list-item>
        <!-- listen -->
        <mwc-list-item id="listen" graphic=icon @click=${()=>{playJapaneseAudio(this.item.hiragana || this.item.word)}}>
          <span>Listen</span>
          <mwc-icon slot=graphic>volume_up</mwc-icon>
        </mwc-list-item>
      </mwc-menu>
    </div>


    <!-- HEADER -->
    <div class=header>
      <!-- <mwc-icon-button icon=volume_up style="margin-right:5px;"
        @click=${e=>this.onSpeakerClick(e)}></mwc-icon-button> -->
      <div class="word" ?highlight=${this.item.exactSearch} ?notFound=${this.item.dictionary === 'not found'}>
        ${this.item.word.split('').map(c=>{
          const kanjiData = getKanjiData(c)
          return html`<span class="character"
            title="${kanjiData ? `(jlpt${kanjiData[2]}) ${kanjiData[3]}//${kanjiData[4]}` : ''}"
            @click=${e=>{this.searchManager.show(e.target.innerText.trim(), 'kanji')}}>${c}</span>`
        })}
      </div>
      ${this.item.hiragana ? html`
          <concealable-span class=hiragana .concealed=${live(!this.revealed)}
          ?highlight=${this.item.hiragana == this.searchManager.query}>${this.item.hiragana}</concealable-span>
      ` : nothing}
      ${this.item.dictionary === 'not found' ? html`<span class=${tagClassMap} style="margin-left:6px">${this.item.dictionary}</span>` : nothing}
      <div style="flex:1"></div>
      ${this.item.frequency ? html`
      <span class=lemma>${this.item.frequency}</span>
      ` : nothing}

      <!-- tag -->
      ${this.item.dictionary !== 'not found' ? html`<span class=${tagClassMap}>${this.item.dictionary}</span>` : nothing}
      <!-- three dots menu -->
      <mwc-icon-button icon=more_vert
        @click=${(e)=>{/* simulate right click to open the menu */this.onRightClick(e)}}></mwc-icon-button>
    </div>


    <!-- ENGLISH -->
    ${this.item.english ? html`
    <concealable-span class=english .concealed=${live(!this.revealed)}>${this.item.english}</concealable-span>
    ` : html`
    <!-- <span class=english>Click the menu to search on external sites.</span> -->
    ` }

    `
  }

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    this.addEventListener('contextmenu', e=>e.preventDefault())

    this.menu.anchor = this.anchor

    this.addEventListener('pointerdown', (e)=>{
      if (e.button === 2) {
        document.body.click() // close all others menu
        this.onRightClick(e)
      }
    })


    window.addEventListener('keypress', (e)=>{
      if (this.menu.open) {
        // e.cancelBubble = true
        e.stopPropagation()
        e.stopImmediatePropagation()
        // e.preventDefault()
        if (e.key == 'a') {
          this.googleImagesListItem.click()
        }
        if (e.key=='s') {
          this.listenListItem.click()
        }
        if (e.key=='g') {
          this.jishoListItem.click()
        }
        if (e.key=='h') {
          this.mdbgListItem.click()
        }
        if (e.key=='n') {
          this.naverListItem.click()
        }
      }
    })
  }

  reveal () {
    this.revealed = true
    this.concealableSpans.forEach(e=>e.concealed=false)
    // this.requestUpdate()
  }
  conceal() {
    this.revealed = false
    this.concealableSpans.forEach(e=>e.concealed=true)
    // this.requestUpdate()
  }

  async onRightClick (e) {
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element.
    const y = e.clientY - rect.top;  // y position within the element.

    // Move the anchor to the pointer position
    this.moveAnchorTo(x, y)
    this.menu.show()

    // Open the menu
  }

  moveAnchorTo (x: number, y: number) {
    this.anchor.style.left = `${x}px`
    this.anchor.style.top = `${y}px`
  }

  onSpeakerClick(e) {
    const target = e.target as HTMLElement;
    let el: HTMLSpanElement|null = target.parentElement!.querySelector('.hiragana')
    if (el === null) {
      el = target.parentElement!.querySelector('.word')!
    }
    playJapaneseAudio(el.innerText.trim())
  }

  hasConcealedSpans () {
    return this.concealedSpans.length > 0
  }
}

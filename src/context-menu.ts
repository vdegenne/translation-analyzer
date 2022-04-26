import {css, html, LitElement, nothing, PropertyValues} from "lit";
import {customElement, query, state} from "lit/decorators.js";
import {googleImageSearch, jisho, mdbg, naver, playJapaneseAudio, tatoeba} from "./util";
import {Menu} from "@material/mwc-menu";
import {getExactSearch, getRandomWord} from "./search-manager";
import {JlptWordEntry} from "./types";

@customElement('context-menu')
export class ContextMenu extends LitElement {
  @state() value = ''

  @query('mwc-menu') menu!: Menu;

  static styles = css`
    :host {
      position: fixed;
      --mdc-menu-item-height: 38px;
    }
  `
  protected render(): unknown {
    let exactSearch: JlptWordEntry|undefined = undefined
    if (this.value) {
      exactSearch = getExactSearch(this.value)
    }

    return html`
      <mwc-menu fixed quick>
          <mwc-list-item noninteractive style="font-family: 'Sawarabi Mincho'">
              <span>${this.value}</span>
              ${exactSearch && exactSearch[1]
                      ? html`<br><span>${exactSearch[0] == this.value ? exactSearch[1] : exactSearch[0]}</span>` 
                      : nothing }
          </mwc-list-item>
          <li divider role="separator"></li>
          <!-- google images -->
          <mwc-list-item id="google-images" graphic=icon @click=${()=>{googleImageSearch(this.value)}}>
              <span>Google Images</span>
              <mwc-icon slot=graphic style="color:#2196f3">images</mwc-icon>
          </mwc-list-item>
          <!-- jisho -->
          <mwc-list-item id="jisho" graphic=icon @click=${()=>{jisho(this.value)}}>
              <span>Jisho</span>
              <img src="./img/jisho.ico" slot="graphic">
          </mwc-list-item>
          <mwc-list-item id="mdbg" graphic=icon @click=${()=>{mdbg(this.value)}}>
              <span>MDBG</span>
              <img src="./img/mdbg.ico" slot="graphic">
          </mwc-list-item>
          <mwc-list-item id="naver" graphic=icon @click=${()=>{naver(this.value)}}>
              <span>Naver</span>
              <img src="./img/naver.ico" slot="graphic">
          </mwc-list-item>
          <mwc-list-item id="tatoeba" graphic=icon @click=${()=>{tatoeba(this.value)}}>
              <span>Tatoeba</span>
              <img src="./img/tatoeba.ico" slot="graphic">
          </mwc-list-item>
          <li divider role=separator padded></li>
          <!-- listen -->
          <mwc-list-item id="listen" graphic=icon @click=${()=>{window.app.speak(this.value)}}>
              <span>Listen</span>
              <mwc-icon slot=graphic>volume_up</mwc-icon>
          </mwc-list-item>
          <mwc-list-item id="search" graphic=icon @click=${()=>{window.app.searchManager.show(this.value)}}
                style="color:${exactSearch ? '#2196f3' : 'initial'}">
              <span>search</span>
              <mwc-icon slot=graphic style="color: inherit">search</mwc-icon>
          </mwc-list-item>
      </mwc-menu>
    `
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    this.menu.anchor = this
    super.firstUpdated(_changedProperties);

    this.addEventListener('click', e=>{
      this.menu.show()
    })
  }

  moveMenuTo (x: number, y: number)
  {
    this.style.left = `${x}px`
    this.style.top = `${y}px`
  }

  show(label?: string) {
    if (label)
      this.value=label
    this.menu.show()
  }

  get open () {
    return this.menu.open
  }
}
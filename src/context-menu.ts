import {css, html, LitElement, PropertyValues} from "lit";
import {customElement, query, state} from "lit/decorators.js";
import {googleImageSearch, jisho, mdbg, naver, playJapaneseAudio} from "./util";
import {Menu} from "@material/mwc-menu";

@customElement('context-menu')
export class ContextMenu extends LitElement {
  @state() value = ''

  @query('mwc-menu') menu!: Menu;

  static styles = css`
    :host {
      position: fixed;
    }
  `
  protected render(): unknown {
    return html`
      <mwc-menu fixed quick>
          <mwc-list-item noninteractive>
              <span style="font-family:'Sawarabi Mincho'">${this.value}</span>
          </mwc-list-item>
          <li divider role="separator"></li>
          <!-- google images -->
          <mwc-list-item id="google-images" graphic=icon @click=${()=>{googleImageSearch(this.value)}}>
              <span>Google Images</span>
              <mwc-icon slot=graphic style="color:#2196f3">images</mwc-icon>
          </mwc-list-item>
          <!-- jisho -->
          <mwc-list-item id="jisho" graphic=icon>
              <span>Jisho</span>
              <img src="./img/jisho.ico" slot="graphic" @click=${()=>{jisho(this.value)}}>
          </mwc-list-item>
          <mwc-list-item id="mdbg" graphic=icon>
              <span>MDBG</span>
              <img src="./img/mdbg.ico" slot="graphic" @click=${()=>{mdbg(this.value)}}>
          </mwc-list-item>
          <mwc-list-item id="naver" graphic=icon>
              <span>Naver</span>
              <img src="./img/naver.ico" slot="graphic" @click=${()=>{naver(this.value)}}>
          </mwc-list-item>
          <mwc-list-item id="tatoeba" graphic=icon>
              <span>Tatoeba</span>
              <img src="./img/tatoeba.ico" slot="graphic">
          </mwc-list-item>
          <li divider role=separator padded></li>
          <!-- listen -->
          <mwc-list-item id="listen" graphic=icon @click=${()=>{window.app.speak(this.value)}}>
              <span>Listen</span>
              <mwc-icon slot=graphic>volume_up</mwc-icon>
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

  open(label?: string) {
    if (label)
      this.value=label
    this.menu.show()
  }
}
import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('concealable-span')
export class ConcealableSpan extends LitElement {
  @property({type:Boolean, reflect:true}) concealed;

  // @state() content: string = ''

  static styles = css`
  :host{display:inline}
  :host([concealed]) {
    color: transparent;
    background-color: #eeeeee;
    cursor: pointer;
    border-radius: 3px;
  }
  :host([concealed]:hover) {
    background-color: #d1d1d1;
  }
  `

  constructor () {
    super()
    this.addEventListener('click', e=>{
      // reveal
      this.concealed = false
      this.dispatchEvent(new CustomEvent('span-revealed', {bubbles: true, composed: true, cancelable: true}))
    })
  }

  render () {
    return html`<slot></slot>`
  }
}
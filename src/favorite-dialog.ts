import { css, html, LitElement } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'
import { Dialog } from '@material/mwc-dialog';

export type Favorite = [string, string]
export type FavoriteList = Favorite[]

@customElement('favorite-dialog')
export class FavoriteDialog extends LitElement {
  public favorites: FavoriteList = []
  @property({type:Array}) activeTranslation?: Favorite;

  @query('mwc-dialog') dialog!: Dialog;

  constructor () {
    super()
    this.loadFromLocalStorage()
  }

  static styles = css`
  .favorite {
    margin: 0 0px 24px 0;
  }
  `

  render() {
    return html`
    <mwc-icon-button icon="${this.activeTranslation && this.favorites.some(f=>f[0]==this.activeTranslation![0]) ? 'star' : 'star_outline'}"
        @click=${()=>{this.show()}}></mwc-icon-button>

    <mwc-dialog heading="Favorites">

      <div id=favorites>
      ${this.favorites.map(f => {
        return html`
        <div class="favorite">
          <div>${f[0]}</div>
          <div>${f[1]}</div>
        </div>
        `
      })}
      </div>

      <mwc-button outlined slot=secondaryAction
        @click=${()=>{this.addActiveTranslationToFavorites()}} icon=add>add current</mwc-button>
      <mwc-button unelevated slot=primaryAction dialogAction=close>close</mwc-button>
    </mwc-dialog>
    `
  }

  addActiveTranslationToFavorites () {
    if (this.activeTranslation) {
      this.favorites.push(this.activeTranslation)
    }
    this.saveToLocalStorage()
  }

  loadFromLocalStorage () {
    const dataFromLocalStorage = localStorage.getItem('translation-practice:favorites')
    if (dataFromLocalStorage) {
      this.favorites = JSON.parse(dataFromLocalStorage)
    }
    else {
      this.favorites = []
    }
  }
  saveToLocalStorage () {
    localStorage.setItem('translation-practice:favorites', JSON.stringify(this.favorites))
    this.requestUpdate()
  }

  show () {
    this.dialog.show()
  }
}
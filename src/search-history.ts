import {html, LitElement, nothing} from "lit";
import {customElement, state} from "lit/decorators.js";
import {SearchManager, SearchItem} from "./search-manager";

@customElement('search-history')
export class SearchHistory extends LitElement {
  private searchManager: SearchManager;
  private _cached: {[query: string]: SearchItem[]} = {};
  private _history: string[] = []
  @state() private index = -1;

  constructor(searchManager: SearchManager) {
    super();
    this.searchManager = searchManager;
  }

  render() {
    return html`
        ${this.index>0 ? html`
            <mwc-button unelevated icon="arrow_back"
                @click=${()=>this.back()}>${this._history[this.index-1]}</mwc-button>
        ` : nothing}
        ${this.index<this._history.length-1 ? html`
            <mwc-button unelevated trailingIcon icon="arrow_forward"
                @click=${()=>this.forward()}>${this._history[this.index+1]}</mwc-button>
        ` : nothing}
    `
  }

  getCachedQuery (query: string): SearchItem[]|undefined {
    if (query in this._cached) {
      return this._cached[query]
    }
    else { return undefined }
  }

  addToCache (query: string, data: SearchItem[]) {
    this._cached[query] = data
  }

  pushHistory (query: string) {
    this.index = this._history.length;
    this._history.push(query)
  }

  back() {
    if (this.index === 0) {
      return; // can't go back because we are at the bottom of the list
    }
    this.index--
    this.searchManager.search(this._history[this.index], false)
  }

  forward () {
    if (this.index + 1 === this._history.length) {
      return; // can't go forward because we are at the top of the list
    }
    this.index++;
    this.searchManager.search(this._history[this.index], false)
  }
}
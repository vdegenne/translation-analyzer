import { css } from 'lit';

export const searchManagerStyles = css`
:host {
  display: block;
  font-family: Roboto;
  position: relative;
  z-index: 9999999999;
  /* --mdc-theme-surface: white; */
  --mdc-typography-body1-font-size: 16px;
  --mdc-typography-body1-line-height: 24px;
  --mdc-typography-body2-font-size: 14px;
  --mdc-typography-body2-line-height: 20px;
  --mdc-typography-subtitle1-font-size: 16px;
  --mdc-typography-button-font-size: 14px;
  --mdc-menu-item-height: 38px;
}
mwc-textfield {
  width: 100%;
}

mwc-tab-bar {
  position: absolute;
  bottom: 57px;
  left: 0;
  right: 0;
  z-index: 1;
  background-color: white;
  border: 1px solid #bdbdbd;
}

#words-results, #kanji-results {
  /* padding-bottom: 52px; */
}

#words-results > p, #kanji-results > p {
  background-color: #616161;
  color: white;
  padding: 6px 14px;
  display: inline-block;
}

search-item-element {
  padding: 15px 0;
  /* padding-bottom: 15px;
  margin-bottom: 15px; */
  border-bottom: 1px solid #eeeeee;
}
search-item-element:first-of-type {
  padding-top: 0;
}
search-item-element:last-of-type {
  border-bottom: 0;
}
`
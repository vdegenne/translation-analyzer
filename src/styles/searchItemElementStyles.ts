import { css } from 'lit';


export const searchItemStyles = css`
:host {
  display: block;
  position: relative;
  /* border: 1px solid black; */
}
:host:hover {
  /* background-color: grey; */
}
:host #anchor {
  position: absolute;
  width: 0px;
  height: 0px;
  /* background-color: black; */
}
:host .header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* margin: 0px 0 5px 0; */
  position: relative;
}
:host .header mwc-icon-button {
  --mdc-icon-button-size: 32px;
}
:host .word {
  font-family: 'Sawarabi Mincho', serif;
  font-size: 1.5em;
  color: black;
}
:host [highlight] {
  background-color: yellow;
}
:host .word[notFound] {
  /* color: red; */
}
:host .word .character {
  /* cursor: pointer; */
}
:host .word .character:hover {
  color: grey;
}
:host .hiragana {
  font-family: 'Sawarabi Mincho', serif;
  /* flex: 1; */
  margin: 0 0 0 12px;
}
/* :host .dictionary {
  background: rgb(255, 235, 59);
  color: black;
} */
:host .lemma {
  border: 1px solid rgb(117, 117, 117);
  background-color: transparent;
  color: black;
  padding: 0px 7px;
  border-radius: 12px;
  margin-right: 5px;
}
:host .english::before {
  content: '';
  display: block;
  height: 6px;
  /* background-color: red; */
  /* margin-top: 5px; */
}
`
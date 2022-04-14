import { css } from 'lit';

export const sharedStyles = css`
[hide] {
  display: none;
}
.tag {
  padding: 0px 14px;
  border-radius: 12px;
}
.jlpt5-color {
  background-color: #4caf50 !important;
  color: white !important;
}
.jlpt4-color {
  background-color: #ffeb3b !important;
  color: black !important;
}
.jlpt3-color {
  background-color: #ff9800 !important;
  color: white !important;
}
.jlpt2-color {
  background-color: #f44336 !important;
  color: white !important;
}
.jlpt1-color {
  background-color: black !important;
  color: white !important;
}
.jlpt0-color {
  background-color: #eeeeee !important;
  color: white !important;
}
.not-found {
  /* background-color: transparent; */
  border: 1px solid #f44336;
  color: #f44336;
}
`
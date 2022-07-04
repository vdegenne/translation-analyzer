import { IconButton } from '@material/mwc-icon-button';
import { PropertyValueMap } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('icon-button')
export class AppIconButton extends IconButton {
  private pressed = false;
  private longPressTimeout?: NodeJS.Timeout;

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    this.addEventListener('pointerdown', () => {
      this.pressed = true

      this.longPressTimeout = setTimeout(() => {
        if (this.pressed) {
          this.dispatchEvent(new CustomEvent('long-press'))
          this.clearLongPressTimeout()
        }
      }, 1000)
    })

    this.addEventListener('pointerup', () => {
      if (this.longPressTimeout) {
        this.dispatchEvent(new CustomEvent('tap'))
      }
      this.clearLongPressTimeout()
    })

    this.addEventListener('mouseleave', () => { this.clearLongPressTimeout() })

    super.firstUpdated(_changedProperties)
  }

  clearLongPressTimeout () {
    clearTimeout(this.longPressTimeout!)
    this.longPressTimeout = undefined
    this.pressed = false
  }
}
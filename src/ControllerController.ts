import gameControl from 'gamecontroller.js/src/gamecontrol.js';
import { AppContainer } from './main';
import { cancelAudio } from './util';

function doNothingOnWindowBlurWrapper(callback: Function) {
  return () => {
    if (document.hasFocus()) {
      callback();
    }
  };
}

export class ControllerController {
  private app: AppContainer;

  private secondary = false;

  constructor(appInstance: AppContainer) {
    this.app = appInstance;
    gameControl.on('connect', (gamepad) => {
      gamepad
        .before(
          'button0',
          doNothingOnWindowBlurWrapper(() => {
            this.app.revealNextPart();
          })
        )
        .before(
          'button1',
          doNothingOnWindowBlurWrapper(() => {
            cancelAudio();
          })
        )
        .before(
          'button14',
          doNothingOnWindowBlurWrapper(() => {
            this.app.arrowBackButton.click();
          })
        )
        .before(
          'button15',
          doNothingOnWindowBlurWrapper(() => {
            this.app.arrowForwardButton.click();
          })
        )
        .before(
          'button4',
          doNothingOnWindowBlurWrapper(() => {
            this.app.incrementPlaybackRate(-0.1);
          })
        )
        .before(
          'button5',
          doNothingOnWindowBlurWrapper(() => {
            this.app.incrementPlaybackRate(+0.1);
          })
        )
        .before(
          'button6',
          doNothingOnWindowBlurWrapper(() => {
            this.app.speakSourceParagraph();
          })
        )
        .before(
          'button7',
          doNothingOnWindowBlurWrapper(() => {
            this.app.speakButton.click();
          })
        )
        .before(
          'button8',
          doNothingOnWindowBlurWrapper(() => {
            this.app.speakTranslatedParagraph();
          })
        )
        .before(
          'button9',
          doNothingOnWindowBlurWrapper(() => {
            this.app.casinoButton.click();
          })
        );
    });
  }
}

const shuffle = new Audio('./assets/audio/shuffle.mp3');
function playShuffle() {
  return shuffle.play();
}

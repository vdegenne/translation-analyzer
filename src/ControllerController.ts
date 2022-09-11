import gameControl from 'gamecontroller.js/src/gamecontrol.js'
import { AppContainer } from './main'
import { cancelAudio } from './util';

export class ControllerController {
  private app: AppContainer;

  private secondary = false

  constructor (appInstance: AppContainer) {
    this.app = appInstance;
    gameControl.on('connect', gamepad=>{
      gamepad
      .before('button0', ()=>{
        this.app.revealNextPart()
      })
      .before('button1', () => {
        cancelAudio()
      })
      .before('button14', ()=>{
        this.app.arrowBackButton.click()
      })
      .before('button15', ()=>{
        this.app.arrowForwardButton.click()
      })
      .before('button4', () => {
        this.app.incrementPlaybackRate(-0.10)
      })
      .before('button5', () => {
        this.app.incrementPlaybackRate(+0.10)
      })
      .before('button6', () => {
        this.app.speakSourceParagraph()
      })
      .before('button7', ()=>{
        this.app.speakButton.click()
      })
      .before('button8', () => {
        this.app.speakTranslatedParagraph()
      })
      .before('button9', () => {
        this.app.casinoButton.dispatchEvent(new CustomEvent('long-press'))
      })
      // .before('button7', ()=>{
      //   this.app.togglePlayInterval()
      // })

      // .before('button6', ()=>{this.app.clickListenButton()})
      // .before('button4', ()=>{
      //   if (this.secondary) {
      //     this.app.videoElement.speedDown()
      //   }
      //   else {
      //     this.app.clingVideoToStartTime()
      //   }
      // })
      // .before('button5', ()=>{
      //   if (this.secondary) {
      //     this.app.videoElement.speedUp()
      //   }
      //   else {
      //     this.app.clingVideoToEndTime()
      //   }
      // })
      // .before('button10', ()=>this.app.clingStartTimeToVideoCurrentTime())
      // .before('button11', ()=>this.app.clingEndTimeToVideoCurrentTime())

      // .before('button6', ()=>this.secondary=true)
      // .after('button6', ()=>this.secondary=false)


      // .before('left0', ()=>this.app.stretchStartTimeToLeft(this.secondary ? 0.1 : 1))
      // .before('right0', ()=>this.app.stretchStartTimeToRight(this.secondary ? 0.1 : 1))
      // .before('left1', ()=>this.app.stretchEndTimeToLeft(this.secondary ? 0.1 : 1))
      // .before('right1', ()=>this.app.stretchEndTimeToRight(this.secondary ? 0.1 : 1))
    })
  }
}

const shuffle = new Audio('./audio/shuffle.mp3')
function playShuffle () { return shuffle.play(); }
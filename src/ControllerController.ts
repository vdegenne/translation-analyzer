import gameControl from 'gamecontroller.js/src/gamecontrol.js'
import { AppContainer } from './main'
import { EventIconButton } from './event-icon-button';

export class ControllerController {
  private app: AppContainer;
  // private controllerEventsLoopHandle
  // private controllerEventsLoopBind = this.controllerEventsLoop.bind(this)
  // private gamepad!: Gamepad
  // private pressed: number[] = []

  private secondary =false
  private leftArrowPressed = false
  private rightArrowPressed = false

  /**
   * Constructor
   */
  constructor (appInstance: AppContainer) {
    this.app = appInstance;
    gameControl.on('connect', gamepad=>{
      gamepad
      .before('button0', ()=>{
        this.app.revealNextPart()
      })
      .before('button9', () => {
        this.app.casinoButton.click()
        playShuffle()
      })

      .before('button1', ()=>{
        this.app.tatoebaDialog.close()
        this.app.searchManager.close()
        window.searchManager.close()
      })
      // .before('button14', ()=>{
      //   this.leftArrowPressed = true
      //   this.app.videoElement.stepBack(this.secondary ? 0.1 : 1);
      //   setTimeout(async ()=>{
      //     while (this.leftArrowPressed) {
      //       this.app.videoElement.stepBack(this.secondary ? 0.1 : 1);
      //       await sleep(100)
      //     }
      //   }, 1000)
      // })
      // .after('button14', ()=>{ this.leftArrowPressed = false })
      // // ----->
      .before('button14', ()=>{
        this.app.arrowBackButton.click()
      })
      .before('button15', ()=>{
        this.app.arrowForwardButton.click()
      })
      .before('left0', ()=>{
        if (this.app.candidatesRow.selectPreviousCandidate()) {
          playTick1()
        }
      })
      .before('right0', ()=>{
        if (this.app.candidatesRow.selectNextCandidate()) {
          playTick1()
        }
      })
      // .before('button15', ()=>{
      //   this.rightArrowPressed = true
      //   this.app.videoElement.stepForward(this.secondary ? 0.1 : 1);
      //   setTimeout(async ()=>{
      //     while (this.rightArrowPressed) {
      //       this.app.videoElement.stepForward(this.secondary ? 0.1 : 1);
      //       await sleep(100)
      //     }
      //   }, 1000)
      // })
      // .after('button15', ()=>{ this.rightArrowPressed = false })

      // .before('button3', ()=>this.app.insertNewCue())

      // .before('button12', ()=>this.app.previousCue())
      // .before('button13', ()=>{
      //   if (this.secondary) {
      //     this.app.lastCue();
      //   }
      //   else {
      //     this.app.nextCue()
      //   }
      // })
      .before('button7', ()=>{
        this.app.speakButton.click()
      })
      .before('button3', ()=>{if (this.app.revealed) {
        playShuffle()
        this.app.clickNextButton()
      }})
      // .before('button7', ()=>{
      //   this.app.togglePlayInterval()
      // })

      .before('button4', () => {
        const button = this.app.shadowRoot!.querySelector('event-icon-button[icon=record_voice_over]') as EventIconButton
        button.dispatchEvent(new PointerEvent('pointerdown'))
      })
      .after('button4', () => {
        const button = this.app.shadowRoot!.querySelector('event-icon-button[icon=record_voice_over]') as EventIconButton
        button.dispatchEvent(new PointerEvent('pointerup'))
        button.click()
      })
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
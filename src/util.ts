import _kanjis from '../docs/data/kanjis.json'
import { Kanji } from './types'
import {isFullChinese, isFullJapanese} from "asian-regexps";
import { cancelSpeech, speakJapanese } from './speech';

export function jisho (word) {
  // window.open(`https://jisho.org/search/${encodeURIComponent(word)}%20%23kanji`, '_blank')
  window.open(`https://jisho.org/search/${encodeURIComponent(word)}`, '_blank')
}
export function mdbg (word) {
  window.open(`https://www.mdbg.net/chinese/dictionary?page=worddict&wdrst=0&wdqb=${encodeURIComponent(word)}`, '_blank')
}

export function tatoeba (word) {
  window.open(`https://tatoeba.org/en/sentences/search?from=jpn&query=${encodeURIComponent(word)}&to=`, '_blank')
}

export async function naver (word) {
  if (word.length === 1 && isFullChinese(word)) {
    // fetch naver hanzi link
    const response = await fetch(`https://assiets.vdegenne.com/chinese/naver/${word}`)
    window.open(`https://hanja.dict.naver.com/${await response.text()}/learning`, '_blank')
    return
  }
  window.open(`https://ja.dict.naver.com/#/search?range=example&query=${encodeURIComponent(word)}`, '_blank')
}

export function googleImageSearch (word) {
  window.open(`http://www.google.com/search?q=${encodeURIComponent(word)}&tbm=isch`, '_blank')
}

export function goo(word) {
  window.open(`https://dictionary.goo.ne.jp/word/${encodeURIComponent(word)}/`, '_blank')
}

// export function mdbg (word) {
//   window.open(`https://www.mdbg.net/chinese/dictionary?page=worddict&wdrst=0&wdqb=${encodeURIComponent(word)}`, '_blank")
// }

export function getKanjiData (character: string) {
  return (_kanjis as Kanji[]).find(k => k[1] === character)
}

const bellAudio = new Audio('./audio/bell.mp3')
export async function ringTheBell() {
  await bellAudio.play()
}



/**
 *
 */
let _playingController: AbortController|null = null;
export function isPlayingAudio () { return _playingController != null }

export async function speak (text:string, rate) {
  if (isFullJapanese(text)) {
    await cancelAudio()
    _playingController = new AbortController();
    _playingController.signal.addEventListener('abort', () => {
      cancelSpeech()
    })
    // is the selection in the words
    const result = window.app.searchManager.searchData(text).filter(s=>s.type=='words' && s.exactSearch && s.dictionary !== 'not found')
    // if (result.length) {
      try {
        if (result.length == 0 || text.length > 6) {
          throw new Error(); // intentionally triggering an exception to call the rollback speaker
        }
        await playJapaneseAudio(result.length ? (result[0].hiragana || result[0].word) : text)
      } catch (e) {
        // cancelSpeech() // cancel in case a speech is already playing
        await speakJapanese(result.length ? (result[0].hiragana || result[0].word) : text, 1, rate)
      }
      finally {
        _playingController = null;
      }
  }
}

export async function playJapaneseAudio (word) {
  return new Promise((resolve, reject) => {
    if (_playingController !== null) {
      _playingController.signal.addEventListener('abort', () => {
        reject()
        audio.pause()
        // resolve(null)
      })
    }
    const audio = new Audio(`https://assiets.vdegenne.com/data/japanese/audio/${encodeURIComponent(word)}`)
    audio.onerror = reject
    audio.onended = resolve
    audio.play()
  })
}

export async function cancelAudio () {
  if (_playingController != null) {
    _playingController.abort()
    _playingController = null
    await new Promise(resolve => setTimeout(resolve, 200))
  }
}
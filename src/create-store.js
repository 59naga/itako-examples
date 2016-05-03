import {compose, createStore} from 'redux'
import persistState from 'redux-localstorage'

const createPersistentStore = compose(persistState())(createStore)
const initialState = {
  speakers: ['hikari', 'haruka', 'takeru', 'santa', 'bear', 'show'],
  form: {
    text: 'greeting',
    pitch: 1,
    speed: 1,
    volume: 1,
    speaker: 'hikari'
  },
  itako: {
    read: {
      serial: true
    },
    transformers: {
      dictionary: {
        options: [
          // replace token.value to 'hello (pitch:2) world (pitch:0.5)'
          {
            pattern: 'greeting',
            method: 'replace',
            replacement: 'hello (pitch:2) world (pitch:0.5)'
          },
          // change token.options to $1:$2 (remove the matched value)
          {
            pattern: '/\\((volume|pitch):([\\.\\d]+)\\)/',
            method: 'toggle',
            replacement: "{$1:'$2'}"
          },
          // create new token using properties instead of `nintendo`
          {
            pattern: 'nintendo',
            method: 'exchange',
            replacement: "{type:'audio',value:'https://static.edgy.black/fixture.wav'}"
          },
          // if match, overrides all tokens using new instance
          {
            pattern: '/play\\((.+?).wav\\)/',
            method: 'rewrite',
            replacement: "{type:'audio',value:'https://static.edgy.black/$1.wav'}"
          },
          // if match, passed arguments of transform to onMatch
          {
            pattern: '/@([\\S]+)/',
            method: 'replace',
            replacement: 'registered the `$1`'
          }
        ]
      }
    }
  }
}

export default (reducer) => createPersistentStore(
  reducer,
  initialState,
)

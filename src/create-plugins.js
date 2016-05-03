import ItakoTextReaderSpeechSynthesis from 'itako-text-reader-speech-synthesis'
import ItakoAudioReaderAudioContext from 'itako-audio-reader-audio-context'
import ItakoTextTransformerDictionary from 'itako-text-transformer-dictionary'
import ItakoTextTransformerRequest from 'itako-text-transformer-request'

export default () => {
  const readers = [
    new ItakoTextReaderSpeechSynthesis(),
    new ItakoAudioReaderAudioContext()
  ]
  const transformers = [
    new ItakoTextTransformerDictionary(),
    new ItakoTextTransformerRequest('text', {
      baseUrl: 'https://voicetext.berabou.me/',
      toType: 'audio',
      defaults: {
        data: {
          speaker: 'hikari',
          format: 'ogg'
        }
      },
      beforeTransform (token) {
        var opts = {}
        if (token.options.pitch) {
          opts.pitch = token.options.pitch * 100
        }
        if (token.options.volume) {
          opts.volume = token.options.volume * 100
        }
        if (token.options.speed) {
          opts.speed = token.options.speed * 100
        }
        return token.setOptions(opts)
      }
    })
  ]

  return [readers, transformers]
}

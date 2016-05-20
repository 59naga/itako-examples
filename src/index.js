import React from 'react'
import ReactDOM from 'react-dom'
import createStore from './create-store'
import {connect} from 'react-redux'
import Itako from 'itako'
import createPlugins from './create-plugins'
import pascalCase from 'pascal-case'

import update from 'react-addons-update'
import _set from 'lodash.set'
import _debounce from 'lodash.debounce'

const debounceTime = 500 // msec

const store = createStore((state = {}, action) => {
  switch (action.type) {
    case 'add':
      return update(
        state,
        _set({}, 'itako.transformers.dictionary.options.$push', [action.payload])
      )
    case 'remove':
      return update(
        state,
        _set({}, 'itako.transformers.dictionary.options.$splice', [[action.payload, 1]])
      )
    case 'update':
      return update(
        state,
        _set({}, 'itako.transformers.dictionary.options.$splice', [[action.payload.index, 1, action.payload.data]])
      )

    case 'loaded':
      return {...state, ...action.payload}
    case 'form_update':
      return update(state, {form: {$merge: action.payload}})
    default:
      return state
  }
})

const Greet = connect(
  state => state
)(
  class extends React.Component {
    static ranges = ['pitch', 'speed', 'volume']

    componentDidMount () {
      this.itako = new Itako(...createPlugins()).setOptions(this.props.itako)

      window.itako = this.itako

      this._read = _debounce((text) => {
        this.read(text)
      }, debounceTime)
    }
    read (text = this.props.form.text) {
      if (this.itako === undefined) {
        return
      }

      this.itako.setOptions(this.props.itako)
      this.itako.read(text, this.props.form)
    }

    handleSubmit (event) {
      event.preventDefault()
      this.read()
    }
    handeChangeText (event) {
      this.props.dispatch({ type: 'form_update', payload: {text: event.target.value} })
    }
    handleChangePitch (event) {
      this.props.dispatch({ type: 'form_update', payload: {pitch: event.target.value} })
      this._read()
    }
    handleChangeSpeed (event) {
      this.props.dispatch({ type: 'form_update', payload: {speed: event.target.value} })
      this._read()
    }
    handleChangeVolume (event) {
      this.props.dispatch({ type: 'form_update', payload: {volume: event.target.value} })
      this._read()
    }
    handleChangeSpeaker (event) {
      this.props.dispatch({ type: 'form_update', payload: {speaker: event.target.value} })
      this._read()
    }
    getDictionaryControlls () {
      const defines = this.props.itako.transformers.dictionary.options
      const handleAdd = (event) => {
        event.preventDefault()
        this.props.dispatch({
          type: 'add',
          payload: {
            pattern: '',
            method: 'replace',
            replacement: ''
          }
        })
      }

      return (
        <ul>
          {
            defines.map((define, index) => {
              const methods = ['replace', 'toggle', 'exchange', 'rewrite']
              const handleChangeMethod = (event) => {
                define.method = event.target.value
                this.props.dispatch({type: 'update', payload: {index, data: define}})
              }
              const handleChangePattern = (event) => {
                define.pattern = event.target.value
                this.props.dispatch({type: 'update', payload: {index, data: define}})
              }
              const handleChangeReplacement = (event) => {
                define.replacement = event.target.value
                this.props.dispatch({type: 'update', payload: {index, data: define}})
              }
              const handleRemove = (event) => {
                event.preventDefault()
                this.props.dispatch({type: 'remove', payload: index})
              }

              return (
                <li key={index}>
                  <select value={define.method || ''} onChange={handleChangeMethod}>
                    {
                      methods.map((method) => (
                        <option key={method} value={method || ''}>{method}</option>
                      ))
                    }
                  </select>
                  <input
                    value={define.pattern || ''}
                    onChange={handleChangePattern}
                  />
                  <input
                    value={define.replacement || ''}
                    onChange={handleChangeReplacement}
                  />
                  <button onClick={handleRemove}>―</button>
                </li>
              )
            })
          }
          <li><button onClick={handleAdd}>＋</button></li>
        </ul>
      )
    }
    render () {
      const ranges = this.constructor.ranges.map((name) => {
        return (
          <label key={name}>
            <input
              type='range'
              value={this.props.form[name] || ''}
              onChange={::this[`handleChange${pascalCase(name)}`]}

              step='0.01'
              min='0.01'
              max='2'
            />
            {name}:{this.props.form[name]}
          </label>
        )
      })

      return (
        <div>
          <form onSubmit={::this.handleSubmit}>
            <label>
              <input value={this.props.form.text || ''} onChange={::this.handeChangeText} autoFocus />
            </label>
            {ranges}
            <label>
              <select
                value={this.props.form.speaker || ''}
                onChange={::this.handleChangeSpeaker}
              >
                {
                  this.props.speakers.map((speaker) => {
                    return <option key={speaker}>{speaker}</option>
                  })
                }
              </select>
            </label>
            <button style={{display: 'none'}}></button>
            {this.getDictionaryControlls()}
            <button>say!</button>
            <button onClick={(event) => {
              event.preventDefault()
              localStorage.clear()
              location.reload()
            }}>reset</button>
          </form>
        </div>
      )
    }
  }
)

window.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(<Greet store={store} />, document.querySelector('main'))
})

import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props)

    const context = new AudioContext()

    this.state = {
      isPlaying: false,
      timerId: null,
      audio: {
        extraOscNum: 0,
        detuneRange: 0,
        context,
        env: {
          attack: 0.2,
          decay: 0.2,
          sustain: 0.5,
          release: 0,
        },
        noteDuration: 3
      },
    }
  }

  playSound = () => {
    const context = this.state.audio.context
    const env = this.state.audio.env
    const currentTime = context.currentTime
    const gainNode = context.createGain()
    const noteDuration = 1

    // envelope
    gainNode.gain.setValueAtTime(0, currentTime)
    gainNode.gain.linearRampToValueAtTime(1, currentTime + env.attack)
    gainNode.gain.setTargetAtTime(env.sustain, currentTime + env.attack, env.decay)
    gainNode.gain.setTargetAtTime(0, currentTime + noteDuration, env.release)


    let osc = context.createOscillator()
    osc.type = 'square'
    osc.frequency.setValueAtTime(440, currentTime)
    osc.connect(gainNode).connect(context.destination)
    osc.start(currentTime)
    osc.stop(currentTime + 5)
    for (let i = 0; i < this.state.audio.extraOscNum; i++) {
      let osc = context.createOscillator()
      let randFreqChange = Math.floor(Math.random() * this.state.audio.detuneRange);
      randFreqChange *= Math.floor(Math.random() * 2) === 1 ? 1 : -1
      osc.type = 'square'
      osc.frequency.setValueAtTime(440 + randFreqChange, currentTime)
      osc.connect(gainNode).connect(context.destination)
      osc.start(currentTime)
      osc.stop(currentTime + 5)
    }
  }

  changeEnvelope = (param) => (event) => {
    const v = event.target.value
    this.setState((state) => ({
      ...state,
      audio: {
        ...state.audio,
        env: {
          ...state.audio.env,
          [param]: parseFloat(v)
        }
      }
    }))
  }

  changeextraOscNum = (event) => {
    const v = parseInt(event.target.value)
    this.setState((state) => ({
      ...state,
      audio: {
        ...state.audio,
        extraOscNum: v
      }
    }))
  }

  changeDetune = (event) => {
    const v = parseInt(event.target.value)
    this.setState((state) => ({
      ...state,
      audio: {
        ...state.audio,
        detuneRange: v
      }
    }))
  }

  togglePlay = (event) => {
    this.setState((state) => {
      let timerId = state.timerId;
      if (state.isPlaying) {
        clearInterval(timerId)
      } else {
        this.playSound()
        timerId = setInterval(this.playSound, 5000);
      }

      return {
        isPlaying: !state.isPlaying,
        timerId
      }
    })
  }

  render() {
    const playbutton = (
      <button
        onClick={this.togglePlay}
      >
        {this.state.isPlaying ? "Pause" : "Play"}
      </button>
    );

    const env = this.state.audio.env;
    const envelopeFilter = (
      <div>
        <label htmlFor="attack">Attack</label>
        <input type="range" name="attack" min="0" max="1" step="0.01" value={env.attack} onChange={this.changeEnvelope("attack")}/>
        <label htmlFor="decay">decay</label>
        <input type="range" name="decay" min="0" max="1" step="0.01" value={env.decay} onChange={this.changeEnvelope("decay")}/>
        <label htmlFor="sustain">Sustain</label>
        <input type="range" name="sustain" min="0" max="1" step="0.01" value={env.sustain} onChange={this.changeEnvelope("sustain")}/>
        <label htmlFor="release">Release</label>
        <input type="range" name="release" min="0" max="1" step="0.01" value={env.release} onChange={this.changeEnvelope("release")}/>
      </div>
    )

    return (
      <div className="App">
        <div>
          {playbutton}
        </div>
        <div>
          <label htmlFor="extraOscNum">Extra oscillators</label>
          <input name="extraOscNum" type="number" min="1" max="5" value={this.state.audio.extraOscNum} onChange={this.changeextraOscNum}/>
          <label htmlFor="detunerange">Detune range</label>
          <input type="range" name="detuneRange" min="0" max="1000" step="1" value={this.state.audio.detuneRange} onChange={this.changeDetune}/>
        </div>
        <div>
        {envelopeFilter}
        </div>
      </div>
    );
  }
}

export default App;

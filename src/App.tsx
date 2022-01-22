import {SyntheticEvent, useEffect, useRef, useState} from 'react'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faPlay, faPause, faRedo} from '@fortawesome/free-solid-svg-icons'
import {Flex} from './flex'
import {Wrapper} from './wrapper'
import {exhaustive} from './helpers/exhaustive'
import './App.css'

const INITIAL_MS = 20 * 1000

type SetCountdownScreenT = {
  tag: 'set-countdown'
  initialMs: number
}

type CountdownScreenT = {
  tag: 'countdown'
  fromMs: number
  autoStart: boolean
}

type ScreenT = SetCountdownScreenT | CountdownScreenT

export function App() {
  const [screen, setScreen] = useState<ScreenT>({tag: 'set-countdown', initialMs: INITIAL_MS})

  return (
    <Wrapper>
      <Screen screen={screen} setScreen={setScreen} />
    </Wrapper>
  )
}

function Screen({
  screen,
  setScreen
}: {
  screen: ScreenT
  setScreen: React.Dispatch<React.SetStateAction<ScreenT>>
}) {
  switch (screen.tag) {
    case 'set-countdown':
      return <SetCountdownScreen screen={screen} setScreen={setScreen} />
    case 'countdown':
      return <CountdownScreen screen={screen} setScreen={setScreen} />
    default:
      return exhaustive(screen)
  }
}

function CountdownScreen({
  screen: {fromMs, autoStart},
  setScreen
}: {
  screen: CountdownScreenT
  setScreen: React.Dispatch<React.SetStateAction<ScreenT>>
}) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const [currentMs, setCurrentMs] = useState(fromMs)
  const [state, setState] = useState<'paused' | 'counting' | 'finished'>(
    autoStart ? 'counting' : 'paused'
  )

  function onEdit() {
    setScreen({tag: 'set-countdown', initialMs: currentMs})
  }

  function onStart() {
    setState('counting')
  }

  function onPause() {
    setState('paused')
  }

  function onReset() {
    setCurrentMs(fromMs)
    setState('counting')
  }

  useEffect(() => {
    if (currentMs === 0) {
      setState('finished')
    }
  }, [currentMs])

  useEffect(() => {
    switch (state) {
      case 'counting':
        if (currentMs > 0 && (intervalRef.current === null || intervalRef.current === undefined)) {
          intervalRef.current = setInterval(() => {
            setCurrentMs(prevMs => prevMs - 1000)
          }, 1000)
        }
        break
      case 'paused':
      case 'finished':
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        break
      default:
        exhaustive(state)
    }
  }, [currentMs, state])

  return (
    <Flex justifyContent="space-between" alignItems="center">
      <CountDown remainingMs={currentMs} onEdit={onEdit} />
      <Flex flexDirection="column" className="ButtonGroup">
        <button onClick={onStart} aria-label="Start">
          <FontAwesomeIcon icon={faPlay} className="ActionButtonIcon" />
        </button>
        <button onClick={onPause} aria-label="Pause">
          <FontAwesomeIcon icon={faPause} className="ActionButtonIcon" />
        </button>
        <button onClick={onReset} aria-label="Reset">
          <FontAwesomeIcon icon={faRedo} className="ActionButtonIcon" />
        </button>
      </Flex>
    </Flex>
  )
}

function CountDown({remainingMs, onEdit}: {remainingMs: number; onEdit: () => void}) {
  const className =
    remainingMs === 0
      ? null
      : remainingMs <= 5 * 1000
      ? 'AlmostGone'
      : remainingMs <= 15 * 1000
      ? 'EndingSoon'
      : null

  return (
    <button className={['Timer', className].join(' ')} onClick={onEdit}>
      {msToHumanReadable(remainingMs)}
    </button>
  )
}

function SetCountdownScreen({
  screen,
  setScreen
}: {
  screen: SetCountdownScreenT
  setScreen: React.Dispatch<React.SetStateAction<ScreenT>>
}) {
  const {
    hours: initialHours,
    minutes: initialMinutes,
    seconds: initialSeconds
  } = toClock(screen.initialMs)

  const [hours, setHours] = useState(initialHours)
  const [minutes, setMinutes] = useState(initialMinutes)
  const [seconds, setSeconds] = useState(initialSeconds)

  function onChangeHours(e: SyntheticEvent<HTMLInputElement>) {
    const value = e.currentTarget.value
    const asNum = parseInt(value.length === 0 ? '0' : value, 10)
    setHours(isNaN(asNum) ? 0 : asNum)
  }

  function onChangeMinutes(e: SyntheticEvent<HTMLInputElement>) {
    const value = e.currentTarget.value
    const asNum = parseInt(value.length === 0 ? '0' : value, 10)
    setMinutes(isNaN(asNum) ? 0 : asNum)
  }

  function onChangeSeconds(e: SyntheticEvent<HTMLInputElement>) {
    const value = e.currentTarget.value
    const asNum = parseInt(value.length === 0 ? '0' : value, 10)
    setSeconds(isNaN(asNum) ? 0 : asNum)
  }

  function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    const fromMs = toMs(hours, minutes, seconds)
    setScreen({tag: 'countdown', fromMs, autoStart: false})
  }

  function onReset() {
    setHours(initialHours)
    setMinutes(initialMinutes)
    setSeconds(initialSeconds)
  }

  function onCancelEditing() {
    const fromMs = toMs(initialHours, initialMinutes, initialSeconds)
    setScreen({tag: 'countdown', fromMs, autoStart: true})
  }

  return (
    <form onSubmit={onSubmit} onReset={onReset}>
      <Flex alignItems="flex-end" justifyContent="space-around">
        <Flex flexDirection="column">
          <label htmlFor="hours">Hours</label>
          <input id="hours" type="number" min="0" max="23" onChange={onChangeHours} value={hours} />
          <button type="reset" className="EditActionButton">
            Reset
          </button>
        </Flex>

        <Flex flexDirection="column">
          <label htmlFor="minutes">Minutes</label>
          <input
            id="minutes"
            type="number"
            min="0"
            max="59"
            value={minutes}
            onChange={onChangeMinutes}
          />
          <button type="button" onClick={onCancelEditing} className="EditActionButton">
            Cancel
          </button>
        </Flex>

        <Flex flexDirection="column">
          <label htmlFor="seconds">Seconds</label>
          <input
            id="seconds"
            type="number"
            min="0"
            max="59"
            value={seconds}
            onChange={onChangeSeconds}
          />
          <button type="submit" className="EditActionButton">
            OK
          </button>
        </Flex>
      </Flex>
    </form>
  )
}

function toMs(hours: number, minutes: number, seconds: number) {
  const hMs = hours * 60 * 60 * 1000
  const mMs = minutes * 60 * 1000
  const sMs = seconds * 1000
  return hMs + mMs + sMs
}

function msToHumanReadable(ms: number) {
  const {hours, minutes, seconds} = toClock(ms)
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

function toClock(ms: number) {
  const seconds = Math.floor((ms / 1000) % 60)
  const minutes = Math.floor((ms / (1000 * 60)) % 60)
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24)
  return {hours, minutes, seconds}
}

function pad(num: number) {
  return num < 10 ? `0${num}` : num
}

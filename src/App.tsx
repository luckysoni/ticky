import {SyntheticEvent, useEffect, useRef, useState} from 'react'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faPlay, faPause, faRedo} from '@fortawesome/free-solid-svg-icons'
import {Flex} from './flex'
import {Wrapper} from './wrapper'
import {exhaustive} from './helpers/exhaustive'
import './App.css'
import {useHotkeys} from 'react-hotkeys-hook'
import {addIfClassNames, addMaybeClassName} from './helpers/classnames'

export function App() {
  const [showSetCountdownScreen, setShowSetCountdownScreen] = useState(true)
  const [fromMs, setFromMs] = useState(0)

  return (
    <Wrapper>
      <div className="Wrapper">
        <CountdownScreen fromMs={fromMs} setShowSetCountdownScreen={setShowSetCountdownScreen} />
        {showSetCountdownScreen ? (
          <div className="SetCountdownScreenWrapper">
            <SetCountdownScreen
              onHide={() => setShowSetCountdownScreen(false)}
              fromMs={fromMs}
              setFromMs={setFromMs}
            />
          </div>
        ) : null}
      </div>
    </Wrapper>
  )
}

function CountdownScreen({
  fromMs,
  setShowSetCountdownScreen
}: {
  fromMs: number
  setShowSetCountdownScreen: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const [currentMs, setCurrentMs] = useState(fromMs)
  const [state, setState] = useState<'paused' | 'counting'>('paused')
  const [toggleState, setToggleState] = useState(false)

  useHotkeys('s', () => setToggleState(true))
  useHotkeys('r', () => onReset())

  useEffect(() => {
    setCurrentMs(fromMs)
  }, [fromMs])

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  })

  useEffect(() => {
    if (toggleState) {
      setState(prevState => {
        switch (prevState) {
          case 'counting':
            return 'paused'
          case 'paused':
            return currentMs > 0 ? 'counting' : 'paused'
          default:
            return exhaustive(prevState)
        }
      })
      setToggleState(false)
    }
  }, [currentMs, toggleState])

  function onEdit() {
    setState('paused')
    setShowSetCountdownScreen(true)
  }

  function onStart() {
    if (currentMs > 0) {
      setState('counting')
    }
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
      setState('paused')
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
      <CountDown remainingMs={currentMs} onEdit={onEdit} isPaused={state === 'paused'} />
      <Flex flexDirection="column" className="ButtonGroup">
        <button onClick={onStart} aria-label="Start">
          <FontAwesomeIcon
            icon={faPlay}
            className={addMaybeClassName(
              'ActionButtonIcon',
              state === 'counting' ? 'ActiveActionButtonIcon' : null
            )}
          />
        </button>
        <button onClick={onPause} aria-label="Pause">
          <FontAwesomeIcon
            icon={faPause}
            className={addMaybeClassName(
              'ActionButtonIcon',
              state === 'paused' ? 'ActiveActionButtonIcon' : null
            )}
          />
        </button>
        <button onClick={onReset} aria-label="Restart">
          <FontAwesomeIcon icon={faRedo} className="ActionButtonIcon" />
        </button>
      </Flex>
    </Flex>
  )
}

function CountDown({
  remainingMs,
  isPaused,
  onEdit
}: {
  remainingMs: number
  isPaused: boolean
  onEdit: () => void
}) {
  const classNames = addIfClassNames([
    [isBetweenInclusive(remainingMs, 6000, 15000), 'EndingSoon'],
    [isBetweenInclusive(remainingMs, 1000, 5000), 'AlmostGone'],
    [isPaused, 'isPaused']
  ])

  return (
    <button className={addMaybeClassName('Timer', classNames)} onClick={onEdit}>
      {msToHumanReadable(remainingMs)}
    </button>
  )
}

function SetCountdownScreen({
  fromMs,
  setFromMs,
  onHide
}: {
  fromMs: number
  setFromMs: React.Dispatch<React.SetStateAction<number>>
  onHide: () => void
}) {
  const {hours: initialHours, minutes: initialMinutes, seconds: initialSeconds} = toClock(fromMs)

  const [hours, setHours] = useState(initialHours)
  const [minutes, setMinutes] = useState(initialMinutes)
  const [seconds, setSeconds] = useState(initialSeconds)

  function onChangeHours(e: SyntheticEvent<HTMLInputElement>) {
    setHours(toNum(e.currentTarget.value))
  }

  function onChangeMinutes(e: SyntheticEvent<HTMLInputElement>) {
    setMinutes(toNum(e.currentTarget.value))
  }

  function onChangeSeconds(e: SyntheticEvent<HTMLInputElement>) {
    setSeconds(toNum(e.currentTarget.value))
  }

  function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    const fromMs = toMs(hours, minutes, seconds)
    setFromMs(fromMs)
    onHide()
  }

  function onReset() {
    setHours(initialHours)
    setMinutes(initialMinutes)
    setSeconds(initialSeconds)
  }

  function onCancelEditing() {
    onHide()
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

function toNum(value: string) {
  const num = parseInt(value.length === 0 ? '0' : value, 10)
  return isNaN(num) ? 0 : num
}

function isBetweenInclusive(x: number, min: number, max: number) {
  return x >= min && x <= max
}

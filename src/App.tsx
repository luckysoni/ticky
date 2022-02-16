import {SyntheticEvent, useEffect, useRef, useState} from 'react'
import {Icon} from 'react-icons-kit'
// import {iosPause as pauseIcon} from 'react-icons-kit/ionicons/iosPause'
import {ic_pause_twotone as pauseIcon} from 'react-icons-kit/md/ic_pause_twotone'
// import {iosPlay as playIcon} from 'react-icons-kit/ionicons/iosPlay'
// import {play3 as playIcon} from 'react-icons-kit/icomoon/play3'
import {ic_play_arrow_twotone as playIcon} from 'react-icons-kit/md/ic_play_arrow_twotone'
import {androidRefresh as resetIcon} from 'react-icons-kit/ionicons/androidRefresh'
import {iosInfinite as arrowLoop} from 'react-icons-kit/ionicons/iosInfinite'
import {Flex} from './flex'
import {Wrapper} from './wrapper'
import {exhaustive} from './helpers/exhaustive'
import './App.css'
import {useHotkeys} from 'react-hotkeys-hook'
import {addIfClassNames, addMaybeClassName} from './helpers/classnames'
import {mkHtmlAttribute} from './helpers/dom'

export function App() {
  const [showSetCountdownScreen, setShowSetCountdownScreen] = useState(true)
  const [fromMs, setFromMs] = useState(0)
  const [resetToMs, setResetToMs] = useState(0)

  return (
    <Wrapper>
      <CountdownScreen
        fromMs={fromMs}
        setFromMs={setFromMs}
        resetToMs={resetToMs}
        setShowSetCountdownScreen={setShowSetCountdownScreen}
        showSetCountdownScreen={showSetCountdownScreen}
      />
      {showSetCountdownScreen ? (
        <SetCountdownScreen
          resetToMs={resetToMs}
          setResetToMs={setResetToMs}
          onHide={() => setShowSetCountdownScreen(false)}
          fromMs={fromMs}
          setFromMs={setFromMs}
        />
      ) : null}
    </Wrapper>
  )
}

type ScreenReaderMessagesT =
  | {tag: 'empty-countdown-cannot-be-started'}
  | {tag: 'new-countdown-set'; ms: number}
  | null

function CountdownScreen({
  fromMs,
  setFromMs,
  resetToMs,
  showSetCountdownScreen,
  setShowSetCountdownScreen
}: {
  fromMs: number
  setFromMs: React.Dispatch<React.SetStateAction<number>>
  resetToMs: number
  showSetCountdownScreen: boolean
  setShowSetCountdownScreen: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const [state, setState] = useState<'paused' | 'counting'>('paused')
  const [shouldLoop, setShouldLoop] = useState(false)
  const [toggleState, setToggleState] = useState(false)
  const [screenReaderMessageType, setScreenReaderMessageType] =
    useState<ScreenReaderMessagesT>(null)
  const isHidden = showSetCountdownScreen

  useHotkeys('s', () => setToggleState(true))
  useHotkeys('r', () => onReset())
  useHotkeys('e', () => onEdit())

  useEffect(() => {
    if (fromMs === resetToMs) {
      setScreenReaderMessageType({tag: 'new-countdown-set', ms: resetToMs})
    }
  }, [resetToMs, fromMs])

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (toggleState) {
      setState(prevState => {
        switch (prevState) {
          case 'counting':
            return 'paused'
          case 'paused':
            return fromMs > 0 ? 'counting' : 'paused'
          default:
            return exhaustive(prevState)
        }
      })
      setToggleState(false)
    }
  }, [fromMs, toggleState])

  useEffect(() => {
    if (fromMs === 0) {
      if (shouldLoop) {
        setFromMs(resetToMs)
      } else {
        setState('paused')
      }
    }
  }, [fromMs, resetToMs, setFromMs, shouldLoop])

  useEffect(() => {
    switch (state) {
      case 'counting':
        if (fromMs > 0 && (intervalRef.current === null || intervalRef.current === undefined)) {
          intervalRef.current = setInterval(() => {
            setFromMs(prevMs => prevMs - 1000)
          }, 999)
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
  }, [fromMs, setFromMs, state])

  function onEdit() {
    setState('paused')
    setShowSetCountdownScreen(true)
  }

  function onStart() {
    if (fromMs > 0) {
      setScreenReaderMessageType(null)
      setState('counting')
    } else {
      setScreenReaderMessageType({tag: 'empty-countdown-cannot-be-started'})
    }
  }

  function onPause() {
    setState('paused')
  }

  function onReset() {
    setFromMs(resetToMs)
    if (fromMs > 0) {
      setState('counting')
    }
  }

  return (
    <div style={{display: isHidden ? 'none' : 'block'}}>
      <ScreenReaderMessages screenReaderMessageType={screenReaderMessageType} />
      <Flex justifyContent="space-between" alignItems="center">
        <CountDown
          remainingMs={fromMs}
          onEdit={onEdit}
          isPaused={state === 'paused'}
          fromMs={fromMs}
        />
        <Flex flexDirection="column" className="ButtonGroup" role="button-group">
          <button
            onClick={state === 'paused' ? onStart : onPause}
            aria-label="Start"
            aria-pressed={state === 'counting'}
          >
            <Icon icon={state === 'paused' ? playIcon : pauseIcon} className="ActionButtonIcon" />
          </button>
          <button
            onClick={() => setShouldLoop(prevState => !prevState)}
            aria-label="Loop Countdown"
            aria-pressed={shouldLoop}
          >
            <Icon
              icon={arrowLoop}
              className={addMaybeClassName(
                'ActionButtonIcon',
                shouldLoop ? 'ActiveActionButtonIcon' : null
              )}
            />
          </button>
          <button onClick={onReset} aria-label="Restart">
            <Icon icon={resetIcon} className="ActionButtonIcon" />
          </button>
        </Flex>
      </Flex>
    </div>
  )
}

function ScreenReaderMessages({
  screenReaderMessageType
}: {
  screenReaderMessageType: ScreenReaderMessagesT
}) {
  const messageStr = message(screenReaderMessageType)
  const ariaLabelAttr = mkHtmlAttribute('aria-label', messageStr)
  return (
    <span role="alert" className="SrOnly" {...ariaLabelAttr}>
      {messageStr}
    </span>
  )
}

function message(screenReaderMessageType: ScreenReaderMessagesT) {
  if (screenReaderMessageType === null) {
    return null
  }

  switch (screenReaderMessageType.tag) {
    case 'empty-countdown-cannot-be-started':
      return 'Set a countdown before it can be started'
    case 'new-countdown-set':
      return `Countdown set to ${toHumanHearable(screenReaderMessageType.ms, false)}`
    default:
      return exhaustive(screenReaderMessageType)
  }
}

function CountDown({
  fromMs,
  remainingMs,
  isPaused,
  onEdit
}: {
  fromMs: number
  remainingMs: number
  isPaused: boolean
  onEdit: () => void
}) {
  const classNames = addIfClassNames([
    [isBetweenInclusive(remainingMs, 6000, 15000), 'EndingSoon'],
    [isBetweenInclusive(remainingMs, 1000, 5000), 'AlmostGone'],
    [isPaused, 'isPaused']
  ])

  /*
    Annouce the timer if:
    1. We just started. This lets the user know the starting position.
    2. Every 3 seconds. This is to ensure there is enough time for the screen reader to read.
    3. The countdown ended
    4. Countdown is paused
   */

  const shouldAnnounce =
    (remainingMs / 1000) % 3 === 0 || remainingMs === fromMs || remainingMs === 0 || isPaused

  const ariaLiveAttr = mkHtmlAttribute('aria-live', shouldAnnounce ? 'assertive' : 'off')
  const roleAttr = mkHtmlAttribute('role', shouldAnnounce ? 'alert' : null)

  return (
    <>
      <span {...roleAttr} {...ariaLiveAttr} className="SrOnly">
        {toHumanHearable(remainingMs, isPaused)}
      </span>
      <button
        className={addMaybeClassName('Timer', classNames)}
        onClick={onEdit}
        aria-label="Edit countdown"
      >
        {msToHumanReadable(remainingMs)}
      </button>
    </>
  )
}

function SetCountdownScreen({
  fromMs,
  setFromMs,
  resetToMs,
  setResetToMs,
  onHide
}: {
  fromMs: number
  setFromMs: React.Dispatch<React.SetStateAction<number>>
  resetToMs: number
  setResetToMs: React.Dispatch<React.SetStateAction<number>>
  onHide: () => void
}) {
  const {hours: initialHours, minutes: initialMinutes, seconds: initialSeconds} = toClock(resetToMs)

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
    setResetToMs(fromMs)
    setFromMs(fromMs)
    onHide()
  }

  function onReset() {
    setHours(initialHours)
    setMinutes(initialMinutes)
    setSeconds(initialSeconds)
  }

  function onCancel() {
    onHide()
  }

  return (
    <form onSubmit={onSubmit} onReset={onReset} className="EditCountdownForm">
      <Flex flexDirection="column">
        <label htmlFor="hours">Hours</label>
        <input
          id="hours"
          type="number"
          min="0"
          max="23"
          onChange={onChangeHours}
          value={hours}
          autoFocus
        />
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
      </Flex>

      <button type="submit">Ok</button>

      <button type="button" onClick={onCancel}>
        Cancel
      </button>

      <button type="reset">Reset</button>
    </form>
  )
}

export function toMs(hours: number, minutes: number, seconds: number) {
  const hMs = hours * 60 * 60 * 1000
  const mMs = minutes * 60 * 1000
  const sMs = seconds * 1000
  return hMs + mMs + sMs
}

export function msToHumanReadable(ms: number) {
  const {hours, minutes, seconds} = toClock(ms)
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

export function toHumanHearable(ms: number, isPaused: boolean) {
  const {hours, minutes, seconds} = toClock(ms)

  if (hours === 0 && minutes === 0 && seconds === 0) {
    return 'Countdown ended'
  }

  if (isPaused) {
    return 'Countdown paused'
  }

  const messages = [
    hours !== 0 ? `${hours} ${plural('hour', hours)}` : null,
    minutes !== 0 ? `${minutes} ${plural('minute', minutes)}` : null,
    seconds !== 0 ? `${seconds} ${plural('second', seconds)}` : null
  ]

  return messages.filter(msg => msg !== null).join(' ')
}

function plural(word: string, num: number) {
  return num > 1 ? `${word}s` : word
}

export function toClock(ms: number) {
  const seconds = Math.floor((ms / 1000) % 60)
  const minutes = Math.floor((ms / (1000 * 60)) % 60)
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24)
  return {hours, minutes, seconds}
}

export function pad(num: number) {
  return num < 10 ? `0${num}` : num.toString()
}

function toNum(value: string) {
  const num = parseInt(value.length === 0 ? '0' : value, 10)
  return isNaN(num) ? 0 : num
}

function isBetweenInclusive(x: number, min: number, max: number) {
  return x >= min && x <= max
}

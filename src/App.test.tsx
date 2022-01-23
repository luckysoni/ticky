import {act, render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {App, msToHumanReadable, toMs} from './App'
import {exhaustive} from './helpers/exhaustive'

describe('App', () => {
  test('renders set countdown screen on start', () => {
    render(<App />)

    expect(screen.getByRole('spinbutton', {name: /hours/i})).toHaveValue(0)
    expect(screen.getByRole('spinbutton', {name: /minutes/i})).toHaveValue(0)
    expect(screen.getByRole('spinbutton', {name: /seconds/i})).toHaveValue(0)

    expect(screen.getByRole('button', {name: /ok/i})).toBeEnabled()
    expect(screen.getByRole('button', {name: /cancel/i})).toBeEnabled()
    expect(screen.getByRole('button', {name: /reset/i})).toBeEnabled()
  })

  test('allows setting the countdown value', () => {
    render(<App />)

    const [hours, minutes, seconds] = [2, 33, 52]

    setCountdownValue(hours, minutes, seconds)

    userEvent.click(screen.getByRole('button', {name: /ok/i}))

    getCountdownWithValue({tag: 'clock', hours, minutes, seconds})
  })

  test('allows starting the countdown', () => {
    jest.useFakeTimers()

    render(<App />)

    const [hours, minutes, seconds] = [6, 9, 34]

    setCountdownValue(hours, minutes, seconds)

    userEvent.click(screen.getByRole('button', {name: /ok/i}))

    getCountdownWithValue({tag: 'clock', hours, minutes, seconds})

    startCountdown()

    advanceTimeBySeconds(1)

    getCountdownWithValue({tag: 'clock', hours, minutes, seconds: seconds - 1})

    jest.useRealTimers()
  })

  test('countdown auto stops at 00:00:00', () => {
    jest.useFakeTimers()

    render(<App />)

    const seconds = 5

    setCountdownValue(0, 0, seconds)

    userEvent.click(screen.getByRole('button', {name: /ok/i}))

    getCountdownWithValue({tag: 'seconds', seconds})

    startCountdown()

    advanceTimeBySeconds(5)

    getCountdownWithValue({tag: 'seconds', seconds: 0})

    advanceTimeBySeconds(5)

    getCountdownWithValue({tag: 'seconds', seconds: 0})

    jest.useRealTimers()
  })

  test('resets to the original countdown after editing is cancelled', () => {
    jest.useFakeTimers()

    render(<App />)

    const seconds = 9

    setCountdownValue(0, 0, seconds)

    userEvent.click(screen.getByRole('button', {name: /ok/i}))

    getCountdownWithValue({tag: 'seconds', seconds})

    startCountdown()

    advanceTimeBySeconds(1)

    userEvent.click(getCountdownWithValue({tag: 'seconds', seconds: seconds - 1}))

    userEvent.click(screen.getByRole('button', {name: /cancel/i}))

    getCountdownWithValue({tag: 'seconds', seconds: seconds - 1})

    restartCountdown()

    getCountdownWithValue({tag: 'seconds', seconds})

    jest.useRealTimers()
  })
})

function setCountdownValue(numHours: number, numMinutes: number, numSeconds: number) {
  userEvent.type(screen.getByRole('spinbutton', {name: /hours/i}), numHours.toString())
  userEvent.type(screen.getByRole('spinbutton', {name: /minutes/i}), numMinutes.toString())
  userEvent.type(screen.getByRole('spinbutton', {name: /seconds/i}), numSeconds.toString())
}

function startCountdown() {
  userEvent.click(screen.getByRole('button', {name: /^start$/i}))
}

function restartCountdown() {
  userEvent.click(screen.getByRole('button', {name: /restart/i}))
}

function getCountdownWithValue(
  config:
    | {tag: 'seconds'; seconds: number}
    | {tag: 'ms'; ms: number}
    | {tag: 'clock'; hours: number; minutes: number; seconds: number}
) {
  const ms = (() => {
    switch (config.tag) {
      case 'clock':
        return toMs(config.hours, config.minutes, config.seconds)
      case 'seconds':
        return config.seconds * 1000
      case 'ms':
        return config.ms
      default:
        return exhaustive(config)
    }
  })()

  return screen.getByRole('button', {name: msToHumanReadable(ms)})
}

function advanceTimeBySeconds(seconds: number) {
  act(() => {
    jest.advanceTimersByTime(seconds * 1000)
  })
}

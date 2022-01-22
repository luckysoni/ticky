import {act, render, screen, Screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {App} from './App'

jest.mock('./initial-ms.ts', () => ({
  INITIAL_MS: 0
}))

describe('App', () => {
  test('renders set countdown screen', () => {
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

    setCountdownValue(screen, '2', '33', '52')

    userEvent.click(screen.getByRole('button', {name: /ok/i}))

    screen.getByRole('button', {name: /02:33:52/i})
  })

  test('allows starting the countdown', () => {
    jest.useFakeTimers()

    render(<App />)

    setCountdownValue(screen, '6', '09', '34')

    userEvent.click(screen.getByRole('button', {name: /ok/i}))

    screen.getByRole('button', {name: /06:09:34/i})

    userEvent.click(screen.getByRole('button', {name: /start/i}))

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    screen.getByRole('button', {name: /06:09:33/i})

    jest.useRealTimers()
  })

  test('countdown auto stops at 00:00:00', () => {
    jest.useFakeTimers()

    render(<App />)

    setCountdownValue(screen, '0', '0', '5')

    userEvent.click(screen.getByRole('button', {name: /ok/i}))

    screen.getByRole('button', {name: /00:00:05/i})

    userEvent.click(screen.getByRole('button', {name: /start/i}))

    act(() => {
      jest.advanceTimersByTime(5000)
    })

    screen.getByRole('button', {name: /00:00:00/i})

    act(() => {
      jest.advanceTimersByTime(5000)
    })

    screen.getByRole('button', {name: /00:00:00/i})

    jest.useRealTimers()
  })

  test.skip('resets to the original countdown after editing is cancelled', () => {
    jest.useFakeTimers()

    render(<App />)

    const ORIGINAL_COUNTDOWN_SECONDS = '9'

    setCountdownValue(screen, '0', '0', ORIGINAL_COUNTDOWN_SECONDS)

    userEvent.click(screen.getByRole('button', {name: /ok/i}))

    screen.getByRole('button', {name: /00:00:09/i})

    userEvent.click(screen.getByRole('button', {name: /start/i}))

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    userEvent.click(screen.getByRole('button', {name: /00:00:08/i}))

    userEvent.click(screen.getByRole('button', {name: /cancel/i}))

    screen.getByRole('button', {name: /00:00:08/i})

    screen.getByRole('button', {name: /reset/i})

    // Fix bug in Countdown, it loses original countdown value when editing is cancelled
    screen.getByRole('button', {name: /00:00:09/i})

    jest.useRealTimers()
  })
})

function setCountdownValue(
  screen: Screen,
  hoursStr: string,
  minutesStr: string,
  secondsStr: string
) {
  userEvent.type(screen.getByRole('spinbutton', {name: /hours/i}), hoursStr)
  userEvent.type(screen.getByRole('spinbutton', {name: /minutes/i}), minutesStr)
  userEvent.type(screen.getByRole('spinbutton', {name: /seconds/i}), secondsStr)
}

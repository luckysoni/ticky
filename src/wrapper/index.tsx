import {iosClockOutline} from 'react-icons-kit/ionicons/iosClockOutline'
import {iosClock} from 'react-icons-kit/ionicons/iosClock'
import {Icon} from 'react-icons-kit'
import {arrowMove} from 'react-icons-kit/ionicons/arrowMove'
import {ReactNode} from 'react'
import {Flex} from '../flex'
import './wrapper.css'

export function Wrapper({children}: {children: ReactNode}) {
  return (
    <div className="App">
      <div className="DragAnchor">
        <Flex alignItems="center">
          <Icon icon={iosClock} className="AppIcon" />{' '}
          <h1 className="AppTitle">Time Keeper</h1>
        </Flex>
        <Icon icon={arrowMove} />
      </div>
      {children}
    </div>
  )
}

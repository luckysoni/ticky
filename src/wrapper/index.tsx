import {ReactNode} from 'react'
import {Icon} from 'react-icons-kit'
import {ic_access_time_twotone as clockIcon} from 'react-icons-kit/md/ic_access_time_twotone'
import {ic_drag_indicator_twotone as moveIcon} from 'react-icons-kit/md/ic_drag_indicator_twotone'
import {Flex} from '../flex'
import './wrapper.css'

export function Wrapper({children}: {children: ReactNode}) {
  return (
    <div className="App">
      <div className="DragAnchor">
        <Flex alignItems="center">
          <Icon icon={clockIcon} className="AppIcon" aria-hidden="true" />
          <h1 className="AppTitle">Ticky</h1>
        </Flex>
        <Icon icon={moveIcon} title="Move window" />
      </div>
      {children}
    </div>
  )
}

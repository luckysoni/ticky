/* @flow */

import {ReactNode, CSSProperties} from 'react'
import {mkHtmlAttribute} from '../helpers/dom'

type JustifyContentT =
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'space-between'
  | 'space-around'
  | 'space-evenly'
  | 'initial'
  | 'inherit'

type FlexWrapT = 'wrap' | 'nowrap' | 'wrap-reverse'

type AlignItemsT =
  | 'stretch'
  | 'center'
  | 'flex-start'
  | 'flex-end'
  | 'baseline'
  | 'initial'
  | 'inherit'

export type FlexDirectionT = 'row' | 'column'

type StyleProps = {
  flexDirection?: FlexDirectionT | null
  justifyContent?: JustifyContentT | null
  flexWrap?: FlexWrapT | null
  alignItems?: AlignItemsT | null
  flex?: string
}

type Props = {
  children?: ReactNode
  className?: string
  role?: string
} & StyleProps

export function Flex(props: Props) {
  const {className, justifyContent, flexDirection, flexWrap, alignItems, flex, role} =
    props

  const styles = buildStyles({
    display: 'flex',
    justifyContent,
    flexDirection,
    flexWrap,
    alignItems,
    flex
  })

  return (
    <div className={className} style={styles as CSSProperties} {...mkHtmlAttribute('role', role)}>
      {props.children}
    </div>
  )
}

type StylePropKeys = keyof StyleProps | 'display'

function buildStyles(stylesObj: {
  [K in StylePropKeys]: string | null | undefined
}) {
  const keys = Object.keys(stylesObj) as StylePropKeys[]
  return keys.reduce(
    (styles, styleKey) => {
      const value = stylesObj[styleKey]
      if (value !== null && value !== undefined) {
        styles[styleKey] = value
      }
      return styles
    },
    {} as Partial<{
      [K in StylePropKeys]: string
    }>
  )
}

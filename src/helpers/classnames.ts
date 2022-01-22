export function addMaybeClassName(baseClassName: string, maybeClass: string | null) {
  return maybeClass !== null ? `${baseClassName} ${maybeClass}` : baseClassName
}

export function addIfClassNames(pairs: Array<[boolean | null, string | null]>) {
  const maybeClassNames = pairs.map(([shouldAdd, className]) =>
    shouldAdd === true ? className : null
  )
  const classNames = maybeClassNames.filter(c => c !== null)
  return classNames.length > 0 ? classNames.join(' ') : null
}

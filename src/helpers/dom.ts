export function mkHtmlAttribute(key: string, value?: string | null) {
  if (value === null || value === undefined) {
    return {}
  }

  return {[key]: value}
}

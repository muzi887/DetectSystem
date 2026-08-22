export function factorsFromAlert(
  message: string,
  prediction?: { factors?: string[] }
): string[] {
  const fromPred = (prediction?.factors || [])
    .map((item) => String(item).trim())
    .filter(Boolean)
  if (fromPred.length) return fromPred

  const match = String(message).match(/（([^）]+)）/)
  if (!match) return []
  return match[1]
    .split('；')
    .map((item) => item.trim())
    .filter(Boolean)
}

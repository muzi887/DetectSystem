export function mapRuleLevel(level: 'hint' | 'alert'): 'warning' | 'high' {
  return level === 'hint' ? 'warning' : 'high'
}

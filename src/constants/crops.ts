export const BJJ_CROP_OPTIONS = [
  { value: 'wheat', label: '小麦' },
  { value: 'corn', label: '玉米' },
  { value: 'tomato', label: '番茄' },
  { value: 'rice', label: '水稻' }
] as const

export type BjjCropType = (typeof BJJ_CROP_OPTIONS)[number]['value']

export const BJJ_CROP_LABELS: Record<BjjCropType, string> = {
  wheat: '小麦',
  corn: '玉米',
  tomato: '番茄',
  rice: '水稻'
}

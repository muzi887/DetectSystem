import type { ThresholdProfile } from '../types/rules.ts'

export type CropOption = '小麦' | '玉米' | '水稻'
export type StageOption = '拔节' | '抽穗' | '灌浆' | '成熟'

export const CROP_OPTIONS: CropOption[] = ['小麦', '玉米', '水稻']
export const STAGE_OPTIONS: StageOption[] = ['拔节', '抽穗', '灌浆', '成熟']

export type ThresholdBands = Pick<
  ThresholdProfile,
  'waterStressHint' | 'waterStressAlert' | 'heatHint' | 'heatAlert'
>

const WHEAT_JOINTING: ThresholdBands = {
  waterStressHint: 25,
  waterStressAlert: 15,
  heatHint: 32,
  heatAlert: 38
}

const TABLE: Partial<Record<CropOption, Partial<Record<StageOption, ThresholdBands>>>> = {
  小麦: {
    拔节: WHEAT_JOINTING,
    灌浆: {
      waterStressHint: 28,
      waterStressAlert: 18,
      heatHint: 30,
      heatAlert: 36
    }
  },
  玉米: {
    抽穗: {
      waterStressHint: 22,
      waterStressAlert: 14,
      heatHint: 34,
      heatAlert: 40
    },
    成熟: {
      waterStressHint: 20,
      waterStressAlert: 12,
      heatHint: 34,
      heatAlert: 40
    }
  },
  水稻: {
    拔节: {
      waterStressHint: 35,
      waterStressAlert: 25,
      heatHint: 32,
      heatAlert: 38
    },
    灌浆: {
      waterStressHint: 40,
      waterStressAlert: 30,
      heatHint: 32,
      heatAlert: 38
    }
  }
}

function asCrop(crop: string): CropOption {
  if (crop === '玉米' || crop === '水稻' || crop === '小麦') return crop
  return '小麦'
}

function asStage(stage: string): StageOption {
  if (stage === '抽穗' || stage === '灌浆' || stage === '成熟' || stage === '拔节') return stage
  return '拔节'
}

export function presetFor(crop: string, stage: string): ThresholdBands {
  const c = asCrop(crop)
  const s = asStage(stage)
  return TABLE[c]?.[s] ?? TABLE[c]?.['拔节'] ?? WHEAT_JOINTING
}

export function bandsOf(
  row: Pick<ThresholdProfile, 'waterStressHint' | 'waterStressAlert' | 'heatHint' | 'heatAlert'>
): ThresholdBands {
  return {
    waterStressHint: row.waterStressHint,
    waterStressAlert: row.waterStressAlert,
    heatHint: row.heatHint,
    heatAlert: row.heatAlert
  }
}

export function sameBands(a: ThresholdBands, b: ThresholdBands): boolean {
  return (
    a.waterStressHint === b.waterStressHint &&
    a.waterStressAlert === b.waterStressAlert &&
    a.heatHint === b.heatHint &&
    a.heatAlert === b.heatAlert
  )
}

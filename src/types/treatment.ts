export interface TreatmentMeasures {
  chemical?: string[]
  biological?: string[]
  agronomic?: string[]
}

export interface TreatmentItem {
  crop: string
  crop_en?: string
  aliases?: string[]
  summary: string
  risk_level?: 'low' | 'medium' | 'high'
  symptoms?: string[]
  measures: TreatmentMeasures
  timing?: string
  safety?: string
  references?: string[]
}

export interface TreatmentCatalog {
  version: string
  region: string
  updated_at: string
  disclaimer: string
  items: Record<string, TreatmentItem>
}

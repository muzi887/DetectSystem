import http from '@/utils/http'
import type { Field, MoistureLayer, NdviLayer } from '@/types/remoteSensing'

export function fetchFields() {
  return http.get<Field[]>('/fields')
}

export function fetchNdviLayers() {
  return http.get<NdviLayer[]>('/ndviLayers')
}

export function fetchMoistureLayers() {
  return http.get<MoistureLayer[]>('/moistureLayers')
}

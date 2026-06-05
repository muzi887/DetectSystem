import http from '@/utils/http'
import type { Field, MoistureLayer, MoistureQueryResult, NdviLayer } from '@/types/remoteSensing'

export function fetchFields() {
  return http.get<Field[]>('/fields')
}

export function fetchNdviLayers() {
  return http.get<NdviLayer[]>('/ndviLayers')
}

export function fetchMoistureLayers() {
  return http.get<MoistureLayer[]>('/moistureLayers')
}

export function queryMoistureValue(lat: number, lng: number) {
  return http.get<MoistureQueryResult>('/moisture/value', { params: { lat, lng } })
}

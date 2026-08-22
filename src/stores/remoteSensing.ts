import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  fetchFields,
  fetchMoistureLayers,
  fetchNdviLayers
} from '@/api/remoteSensing'
import { resolveImageAsset } from '@/constants/remoteSensingLayers'
import { fetchDroneMissions, fetchPestPredictions } from '@/api/rules'

function latestDate(dates: string[]) {
  return [...dates].sort((a, b) => b.localeCompare(a))[0] ?? ''
}

function toRasterView(layer: {
  imageAsset: string
  bounds: NdviLayer['bounds']
  date: string
  source: string
}): RasterLayerView {
  return {
    imageUrl: resolveImageAsset(layer.imageAsset),
    bounds: layer.bounds,
    date: layer.date,
    source: layer.source
  }
}

export const useRemoteSensingStore = defineStore('remoteSensing', () => {
  const fields = ref<Field[]>([])
  const ndviLayers = ref<NdviLayer[]>([])
  const moistureLayers = ref<MoistureLayer[]>([])
  const pestPredictions = ref<
    Array<{ fieldId: string; riskLevel: string; factors?: string[] }>
  >([])
  const droneMissions = ref<
    Array<{ id: number; fieldId: string; name: string; path: [number, number][] }>
  >([])
  const selectedFieldId = ref('')
  const selectedNdviDate = ref('')
  const selectedMoistureDate = ref('')
  const compareEnabled = ref(false)
  const compareNdviDate = ref('')
  const compareOpacity = ref(0.5)
  const loading = ref(false)
  const loadError = ref<string | null>(null)

  const layersForField = computed(() =>
    ndviLayers.value.filter((l) => l.fieldId === selectedFieldId.value)
  )

  const compareDatesForField = computed(() =>
    layersForField.value
      .map((l) => l.date)
      .filter((date) => date !== selectedNdviDate.value)
  )

  const canCompareNdvi = computed(() => compareDatesForField.value.length > 0)

  const currentNdviLayer = computed(
    () =>
      layersForField.value.find((l) => l.date === selectedNdviDate.value) ??
      layersForField.value[0] ??
      null
  )

  const currentMoistureLayer = computed(
    () =>
      moistureLayers.value.find((l) => l.date === selectedMoistureDate.value) ??
      moistureLayers.value[0] ??
      null
  )

  const currentNdviRaster = computed(() =>
    currentNdviLayer.value ? toRasterView(currentNdviLayer.value) : null
  )

  const currentMoistureRaster = computed(() =>
    currentMoistureLayer.value ? toRasterView(currentMoistureLayer.value) : null
  )

  const selectedFieldHighRisk = computed(() =>
    pestPredictions.value.some(
      (row) => row.fieldId === selectedFieldId.value && row.riskLevel === 'high'
    )
  )

  const currentDronePath = computed(() => {
    const mission = droneMissions.value.find((row) => row.fieldId === selectedFieldId.value)
    return mission?.path?.length ? mission.path : null
  })

  const compareNdviLayer = computed(() =>
    compareEnabled.value && compareNdviDate.value
      ? layersForField.value.find((l) => l.date === compareNdviDate.value) ?? null
      : null
  )

  const compareNdviRaster = computed(() =>
    compareNdviLayer.value ? toRasterView(compareNdviLayer.value) : null
  )

  function resetCompare() {
    compareEnabled.value = false
    compareNdviDate.value = ''
  }

  function syncCompareDateForField() {
    const options = compareDatesForField.value
    if (options.length === 0) {
      resetCompare()
      return
    }
    if (!options.includes(compareNdviDate.value)) {
      compareNdviDate.value = latestDate(options)
    }
  }

  function setCompareEnabled(enabled: boolean) {
    if (enabled && !canCompareNdvi.value) return
    compareEnabled.value = enabled
    if (!enabled) {
      compareNdviDate.value = ''
      return
    }
    syncCompareDateForField()
  }

  function syncNdviDateForField() {
    const ndviDates = layersForField.value.map((l) => l.date)
    if (ndviDates.length) {
      const hasDate = ndviDates.includes(selectedNdviDate.value)
      if (!hasDate) selectedNdviDate.value = latestDate(ndviDates)
    } else {
      selectedNdviDate.value = ''
    }
  }

  function selectField(fieldId: string) {
    selectedFieldId.value = fieldId
    resetCompare()
    syncNdviDateForField()
  }

  function onNdviDateChange() {
    if (compareEnabled.value) syncCompareDateForField()
  }

  function initSelection() {
    if (fields.value.length) {
      const hasField = fields.value.some((f) => f.id === selectedFieldId.value)
      if (!hasField) selectedFieldId.value = fields.value[0]?.id ?? ''
    }

    syncNdviDateForField()

    if (!canCompareNdvi.value) {
      resetCompare()
    } else if (compareEnabled.value) {
      syncCompareDateForField()
    }

    const moistureDates = moistureLayers.value.map((l) => l.date)
    if (moistureDates.length) {
      const hasDate = moistureDates.includes(selectedMoistureDate.value)
      if (!hasDate) selectedMoistureDate.value = latestDate(moistureDates)
    }
  }

  async function fetchAll() {
    loading.value = true
    loadError.value = null
    try {
      const [fieldsRes, ndviRes, moistureRes] = await Promise.all([
        fetchFields(),
        fetchNdviLayers(),
        fetchMoistureLayers()
      ])
      fields.value = fieldsRes.data ?? []
      ndviLayers.value = ndviRes.data ?? []
      moistureLayers.value = moistureRes.data ?? []
      try {
        const pestRes = await fetchPestPredictions()
        pestPredictions.value = pestRes.data ?? []
      } catch {
        pestPredictions.value = []
      }
      try {
        const missionRes = await fetchDroneMissions()
        droneMissions.value = missionRes.data ?? []
      } catch {
        droneMissions.value = []
      }
      initSelection()
    } catch (err: unknown) {
      loadError.value = err instanceof Error ? err.message : '遥感数据加载失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    fields,
    ndviLayers,
    moistureLayers,
    pestPredictions,
    droneMissions,
    selectedFieldId,
    selectedNdviDate,
    selectedMoistureDate,
    compareEnabled,
    compareNdviDate,
    compareOpacity,
    loading,
    loadError,
    layersForField,
    compareDatesForField,
    canCompareNdvi,
    currentNdviLayer,
    currentMoistureLayer,
    currentNdviRaster,
    currentMoistureRaster,
    compareNdviLayer,
    compareNdviRaster,
    selectedFieldHighRisk,
    currentDronePath,
    fetchAll,
    initSelection,
    selectField,
    syncNdviDateForField,
    setCompareEnabled,
    onNdviDateChange,
    resetCompare
  }
})

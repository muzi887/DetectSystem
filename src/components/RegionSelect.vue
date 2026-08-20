<template>
  <div class="region-select">
    <span class="region-select-label">监测区域</span>
    <a-select
      v-model:value="selectedRegion"
      class="region-select-control"
      popup-class-name="region-select-dropdown"
      :options="regionOptions" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDataStore } from '@/stores/data'
import { MONITOR_REGIONS, type MonitorRegionId } from '@/constants/monitorRegions'

const dataStore = useDataStore()

const regionOptions = computed(() =>
  MONITOR_REGIONS.map((region) => ({
    value: region.id,
    label: region.label
  }))
)

const selectedRegion = computed({
  get: () => dataStore.selectedRegion,
  set: (value: MonitorRegionId) => dataStore.setSelectedRegion(value)
})
</script>

<style scoped>
.region-select {
  display: flex;
  align-items: center;
  gap: 8px;
}

.region-select-label {
  color: rgb(255 255 255 / 75%);
  font-size: 13px;
  white-space: nowrap;
}

.region-select-control {
  min-width: 120px;
}

.region-select-control :deep(.ant-select-selector) {
  background: rgb(0 0 0 / 25%) !important;
  border-color: rgb(255 255 255 / 25%) !important;
  color: #fff !important;
}

.region-select-control :deep(.ant-select-selection-item),
.region-select-control :deep(.ant-select-arrow) {
  color: #fff !important;
}

@media (width <= 768px) {
  .region-select-label {
    display: none;
  }

  .region-select-control {
    min-width: 100px;
  }
}
</style>

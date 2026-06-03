<template>
  <div
    v-if="fields.length"
    class="ndvi-layer-controls"
    role="toolbar"
    aria-label="NDVI 图层筛选">
    <div class="control-group">
      <span class="control-label">地块</span>
      <a-select
        v-model:value="selectedFieldId"
        class="control-select"
        popup-class-name="ndvi-layer-select-dropdown"
        :options="fieldOptions"
        @change="onFieldChange" />
    </div>
    <div class="control-group">
      <span class="control-label">影像日期</span>
      <a-select
        v-model:value="selectedNdviDate"
        class="control-select"
        popup-class-name="ndvi-layer-select-dropdown"
        :disabled="dateOptions.length === 0"
        :options="dateOptions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRemoteSensingStore } from '@/stores/remoteSensing'

const store = useRemoteSensingStore()
const { fields, selectedFieldId, selectedNdviDate, layersForField } = storeToRefs(store)

const fieldOptions = computed(() =>
  fields.value.map((f) => ({ value: f.id, label: f.name }))
)

const dateOptions = computed(() =>
  [...layersForField.value]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((l) => ({ value: l.date, label: l.date }))
)

function onFieldChange(fieldId: string) {
  store.selectField(fieldId)
}
</script>

<style scoped>
.ndvi-layer-controls {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 3;
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
  padding: 10px 14px;
  border-radius: 8px;
  background: rgb(0 0 0 / 55%);
  border: 1px solid rgb(255 255 255 / 15%);
  backdrop-filter: blur(8px);
  pointer-events: auto;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-label {
  font-size: 12px;
  color: var(--glass-text-secondary);
  white-space: nowrap;
}

.control-select {
  min-width: 140px;
}

.control-select :deep(.ant-select-selector) {
  background: rgb(255 255 255 / 12%) !important;
  border-color: rgb(255 255 255 / 25%) !important;
  color: #fff !important;
}

.control-select :deep(.ant-select-arrow) {
  color: rgb(255 255 255 / 65%);
}
</style>

<style>
.ndvi-layer-select-dropdown .ant-select-item {
  color: #1a2a1a;
}
</style>

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
      <a-tag
        v-if="selectedFieldHighRisk"
        color="red">
        虫情高风险
      </a-tag>
    </div>
    <div class="control-group">
      <span class="control-label">影像日期</span>
      <a-select
        v-model:value="selectedNdviDate"
        class="control-select"
        popup-class-name="ndvi-layer-select-dropdown"
        :disabled="dateOptions.length === 0"
        :options="dateOptions"
        @change="onNdviDateChange" />
    </div>
    <div class="control-group">
      <span class="control-label">对比历史</span>
      <a-tooltip
        v-if="!canCompareNdvi"
        title="当前地块仅一期影像">
        <a-switch
          :checked="compareEnabled"
          disabled
          size="small" />
      </a-tooltip>
      <a-switch
        v-else
        :checked="compareEnabled"
        size="small"
        @change="onCompareToggle" />
    </div>
    <template v-if="compareEnabled">
      <div class="control-group">
        <span class="control-label">对比日期</span>
        <a-select
          v-model:value="compareNdviDate"
          class="control-select"
          popup-class-name="ndvi-layer-select-dropdown"
          :disabled="compareDateOptions.length === 0"
          :options="compareDateOptions" />
      </div>
      <div class="control-group control-group--slider">
        <span class="control-label">历史透明度</span>
        <a-slider
          v-model:value="compareOpacity"
          class="control-slider"
          :min="0.2"
          :max="0.8"
          :step="0.05"
          :tooltip-formatter="formatOpacity" />
        <span class="opacity-value">{{ formatOpacity(compareOpacity) }}</span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRemoteSensingStore } from '@/stores/remoteSensing'

const store = useRemoteSensingStore()
const {
  fields,
  selectedFieldId,
  selectedNdviDate,
  compareEnabled,
  compareNdviDate,
  compareOpacity,
  layersForField,
  compareDatesForField,
  canCompareNdvi,
  selectedFieldHighRisk
} = storeToRefs(store)

const fieldOptions = computed(() =>
  fields.value.map((f) => ({ value: f.id, label: f.name }))
)

const dateOptions = computed(() =>
  [...layersForField.value]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((l) => ({ value: l.date, label: l.date }))
)

const compareDateOptions = computed(() =>
  [...compareDatesForField.value]
    .sort((a, b) => b.localeCompare(a))
    .map((date) => ({ value: date, label: date }))
)

function formatOpacity(value?: number) {
  return `${Math.round((value ?? compareOpacity.value) * 100)}%`
}

function onFieldChange(fieldId: string) {
  store.selectField(fieldId)
}

function onNdviDateChange() {
  store.onNdviDateChange()
}

function onCompareToggle(checked: boolean | string | number) {
  store.setCompareEnabled(Boolean(checked))
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

.control-group--slider {
  min-width: 220px;
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

.control-slider {
  flex: 1;
  min-width: 100px;
  margin: 0;
}

.control-slider :deep(.ant-slider-rail) {
  background: rgb(255 255 255 / 20%);
}

.control-slider :deep(.ant-slider-track) {
  background: rgb(120 200 120 / 85%);
}

.control-slider :deep(.ant-slider-handle::after) {
  box-shadow: 0 0 0 2px rgb(120 200 120 / 90%);
}

.opacity-value {
  min-width: 36px;
  font-size: 12px;
  color: #fff;
  text-align: right;
}
</style>

<style>
.ndvi-layer-select-dropdown .ant-select-item {
  color: #1a2a1a;
}
</style>

<template>
  <div class="treatment-guide">
    <div class="treatment-header">
      <h4 class="treatment-title">防治建议</h4>
      <a-tag
        v-if="riskLabel"
        :color="riskColor">
        {{ riskLabel }}
      </a-tag>
    </div>

    <p class="treatment-summary">{{ item.summary }}</p>

    <div
      v-if="item.symptoms?.length"
      class="treatment-section">
      <h5 class="section-label">典型症状</h5>
      <ul class="treatment-list">
        <li
          v-for="(symptom, index) in item.symptoms"
          :key="`symptom-${index}`">
          {{ symptom }}
        </li>
      </ul>
    </div>

    <div
      v-if="item.measures.chemical?.length"
      class="treatment-section">
      <h5 class="section-label">化学防治</h5>
      <ul class="treatment-list">
        <li
          v-for="(measure, index) in item.measures.chemical"
          :key="`chemical-${index}`">
          {{ measure }}
        </li>
      </ul>
    </div>

    <div
      v-if="item.measures.biological?.length"
      class="treatment-section">
      <h5 class="section-label">生物防治</h5>
      <ul class="treatment-list">
        <li
          v-for="(measure, index) in item.measures.biological"
          :key="`biological-${index}`">
          {{ measure }}
        </li>
      </ul>
    </div>

    <div
      v-if="item.measures.agronomic?.length"
      class="treatment-section">
      <h5 class="section-label">农艺措施</h5>
      <ul class="treatment-list">
        <li
          v-for="(measure, index) in item.measures.agronomic"
          :key="`agronomic-${index}`">
          {{ measure }}
        </li>
      </ul>
    </div>

    <div
      v-if="item.timing"
      class="treatment-meta">
      <span class="meta-label">防治适期</span>
      <p>{{ item.timing }}</p>
    </div>

    <div
      v-if="item.safety"
      class="treatment-meta">
      <span class="meta-label">安全提示</span>
      <p>{{ item.safety }}</p>
    </div>

    <p
      v-if="manualReview"
      class="treatment-review-hint">
      置信度偏低，建议人工复核后再用药；以下仅供辅助参考。
    </p>

    <p class="treatment-disclaimer">{{ disclaimer }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TreatmentItem } from '@/types/treatment'

const props = defineProps<{
  item: TreatmentItem
  disclaimer: string
  manualReview?: boolean
}>()

const riskLabel = computed(() => {
  const map: Record<string, string> = {
    low: '低风险',
    medium: '中风险',
    high: '高风险'
  }
  return props.item.risk_level ? map[props.item.risk_level] : ''
})

const riskColor = computed(() => {
  const map: Record<string, string> = {
    low: 'success',
    medium: 'warning',
    high: 'error'
  }
  return props.item.risk_level ? map[props.item.risk_level] : 'default'
})
</script>

<style scoped>
.treatment-guide {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px dashed var(--glass-border);
}

.treatment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.treatment-title {
  margin: 0;
  font-size: 16px;
  color: var(--light-green);
  font-weight: 600;
}

.treatment-summary {
  margin: 0 0 16px;
  font-size: 14px;
  line-height: 1.7;
  color: var(--glass-text-primary);
}

.treatment-section {
  margin-bottom: 14px;
}

.section-label {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--glass-text-secondary);
}

.treatment-list {
  margin: 0;
  padding-left: 20px;
  color: var(--glass-text-secondary);
  font-size: 13px;
  line-height: 1.7;
}

.treatment-meta {
  margin-bottom: 12px;
}

.meta-label {
  display: block;
  margin-bottom: 4px;
  font-size: 13px;
  font-weight: 600;
  color: var(--glass-text-secondary);
}

.treatment-meta p {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--glass-text-secondary);
}

.treatment-review-hint {
  margin: 0 0 12px;
  font-size: 13px;
  color: #faad14;
}

.treatment-disclaimer {
  margin: 16px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--glass-text-muted);
}
</style>

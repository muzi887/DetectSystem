import { onMounted, onUnmounted } from 'vue'
import { useDataStore } from '@/stores/data'
import { evaluateAllAlerts } from '@/api/rules'

export function useAlertEngine() {
  const dataStore = useDataStore()
  let timer: ReturnType<typeof setInterval> | undefined

  onMounted(() => {
    timer = setInterval(() => {
      void dataStore.fetchAlerts()
    }, 30_000)
  })

  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  async function triggerEvaluateAll() {
    await evaluateAllAlerts()
    await dataStore.fetchAlerts()
  }

  return { triggerEvaluateAll }
}

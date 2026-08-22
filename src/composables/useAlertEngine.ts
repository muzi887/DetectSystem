import { onMounted, onUnmounted, ref } from 'vue'
import { useDataStore } from '@/stores/data'
import { evaluateAllAlerts, fetchNotifications } from '@/api/rules'

export type SiteNotification = {
  id: number
  title: string
  read: boolean
  alertId: number
  createdAt: string
}

export function useAlertEngine() {
  const dataStore = useDataStore()
  const notifications = ref<SiteNotification[]>([])
  let timer: ReturnType<typeof setInterval> | undefined

  async function loadNotifications() {
    try {
      const res = await fetchNotifications()
      notifications.value = res.data || []
    } catch {
      notifications.value = []
    }
  }

  async function refresh() {
    await dataStore.fetchAlerts()
    await loadNotifications()
  }

  onMounted(() => {
    void loadNotifications()
    timer = setInterval(() => {
      void refresh()
    }, 30_000)
  })

  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  async function triggerEvaluateAll() {
    await evaluateAllAlerts()
    await refresh()
  }

  return { triggerEvaluateAll, notifications, loadNotifications, refresh }
}

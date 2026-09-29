export const STATIC_DEMO_USER = {
  id: 1,
  name: '演示农技员',
  phone: '13800000000',
  role: 'agronomist' as const
}

export function seedStaticDemoSession(
  prod: boolean,
  storage: { getItem(key: string): string | null; setItem(key: string, value: string): void }
) {
  if (!prod) return
  if (!storage.getItem('token')) {
    storage.setItem('token', 'demo-static')
    storage.setItem('userInfo', JSON.stringify(STATIC_DEMO_USER))
  }
}

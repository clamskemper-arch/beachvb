import type { PiniaPluginContext } from 'pinia'

export function persistPlugin({ store }: PiniaPluginContext) {
  const key = `beachvb:${store.$id}`
  try {
    const saved = localStorage.getItem(key)
    if (saved) {
      store.$patch(JSON.parse(saved))
    }
  } catch {
    // ignore parse errors
  }
  store.$subscribe((_mutation, state) => {
    try {
      localStorage.setItem(key, JSON.stringify(state))
    } catch {
      // ignore quota errors
    }
  })
}

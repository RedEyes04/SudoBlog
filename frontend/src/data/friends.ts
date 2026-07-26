import { ref } from 'vue'
import type { Friend } from '../types'

/** Reactive list of approved friends loaded from API */
export const friends = ref<Friend[]>([])

export async function loadFriends(): Promise<void> {
  try {
    const res = await fetch('/api/friends')
    if (!res.ok) return
    const data: any[] = await res.json()
    friends.value = data.map((item) => ({
      id: item.id,
      name: item.name,
      avatar: item.avatar || '',
      description: item.description || '',
      url: item.url || '',
      thumbnail: item.thumbnail || '',
      status: item.status as 'pending' | 'approved' | 'rejected',
    }))
  } catch {
    // API unavailable — leave friends empty
  }
}

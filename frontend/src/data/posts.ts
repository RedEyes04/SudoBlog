import { ref } from 'vue'
import type { Post } from '../types'

/** Reactive list of posts (without full content) loaded from API */
export const posts = ref<Post[]>([])

export async function loadPosts(): Promise<void> {
  try {
    const res = await fetch('/api/posts')
    if (!res.ok) return
    const data: any[] = await res.json()
    posts.value = data
      .filter((item) => item.status === 'publish')
      .map((item) => ({
        slug: item.id || '',
        title: item.title || 'Untitled',
        subtitle: item.subtitle || '',
        summary: item.summary || '',
        date: item.date || '',
        content: '',
        tags: item.tags || [],
        cover: item.cover || '',
        status: (item.status === 'publish' ? 'publish' : 'draft') as 'publish' | 'draft',
        pinned: item.pinned === true || item.pinned === 'true',
      }))
      .sort((a, b) => {
        if (a.pinned && !b.pinned) return -1
        if (!a.pinned && b.pinned) return 1
        return b.date.localeCompare(a.date)
      })
  } catch {
    // API unavailable — leave posts empty
  }
}

/** Fetch a single post with full content */
export async function loadPost(slug: string): Promise<Post | null> {
  try {
    const res = await fetch(`/api/posts/${slug}`)
    if (!res.ok) return null
    const item = await res.json()
    return {
      slug: item.id || slug,
      title: item.title || 'Untitled',
      subtitle: item.meta?.subtitle || '',
      summary: item.meta?.summary || '',
      date: item.meta?.date || '',
      content: item.content || '',
      tags: item.meta?.tags || [],
      cover: item.meta?.cover || '',
      status: (item.meta?.status === 'publish' ? 'publish' : 'draft') as 'publish' | 'draft',
      pinned: item.meta?.pinned === true || item.meta?.pinned === 'true',
    }
  } catch {
    return null
  }
}

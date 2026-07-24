import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../api'

export interface PostSummary {
  id: string
  title: string
  date: string
  subtitle?: string
  summary?: string
  tags?: string[]
  cover?: string
  status: 'publish' | 'draft'
}

export interface PostDetail extends PostSummary {
  content: string
  meta: {
    date: string
    subtitle: string
    summary: string
    tags: string[]
    cover: string
    status: 'publish' | 'draft'
  }
}

export const usePostsStore = defineStore('posts', () => {
  const posts = ref<PostSummary[]>([])
  const currentPost = ref<PostDetail | null>(null)
  const loading = ref(false)

  const publishedPosts = computed(() => posts.value.filter((p) => p.status === 'publish'))
  const draftPosts = computed(() => posts.value.filter((p) => p.status === 'draft'))

  async function fetchPosts() {
    loading.value = true
    try {
      const { data } = await api.get('/posts')
      posts.value = data
    } finally {
      loading.value = false
    }
  }

  async function fetchPost(id: string) {
    loading.value = true
    try {
      const { data } = await api.get(`/posts/${id}`)
      currentPost.value = data
      return data
    } finally {
      loading.value = false
    }
  }

  async function createPost(postData: {
    title: string
    content: string
    tags?: string[]
    cover?: string
    status?: string
    subtitle?: string
    summary?: string
  }) {
    const { data } = await api.post('/posts', postData)
    await fetchPosts()
    return data
  }

  async function updatePost(
    id: string,
    postData: {
      title?: string
      content?: string
      tags?: string[]
      cover?: string
      status?: string
      date?: string
      subtitle?: string
      summary?: string
    },
  ) {
    const { data } = await api.put(`/posts/${id}`, postData)
    await fetchPosts()
    return data
  }

  async function deletePost(id: string) {
    await api.delete(`/posts/${id}`)
    await fetchPosts()
  }

  return {
    posts,
    currentPost,
    loading,
    publishedPosts,
    draftPosts,
    fetchPosts,
    fetchPost,
    createPost,
    updatePost,
    deletePost,
  }
})

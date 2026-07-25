import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../api'

export interface PostUsage {
  slug: string
  title: string
  status: string
}

export interface ImageRecord {
  filename: string
  url: string
  size: number
  modifiedAt: string
  usedBy: PostUsage[]
}

export type ImageFilter = 'all' | 'published' | 'draft' | 'unused'

export const useImagesStore = defineStore('images', () => {
  const images = ref<ImageRecord[]>([])
  const loading = ref(false)
  const filter = ref<ImageFilter>('all')

  const publishedImages = computed(() =>
    images.value.filter((i) => i.usedBy.some((u) => u.status === 'publish'))
  )
  const draftImages = computed(() =>
    images.value.filter((i) => i.usedBy.some((u) => u.status === 'draft'))
  )
  const unusedImages = computed(() => images.value.filter((i) => i.usedBy.length === 0))

  const filteredImages = computed(() => {
    if (filter.value === 'published') return publishedImages.value
    if (filter.value === 'draft') return draftImages.value
    if (filter.value === 'unused') return unusedImages.value
    return images.value
  })

  async function fetchImages() {
    loading.value = true
    try {
      const { data } = await api.get('/images')
      images.value = data
    } finally {
      loading.value = false
    }
  }

  async function deleteImage(filename: string) {
    await api.delete(`/images/${filename}`)
    images.value = images.value.filter((img) => img.filename !== filename)
  }

  async function batchDeleteImages(filenames: string[]) {
    await api.post('/images/batch-delete', { filenames })
    images.value = images.value.filter((img) => !filenames.includes(img.filename))
  }

  return {
    images,
    loading,
    filter,
    publishedImages,
    draftImages,
    unusedImages,
    filteredImages,
    fetchImages,
    deleteImage,
    batchDeleteImages,
  }
})

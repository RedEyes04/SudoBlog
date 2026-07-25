import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api'

export interface ImageRecord {
  filename: string
  url: string
  size: number
  modifiedAt: string
}

export const useImagesStore = defineStore('images', () => {
  const images = ref<ImageRecord[]>([])
  const loading = ref(false)

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

  return {
    images,
    loading,
    fetchImages,
    deleteImage,
  }
})

import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api'

export interface FriendRecord {
  id: string
  name: string
  avatar: string
  description: string
  url: string
  thumbnail: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt?: string
}

export const useFriendsStore = defineStore('friends', () => {
  const friends = ref<FriendRecord[]>([])
  const applications = ref<FriendRecord[]>([])
  const loading = ref(false)

  async function fetchFriends() {
    loading.value = true
    try {
      const { data } = await api.get('/friends')
      friends.value = data
    } finally {
      loading.value = false
    }
  }

  async function fetchApplications() {
    loading.value = true
    try {
      const { data } = await api.get('/friends/applications')
      applications.value = data
    } finally {
      loading.value = false
    }
  }

  async function createFriend(friendData: Omit<FriendRecord, 'id' | 'status'>) {
    const { data } = await api.post('/friends', friendData)
    await fetchFriends()
    return data
  }

  async function updateFriend(id: string, updates: Partial<FriendRecord>) {
    const { data } = await api.put(`/friends/${id}`, updates)
    await fetchFriends()
    await fetchApplications()
    return data
  }

  async function deleteFriend(id: string) {
    await api.delete(`/friends/${id}`)
    await fetchFriends()
  }

  async function approveFriend(id: string) {
    return updateFriend(id, { status: 'approved' })
  }

  async function rejectFriend(id: string) {
    return updateFriend(id, { status: 'rejected' })
  }

  return {
    friends,
    applications,
    loading,
    fetchFriends,
    fetchApplications,
    createFriend,
    updateFriend,
    deleteFriend,
    approveFriend,
    rejectFriend,
  }
})

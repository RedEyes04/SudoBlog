import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../api';
export const useFriendsStore = defineStore('friends', () => {
    const friends = ref([]);
    const applications = ref([]);
    const loading = ref(false);
    async function fetchFriends() {
        loading.value = true;
        try {
            const { data } = await api.get('/friends');
            friends.value = data;
        }
        finally {
            loading.value = false;
        }
    }
    async function fetchApplications() {
        loading.value = true;
        try {
            const { data } = await api.get('/friends/applications');
            applications.value = data;
        }
        finally {
            loading.value = false;
        }
    }
    async function createFriend(friendData) {
        const { data } = await api.post('/friends', friendData);
        await fetchFriends();
        return data;
    }
    async function updateFriend(id, updates) {
        const { data } = await api.put(`/friends/${id}`, updates);
        await fetchFriends();
        await fetchApplications();
        return data;
    }
    async function deleteFriend(id) {
        await api.delete(`/friends/${id}`);
        await fetchFriends();
    }
    async function approveFriend(id) {
        return updateFriend(id, { status: 'approved' });
    }
    async function rejectFriend(id) {
        return updateFriend(id, { status: 'rejected' });
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
    };
});

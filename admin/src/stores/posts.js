import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../api';
export const usePostsStore = defineStore('posts', () => {
    const posts = ref([]);
    const currentPost = ref(null);
    const loading = ref(false);
    const publishedPosts = computed(() => posts.value.filter((p) => p.status === 'publish'));
    const draftPosts = computed(() => posts.value.filter((p) => p.status === 'draft'));
    async function fetchPosts() {
        loading.value = true;
        try {
            const { data } = await api.get('/posts');
            posts.value = data;
        }
        finally {
            loading.value = false;
        }
    }
    async function fetchPost(id) {
        loading.value = true;
        try {
            const { data } = await api.get(`/posts/${id}`);
            currentPost.value = data;
            return data;
        }
        finally {
            loading.value = false;
        }
    }
    async function createPost(postData) {
        const { data } = await api.post('/posts', postData);
        await fetchPosts();
        return data;
    }
    async function updatePost(id, postData) {
        const { data } = await api.put(`/posts/${id}`, postData);
        await fetchPosts();
        return data;
    }
    async function deletePost(id) {
        await api.delete(`/posts/${id}`);
        await fetchPosts();
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
    };
});

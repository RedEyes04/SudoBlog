<template>
  <div class="posts-list">
    <div class="page-header">
      <h2>Posts</h2>
      <el-button type="primary" @click="$router.push('/editor')">
        <el-icon><Plus /></el-icon> New Post
      </el-button>
    </div>

    <el-card shadow="hover">
      <el-table
        :data="postsStore.posts"
        stripe
        v-loading="postsStore.loading"
        style="width: 100%"
        empty-text="No posts yet. Create your first post!"
      >
        <el-table-column prop="title" label="Title" min-width="200">
          <template #default="{ row }">
            <span class="post-title">{{ row.title }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="date" label="Date" width="140" />
        <el-table-column prop="status" label="Status" width="120">
          <template #default="{ row }">
            <el-tag :type="row.status === 'publish' ? 'success' : 'warning'">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="$router.push(`/editor/${row.id}`)">
              <el-icon><Edit /></el-icon> Edit
            </el-button>
            <el-popconfirm
              title="Are you sure you want to delete this post?"
              confirm-button-text="Delete"
              cancel-button-text="Cancel"
              @confirm="handleDelete(row.id)"
            >
              <template #reference>
                <el-button size="small" type="danger">
                  <el-icon><Delete /></el-icon> Delete
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { usePostsStore } from '../stores/posts'

const postsStore = usePostsStore()

async function handleDelete(id: string) {
  try {
    await postsStore.deletePost(id)
    ElMessage.success('Post deleted')
  } catch {
    // Error handled by interceptor
  }
}

onMounted(() => {
  postsStore.fetchPosts()
})
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
}

.post-title {
  font-weight: 500;
}
</style>

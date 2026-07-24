<template>
  <div class="dashboard">
    <h2>Dashboard</h2>

    <el-row :gutter="20" class="stats-row">
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <el-statistic title="Total Posts" :value="postsStore.posts.length" />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card stat-published">
          <el-statistic title="Published" :value="postsStore.publishedPosts.length" />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card stat-draft">
          <el-statistic title="Drafts" :value="postsStore.draftPosts.length" />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="actions-row">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <span>Quick Actions</span>
          </template>
          <el-space>
            <el-button type="primary" @click="$router.push('/editor')">
              <el-icon><Edit /></el-icon> New Post
            </el-button>
            <el-button @click="$router.push('/posts')">
              <el-icon><Document /></el-icon> Manage Posts
            </el-button>
          </el-space>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="recent-row" v-if="postsStore.posts.length > 0">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <span>Recent Posts</span>
          </template>
          <el-table :data="recentPosts" stripe style="width: 100%">
            <el-table-column prop="title" label="Title" />
            <el-table-column prop="date" label="Date" width="140" />
            <el-table-column prop="status" label="Status" width="120">
              <template #default="{ row }">
                <el-tag :type="row.status === 'publish' ? 'success' : 'warning'">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { usePostsStore } from '../stores/posts'

const postsStore = usePostsStore()

const recentPosts = computed(() => postsStore.posts.slice(0, 5))

onMounted(() => {
  postsStore.fetchPosts()
})
</script>

<style scoped>
.dashboard h2 {
  margin-top: 0;
  margin-bottom: 24px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
}

.stat-published :deep(.el-statistic__number) {
  color: #67c23a;
}

.stat-draft :deep(.el-statistic__number) {
  color: #e6a23c;
}

.actions-row {
  margin-bottom: 20px;
}

.recent-row {
  margin-bottom: 20px;
}
</style>

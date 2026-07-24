<template>
  <div class="applications-page">
    <div class="page-header">
      <h2>Friend Link Applications</h2>
    </div>

    <el-card shadow="hover">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="Pending" name="pending" />
        <el-tab-pane label="All" name="all" />
      </el-tabs>

      <el-table
        :data="filteredApplications"
        stripe
        v-loading="store.loading"
        empty-text="No applications."
      >
        <el-table-column prop="name" label="Name" min-width="150" />
        <el-table-column prop="url" label="URL" min-width="200">
          <template #default="{ row }">
            <a :href="row.url" target="_blank" class="url-link">{{ row.url }}</a>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="Description" min-width="250" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="Submitted" width="170">
          <template #default="{ row }">
            {{ row.createdAt ? formatDate(row.createdAt) : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Status" width="110">
          <template #default="{ row }">
            <el-tag
              :type="
                row.status === 'approved'
                  ? 'success'
                  : row.status === 'rejected'
                    ? 'danger'
                    : 'warning'
              "
            >
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="200" fixed="right">
          <template #default="{ row }">
            <template v-if="row.status === 'pending'">
              <el-button size="small" type="success" @click="handleApprove(row.id)">
                Approve
              </el-button>
              <el-button size="small" type="danger" @click="handleReject(row.id)">
                Reject
              </el-button>
            </template>
            <el-popconfirm
              v-else
              title="Delete this application?"
              @confirm="handleDelete(row.id)"
            >
              <template #reference>
                <el-button size="small" type="danger">
                  <el-icon><Delete /></el-icon>
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
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useFriendsStore } from '../stores/friends'

const store = useFriendsStore()
const activeTab = ref('pending')

const filteredApplications = computed(() => {
  if (activeTab.value === 'pending') {
    return store.applications.filter((a) => a.status === 'pending')
  }
  return store.applications
})

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('zh-CN')
}

async function handleApprove(id: string) {
  try {
    await store.approveFriend(id)
    ElMessage.success('Application approved')
  } catch {
    // handled by interceptor
  }
}

async function handleReject(id: string) {
  try {
    await store.rejectFriend(id)
    ElMessage.success('Application rejected')
  } catch {
    // handled by interceptor
  }
}

async function handleDelete(id: string) {
  try {
    await store.deleteFriend(id)
    ElMessage.success('Deleted')
  } catch {
    // handled by interceptor
  }
}

onMounted(() => {
  store.fetchApplications()
})
</script>

<style scoped>
.page-header {
  margin-bottom: 20px;
}
.page-header h2 {
  margin: 0;
}
.url-link {
  color: #409eff;
  text-decoration: none;
}
</style>

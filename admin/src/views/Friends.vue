<template>
  <div class="friends-page">
    <div class="page-header">
      <h2>Friend Links</h2>
      <el-button type="primary" @click="openDialog(null)">
        <el-icon><Plus /></el-icon> Add Friend
      </el-button>
    </div>

    <el-card shadow="hover">
      <el-table
        :data="store.friends"
        stripe
        v-loading="store.loading"
        empty-text="No friends yet."
      >
        <el-table-column label="Avatar" width="80">
          <template #default="{ row }">
            <el-avatar :src="row.avatar" :size="40" />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="Name" min-width="150" />
        <el-table-column prop="url" label="URL" min-width="200">
          <template #default="{ row }">
            <a :href="row.url" target="_blank" class="url-link">{{ row.url }}</a>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="Description" min-width="250" show-overflow-tooltip />
        <el-table-column label="Actions" width="180" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="openDialog(row)">
              <el-icon><Edit /></el-icon> Edit
            </el-button>
            <el-popconfirm
              title="Delete this friend link?"
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

    <!-- Add/Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingFriend ? 'Edit Friend' : 'Add Friend'"
      width="500px"
    >
      <el-form :model="form" label-position="top">
        <el-form-item label="Name" required>
          <el-input v-model="form.name" placeholder="Site name" />
        </el-form-item>
        <el-form-item label="URL" required>
          <el-input v-model="form.url" placeholder="https://..." />
        </el-form-item>
        <el-form-item label="Avatar URL">
          <el-input v-model="form.avatar" placeholder="https://...avatar.png" />
        </el-form-item>
        <el-form-item label="Description">
          <el-input v-model="form.description" type="textarea" :rows="2" placeholder="Brief description" />
        </el-form-item>
        <el-form-item label="Thumbnail URL">
          <el-input v-model="form.thumbnail" placeholder="https://...thumbnail.png" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="handleSave">
          {{ editingFriend ? 'Update' : 'Add' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useFriendsStore, type FriendRecord } from '../stores/friends'

const store = useFriendsStore()
const dialogVisible = ref(false)
const editingFriend = ref<FriendRecord | null>(null)

const form = reactive({
  name: '',
  url: '',
  avatar: '',
  description: '',
  thumbnail: '',
})

function openDialog(friend: FriendRecord | null) {
  editingFriend.value = friend
  if (friend) {
    form.name = friend.name
    form.url = friend.url
    form.avatar = friend.avatar
    form.description = friend.description
    form.thumbnail = friend.thumbnail
  } else {
    form.name = ''
    form.url = ''
    form.avatar = ''
    form.description = ''
    form.thumbnail = ''
  }
  dialogVisible.value = true
}

async function handleSave() {
  if (!form.name || !form.url) {
    ElMessage.warning('Name and URL are required')
    return
  }
  try {
    if (editingFriend.value) {
      await store.updateFriend(editingFriend.value.id, { ...form })
      ElMessage.success('Friend updated')
    } else {
      await store.createFriend({ ...form })
      ElMessage.success('Friend added')
    }
    dialogVisible.value = false
  } catch {
    // handled by interceptor
  }
}

async function handleDelete(id: string) {
  try {
    await store.deleteFriend(id)
    ElMessage.success('Friend deleted')
  } catch {
    // handled by interceptor
  }
}

onMounted(() => {
  store.fetchFriends()
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
.url-link {
  color: #409eff;
  text-decoration: none;
}
</style>

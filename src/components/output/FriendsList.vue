<script setup lang="ts">
import type { Friend } from '../../types'

defineProps<{
  friends: Friend[]
}>()
</script>

<template>
  <div class="friends-page">
    <div class="friends-content">
      <div class="header">
        <span class="header-icon">&#128279;</span>
        友链 <span class="count">（共 {{ friends.length }} 个）</span>
      </div>
      <div class="grid">
        <a
          v-for="friend in friends"
          :key="friend.url"
          :href="friend.url"
          target="_blank"
          rel="noopener"
          class="friend-card"
        >
          <img v-if="friend.thumbnail" :src="friend.thumbnail" :alt="friend.name" class="thumbnail" />
          <div class="card-body">
            <div class="card-header">
              <img :src="friend.avatar" :alt="friend.name" class="card-avatar" />
              <h3 class="card-name">{{ friend.name }}</h3>
            </div>
            <p class="card-desc">{{ friend.description }}</p>
          </div>
          <span class="visit-hint">访问 &rarr;</span>
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.friends-page {
  height: 100%;
  padding: 2rem;
}

.friends-content {
  padding-bottom: 1rem;
}

.header {
  color: var(--green);
  font-weight: bold;
  margin-bottom: 1.5rem;
  font-size: 1.2em;
  text-align: center;
}

.header-icon {
  margin-right: 0.4em;
}

.count {
  color: var(--gray);
  font-weight: normal;
  font-size: 0.9em;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  max-width: 960px;
  margin: 0 auto;
}

.friend-card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--dark-gray);
  border-radius: 6px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.2s, background 0.2s;
  background: rgba(0, 0, 0, 0.1);
}

.friend-card:hover {
  border-color: var(--green);
  background: rgba(163, 190, 140, 0.06);
}

.thumbnail {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.card-body {
  padding: 0.8em 1em;
  flex: 1;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.6em;
  margin-bottom: 0.5em;
}

.card-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  flex-shrink: 0;
}

.card-name {
  color: var(--yellow);
  font-size: 1em;
  font-weight: 600;
}

.card-desc {
  color: var(--gray);
  font-size: 0.9em;
  line-height: 1.5;
}

.visit-hint {
  display: block;
  text-align: right;
  padding: 0 1em 0.8em;
  color: var(--blue);
  font-size: 0.85em;
}

.friend-card:hover .visit-hint {
  color: var(--green);
}
</style>

<script setup lang="ts">
import type { AboutData } from '../../types'

defineProps<{
  about: AboutData
}>()
</script>

<template>
  <div class="about-view">
    <div class="avatar-container">
      <img :src="about.avatar" :alt="about.name" class="avatar" />
    </div>
    <h2 class="name">{{ about.name }}</h2>
    <div class="bio">
      <p v-for="(line, i) in about.bio.split('\n').filter(Boolean)" :key="i">
        {{ line }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.about-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;
  padding: 1.5em 0;
}

.avatar-container {
  margin-bottom: 1.5rem;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 3px solid var(--green);
  object-fit: cover;
}

.name {
  color: var(--yellow);
  font-size: 1.2em;
  margin-bottom: 1rem;
}

.bio {
  max-width: 500px;
  text-align: center;
  line-height: 1.8;
  color: var(--fg);
}

.bio p {
  margin-bottom: 0.5em;
}
</style>

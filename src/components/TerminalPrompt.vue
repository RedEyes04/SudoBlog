<script setup lang="ts">
import { siteConfig } from '../data/config'
</script>

<template>
  <span>
    <span class="prompt-user">{{ siteConfig.username }}</span>
    <span class="prompt-at">@</span>
    <span class="prompt-host">{{ siteConfig.hostname }}</span>
    <span class="prompt-path">:$ ~ </span>
  </span>
</template>

<style scoped>
.prompt-user {
  color: var(--yellow);
}

.prompt-at {
  color: var(--gray);
}

.prompt-host {
  color: var(--green);
}

.prompt-path {
  color: var(--gray);
}
</style>

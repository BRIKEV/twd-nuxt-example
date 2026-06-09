<!-- app/app.vue -->
<script setup lang="ts">
import { createBrowserClient } from 'twd-relay/browser'
if (import.meta.dev) {
  useHead({
    script: [
      { src: '/_nuxt/@id/virtual:twd/init', type: 'module' },
      { src: '/_nuxt/@id/virtual:twd-relay/connect', type: 'module' },
    ],
  })
}
if (import.meta.client) {
  createBrowserClient({ url: 'ws://localhost:9876/__twd/ws' }).connect();
}
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>

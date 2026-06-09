<!-- app/pages/index.vue -->
<!-- This is the home route ("/"). Created automatically by file-based routing. -->
<template>
  <main class="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center">
    <h1 class="text-4xl font-bold tracking-tight text-slate-900">TWD Nuxt Example</h1>
    <p class="text-slate-600">
      A small Nuxt app for exploring in-browser testing with TWD.
    </p>
    <NuxtLink
      to="/todos"
      class="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white transition hover:bg-slate-700"
    >
      Todo list (SQLite)
    </NuxtLink>
  </main>
</template>

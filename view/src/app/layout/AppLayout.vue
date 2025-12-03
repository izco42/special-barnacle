<template>
  <div>
    <header class="app-header">
      <div class="container header-content">
        <div class="brand">Special-barnacle</div>
        <nav class="nav">
          <RouterLink to="/">Corte actual</RouterLink>
          <RouterLink to="/historial">Historial</RouterLink>
        </nav>
      </div>
    </header>
    <main class="container main">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.92);
  border-bottom: 1px solid var(--border);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
}

.brand {
  font-weight: 800;
  letter-spacing: -0.02em;
  font-size: 1.2rem;
  color: var(--text);
}

.nav {
  display: flex;
  gap: 1rem;
  font-weight: 600;
  color: var(--muted);
}

.nav a {
  padding: 0.45rem 1rem;
  border-radius: 999px;
  transition: background 0.15s ease, color 0.15s ease;
}

.nav a.router-link-active {
  background: #646cff;
  color: #fff;
}

.main {
  padding: 1.5rem 0 2.5rem;
}
</style>

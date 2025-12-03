<template>
  <div class="card">
    <div class="header">
      <h3>Compras</h3>
      <span class="badge">{{ purchases.length }}</span>
    </div>
    <div v-if="!purchases.length" class="empty">Sin compras registradas.</div>
    <div v-else class="table">
      <div class="table-head">
        <span>Descripción</span>
        <span>Total</span>
        <span>Fondo</span>
        <span>Caja</span>
        <span></span>
      </div>
      <div v-for="p in purchases" :key="p.id" class="table-row">
        <span>{{ p.descripcion || '—' }}</span>
        <span>${{ p.totalPagado.toLocaleString() }}</span>
        <span>${{ p.tomadoFondo.toLocaleString() }}</span>
        <span>${{ p.tomadoCaja.toLocaleString() }}</span>
        <button class="icon-button danger" @click="$emit('delete', p.id)" :disabled="loading" aria-label="Eliminar compra">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PurchaseDto } from '../types'

defineProps<{ purchases: PurchaseDto[]; loading?: boolean }>()
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.badge {
  background: var(--surface-soft);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 0.35rem 0.7rem;
  font-weight: 700;
}

.table {
  display: grid;
  gap: 0.5rem;
}

.table-head,
.table-row {
  display: grid;
  grid-template-columns: 2fr repeat(3, 1fr) 48px;
  gap: 0.5rem;
  align-items: center;
}

.table-head {
  font-weight: 700;
  color: var(--muted);
  font-size: 0.9rem;
}

.table-row {
  padding: 0.75rem 0.5rem;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--surface-soft);
}

.icon-button {
  border: 1px solid var(--border);
  background: #fff;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #dc2626;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.icon-button.danger {
  color: #dc2626;
  border-color: rgba(220, 38, 38, 0.35);
  background: rgba(248, 113, 113, 0.12);
}

.icon-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.empty {
  color: var(--muted);
  text-align: center;
  padding: 1rem 0;
}
</style>

<template>
  <div class="card summary">
    <div>
      <p class="muted">Saldo neto anterior</p>
      <h2 :class="saldoClass">${{ cut.saldoNetoAnterior.toLocaleString() }}</h2>
    </div>
    <div>
      <p class="muted">Estado</p>
      <span class="chip" :class="cut.status">{{ cut.status === 'open' ? 'Abierto' : 'Cerrado' }}</span>
    </div>
    <div>
      <p class="muted">Última actualización</p>
      <p>{{ new Date(cut.updatedAt).toLocaleString() }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CutDto } from '../types'

const props = defineProps<{ cut: CutDto }>()
const saldoClass = computed(() => {
  if (props.cut.saldoNetoAnterior > 0) return 'positive'
  if (props.cut.saldoNetoAnterior < 0) return 'negative'
  return ''
})
</script>

<style scoped>
.summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  align-items: center;
  border: 1px solid var(--border);
  background: var(--surface-soft);
  box-shadow: none;
}

.muted {
  color: var(--muted);
  margin: 0 0 0.35rem;
}

h2 {
  margin: 0;
}

.chip {
  display: inline-block;
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  font-weight: 700;
  color: var(--text);
  background: #eef2ff;
}

.chip.open {
  background: rgba(34, 197, 94, 0.15);
  color: #15803d;
}

.chip.closed {
  background: rgba(239, 68, 68, 0.15);
  color: #b91c1c;
}

.positive {
  color: #15803d;
}

.negative {
  color: #b91c1c;
}
</style>

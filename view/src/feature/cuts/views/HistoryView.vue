<template>
  <div class="card">
    <div class="header">
      <div>
        <h2>Historial de cortes</h2>
        <p class="muted">Últimos cortes cerrados.</p>
      </div>
      <button class="btn secondary" @click="load" :disabled="loading">Refrescar</button>
    </div>
    <div v-if="!cuts.length" class="empty">Aún no hay cortes cerrados.</div>
    <div v-else class="list">
      <div v-for="c in cuts" :key="c.id" class="item">
        <div class="item-grid">
          <div class="summary-card">
            <div class="summary-grid">
              <div>
                <p class="muted">Fecha</p>
                <strong>{{ new Date(c.createdAt).toLocaleString() }}</strong>
              </div>
              <div>
                <p class="muted">Saldo neto anterior</p>
                <strong :class="getSaldoClass(c.saldoNetoAnterior)">${{ c.saldoNetoAnterior.toLocaleString() }}</strong>
              </div>
              <div>
                <p class="muted">Porcentaje de gasto</p>
                <strong>{{ (c.gastoPorcentaje * 100).toFixed(2) }}%</strong>
              </div>
              <div>
                <p class="muted">Compras registradas</p>
                <strong>{{ c.purchases?.length || 0 }}</strong>
              </div>
            </div>
            <div v-if="c.purchases?.length" class="purchases">
              <div class="purchase-head">
                <span>Descripción</span>
                <span>Total</span>
                <span>Fondo</span>
                <span>Caja</span>
              </div>
              <div v-for="p in c.purchases" :key="p.id" class="purchase-row">
                <span>{{ p.descripcion || '—' }}</span>
                <span>${{ p.totalPagado.toLocaleString() }}</span>
                <span>${{ p.tomadoFondo.toLocaleString() }}</span>
                <span>${{ p.tomadoCaja.toLocaleString() }}</span>
              </div>
            </div>
          </div>
          <div class="metrics-card">
            <div class="metrics-grid">
              <div v-for="metric in getMetrics(c)" :key="metric.label" class="metric">
                <div class="metric-label">{{ metric.label }}</div>
                <div class="metric-value" :class="metric.className">${{ metric.value.toLocaleString() }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="item-actions">
          <button
            class="icon-button danger"
            type="button"
            @click="handleDeleteCut(c.id)"
            :disabled="loading"
            aria-label="Eliminar corte"
            title="Eliminar corte"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { fetchHistory, deleteCut } from '../api'
import type { CutDto } from '../types'

const cuts = ref<CutDto[]>([])
const loading = ref(false)

const load = async () => {
  loading.value = true
  try {
    cuts.value = await fetchHistory()
  } finally {
    loading.value = false
  }
}

onMounted(load)

const handleDeleteCut = async (id: number) => {
  if (!confirm('¿Seguro que deseas eliminar este corte y todas sus compras?')) return
  loading.value = true
  try {
    await deleteCut(id)
    cuts.value = cuts.value.filter((c) => c.id !== id)
  } finally {
    loading.value = false
  }
}

const getSaldoClass = (value: number) => {
  if (value > 0) return 'positive'
  if (value < 0) return 'negative'
  return ''
}

const getMetrics = (cut: CutDto) => {
  const ventas = cut.ventasDelDia ?? 0
  const gastoAuto = ventas * cut.gastoPorcentaje
  const gasto = cut.gastoMonto ?? gastoAuto
  const saldo = cut.saldoNetoResultante
  const saldoClass = saldo > 0 ? 'positive' : saldo < 0 ? 'negative' : ''

  return [
    { label: 'Ventas del día', value: ventas },
    { label: 'Compras totales', value: cut.comprasTotales },
    { label: 'Tomado de fondo', value: cut.tomadoFondo },
    { label: 'Tomado de caja', value: cut.tomadoCaja },
    { label: 'Gastos del día', value: gasto },
    {
      label: 'Utilidad operativa',
      value: cut.utilidadOperativa,
      className:
        cut.utilidadOperativa > 0
          ? 'positive'
          : cut.utilidadOperativa < 0
            ? 'negative'
            : '',
    },
    { label: 'Saldo neto', value: saldo, className: saldoClass },
  ]
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.list {
  display: grid;
  gap: 1.25rem;
  margin-top: 1rem;
}

.item {
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 1.25rem;
  background: var(--surface);
  box-shadow: none;
  display: grid;
  gap: 1rem;
}

.item-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 1.25rem;
  align-items: start;
}

.summary-card,
.metrics-card {
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 1rem;
  background: var(--surface-soft);
  display: grid;
  gap: 1rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.metrics-grid {
  display: grid;
  gap: 0.85rem;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
}

.metric {
  padding: 0.75rem 1rem;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.02);
}

.metric-label {
  font-size: 0.85rem;
  color: var(--muted);
}

.metric-value {
  font-weight: 700;
  color: var(--text);
  margin-top: 0.15rem;
}

.metric-value.positive {
  color: #15803d;
}

.metric-value.negative {
  color: #b91c1c;
}

.positive {
  color: #15803d;
}

.negative {
  color: #b91c1c;
}

.item-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}

.icon-button {
  border: 1px solid var(--border);
  background: var(--surface-soft);
  border-radius: 50%;
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.icon-button.danger {
  border-color: rgba(239, 68, 68, 0.4);
  color: #f87171;
  background: rgba(239, 68, 68, 0.1);
}

.icon-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.purchases {
  display: grid;
  gap: 0.5rem;
  margin-top: 0.5rem;
  border-top: 1px solid var(--border);
  padding-top: 0.75rem;
}

.purchase-head,
.purchase-row {
  display: grid;
  grid-template-columns: 2fr repeat(3, minmax(120px, 1fr));
  gap: 0.5rem;
  align-items: center;
}

.purchase-head {
  font-weight: 700;
  color: var(--muted);
  font-size: 0.85rem;
}

.purchase-row {
  padding: 0.6rem 0.5rem;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.04);
}

.muted {
  color: var(--muted);
  margin: 0 0 0.2rem;
}

.empty {
  color: var(--muted);
  padding: 1rem 0;
  text-align: center;
}

@media (max-width: 900px) {
  .item-grid {
    grid-template-columns: 1fr;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>

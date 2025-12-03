<template>
  <div class="card chart-card">
    <div class="chart-header">
      <div>
        <h3>Desglose del corte</h3>
        <p class="muted">Distribución de efectivo del corte actual.</p>
      </div>
    </div>
    <div v-if="!item" class="empty">Aún no hay un corte activo.</div>
    <div v-else class="chart-body">
      <div class="chart-row">
        <div class="chart-label">
          <strong>Corte #{{ item.id }}</strong>
          <span>{{ item.date }}</span>
        </div>
        <div class="chart-bar">
          <span
            v-for="segment in item.segments"
            :key="segment.label"
            class="segment"
            :class="segment.className"
            :style="{ width: segment.width + '%' }"
            :title="`${segment.label}: $${segment.value.toLocaleString()}`"
          ></span>
        </div>
      </div>
    </div>
    <div class="legend">
      <div v-for="legend in legends" :key="legend.className" class="legend-item">
        <span class="legend-swatch" :class="legend.className"></span>
        <span>{{ legend.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CutDto } from '../types'

const props = defineProps<{ cut: CutDto | null }>()

const legends = [
  { label: 'Tomado de caja', className: 'caja' },
  { label: 'Tomado de fondo', className: 'fondo' },
  { label: 'Gastos del día', className: 'gasto' },
  { label: 'Utilidad operativa', className: 'utilidad' },
]

const item = computed(() => {
  if (!props.cut) return null

  const ventas = props.cut.ventasDelDia ?? 0
  const gastoAuto = ventas * props.cut.gastoPorcentaje
  const gasto = props.cut.gastoMonto ?? gastoAuto
  const segments = [
    { label: 'Tomado de caja', value: props.cut.tomadoCaja, className: 'caja' },
    { label: 'Tomado de fondo', value: props.cut.tomadoFondo, className: 'fondo' },
    { label: 'Gastos del día', value: gasto, className: 'gasto' },
    { label: 'Utilidad operativa', value: props.cut.utilidadOperativa, className: 'utilidad' },
  ].map((segment) => ({
    ...segment,
    value: segment.value ?? 0,
    width: 0,
  }))

  const positiveSum = segments.reduce((sum, seg) => (seg.value > 0 ? sum + seg.value : sum), 0)
  return {
    id: props.cut.id,
    date: new Date(props.cut.updatedAt).toLocaleString(),
    segments: segments.map((segment) => ({
      ...segment,
      width: positiveSum > 0 && segment.value > 0 ? (segment.value / positiveSum) * 100 : 0,
    })),
  }
})
</script>

<style scoped>
.chart-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.chart-header h3 {
  margin: 0;
}

.muted {
  color: var(--muted);
  margin: 0.2rem 0 0;
}

.chart-body {
  display: grid;
  gap: 1rem;
}

.chart-row {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.chart-label {
  width: 160px;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  font-size: 0.85rem;
  color: var(--muted);
}

.chart-bar {
  flex: 1;
  height: 36px;
  border-radius: 999px;
  background: var(--border);
  overflow: hidden;
  display: flex;
}

.segment {
  height: 100%;
}

.segment.caja {
  background: #4c1d95;
}

.segment.fondo {
  background: #7c3aed;
}

.segment.gasto {
  background: #fb7185;
}

.segment.utilidad {
  background: #fbbf24;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  font-size: 0.85rem;
  color: var(--muted);
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.legend-swatch {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  display: inline-block;
}

.legend-swatch.caja {
  background: #4c1d95;
}

.legend-swatch.fondo {
  background: #7c3aed;
}

.legend-swatch.gasto {
  background: #fb7185;
}

.legend-swatch.utilidad {
  background: #fbbf24;
}

.empty {
  color: var(--muted);
  padding: 0.5rem 0;
}
</style>

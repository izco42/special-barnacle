<template>
  <div class="card">
    <h3 class="title">Métricas</h3>
    <div class="metrics-grid">
      <div v-for="item in metrics" :key="item.label" class="metric">
        <div class="metric-label">{{ item.label }}</div>
        <div class="metric-value" :class="item.className">${{ item.value.toLocaleString() }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CutDto } from '../types'
import { computed } from 'vue'

const props = defineProps<{ cut: CutDto }>()

const metrics = computed(() => {
  const ventas = props.cut.ventasDelDia ?? 0
  const gastoAuto = ventas * props.cut.gastoPorcentaje
  const gasto = props.cut.gastoMonto ?? gastoAuto
  const saldo = props.cut.saldoNetoResultante
  let saldoClass = ''
  if (saldo > 0) saldoClass = 'positive'
  else if (saldo < 0) saldoClass = 'negative'

  return [
    { label: 'Ventas del día', value: ventas },
    { label: 'Compras totales', value: props.cut.comprasTotales },
    { label: 'Tomado de fondo', value: props.cut.tomadoFondo },
    { label: 'Tomado de caja', value: props.cut.tomadoCaja },
    { label: 'Gastos del día', value: gasto },
    {
      label: 'Utilidad operativa',
      value: props.cut.utilidadOperativa,
      className:
        props.cut.utilidadOperativa > 0
          ? 'positive'
          : props.cut.utilidadOperativa < 0
            ? 'negative'
            : undefined,
    },
    { label: 'Saldo neto', value: saldo, className: saldoClass },
  ]
})
</script>

<style scoped>
.title {
  margin: 0 0 1rem;
  font-size: 1.1rem;
  color: var(--text);
}

.metrics-grid {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.metric {
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--surface-soft);
}

.metric-label {
  font-size: 0.9rem;
  color: var(--muted);
}

.metric-value {
  font-weight: 700;
  color: var(--text);
  margin-top: 0.2rem;
}

.metric-value.positive {
  color: #15803d;
}

.metric-value.negative {
  color: #b91c1c;
}
</style>

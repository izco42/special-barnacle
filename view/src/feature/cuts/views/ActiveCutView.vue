<template>
  <div class="page-grid">
    <section class="left-column grid">
      <div class="card">
        <div class="header">
          <div>
            <h2>Corte actual</h2>
            <p class="muted">Abre el corte con el saldo neto anterior.</p>
          </div>
          <div>
            <button v-if="cut?.status === 'open'" class="btn secondary" @click="refresh" :disabled="loading">Refrescar</button>
          </div>
        </div>
        <div v-if="!cut">
          <form class="grid" style="gap: 0.75rem" @submit.prevent="handleOpen">
            <label class="field">
              <span>Saldo neto anterior</span>
              <input v-model.number="openForm.saldoNetoAnterior" type="number" step="0.01" class="input" required />
            </label>
            <label class="field">
              <span>Porcentaje de gasto (ej. 0.15)</span>
              <input v-model.number="openForm.gastoPorcentaje" type="number" min="0" step="0.01" class="input" />
            </label>
            <div class="actions">
              <button class="btn" type="submit" :disabled="loading">Abrir corte</button>
            </div>
          </form>
        </div>
        <div v-else>
          <CutSummary :cut="cut" />
        </div>
      </div>

      <div v-if="cut?.status === 'open'" class="grid" style="gap: 1rem">
        <PurchaseForm :loading="loading" @submit="handlePurchase" />
        <div class="card grid" style="gap: 0.75rem">
          <div class="header">
            <h3>Gasto del día</h3>
            <span class="muted">
              Porcentaje actual: {{ (expenseForm.gastoPorcentaje * 100).toFixed(2) }}%
              <template v-if="expenseMode === 'amount'"> - Modo manual</template>
              <template v-else> - Modo porcentaje</template>
            </span>
          </div>
          <label class="field">
            <span>Gasto manual (opcional)</span>
            <input
              v-model.number="expenseForm.gastoMonto"
              type="number"
              min="0"
              step="0.01"
              class="input"
              @input="handleExpenseAmountInput"
            />
          </label>
          <label class="field">
            <span>Porcentaje</span>
            <input
              v-model.number="expenseForm.gastoPorcentaje"
              type="number"
              min="0"
              step="0.0001"
              class="input"
              @input="handleExpensePercentageInput"
            />
          </label>
          <div class="actions" style="gap: 0.5rem">
            <button class="btn secondary" type="button" :disabled="loading" @click="setAutoExpense">Usar automático</button>
            <button class="btn" type="button" :disabled="loading" @click="updateExpense">Actualizar gasto</button>
          </div>
        </div>

        <div class="card grid" style="gap: 0.75rem">
          <div class="header">
            <h3>Ventas del día</h3>
            <span class="muted">Actualiza el efectivo contado para ver métricas antes de cerrar.</span>
          </div>
          <label class="field">
            <span>Ventas del día</span>
            <input v-model.number="salesForm.ventasDelDia" type="number" min="0" step="0.01" class="input" />
          </label>
          <div class="actions" style="gap: 0.5rem">
            <button class="btn secondary" type="button" :disabled="loading" @click="handleUpdateSales">Actualizar ventas</button>
            <button class="btn success" type="button" :disabled="loading" @click="handleClose">Cerrar corte</button>
          </div>
        </div>
      </div>

    </section>
    <section class="right-column grid">
      <MetricsChart :cut="cut" />
      <MetricsCard v-if="cut" :cut="cut" />
      <PurchaseList v-if="cut" :purchases="cut.purchases" :loading="loading" @delete="handleDelete" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import {
  fetchActiveCut,
  openCut,
  createPurchase,
  updateExpense as apiUpdateExpense,
  closeCut,
  deletePurchase,
  fetchLastClosed,
  updateSales,
} from '../api'
import type { CutDto } from '../types'
import PurchaseForm from '../components/PurchaseForm.vue'
import PurchaseList from '../components/PurchaseList.vue'
import MetricsCard from '../components/MetricsCard.vue'
import MetricsChart from '../components/MetricsChart.vue'
import CutSummary from '../components/CutSummary.vue'

const cut = ref<CutDto | null>(null)
const loading = ref(false)

const openForm = reactive({ saldoNetoAnterior: 0, gastoPorcentaje: 0.15 })
const expenseForm = reactive({ gastoMonto: 0, gastoPorcentaje: 0.15 })
const salesForm = reactive({ ventasDelDia: 0 })
const expenseMode = ref<'percentage' | 'amount'>('percentage')

const syncFormsFromCut = () => {
  if (!cut.value || cut.value.status !== 'open') return
  salesForm.ventasDelDia = cut.value.ventasDelDia ?? 0
  expenseForm.gastoPorcentaje = cut.value.gastoPorcentaje
  const ventas = salesForm.ventasDelDia ?? 0
  expenseForm.gastoMonto = cut.value.gastoEsManual ? cut.value.gastoMonto ?? 0 : ventas * cut.value.gastoPorcentaje
  expenseMode.value = cut.value.gastoEsManual ? 'amount' : 'percentage'
}

const applyCut = (next: CutDto | null) => {
  cut.value = next
  if (cut.value?.status === 'open') {
    syncFormsFromCut()
  }
}

watch(
  () => salesForm.ventasDelDia,
  (ventas) => {
    if (expenseMode.value === 'percentage') {
      expenseForm.gastoMonto = ventas * expenseForm.gastoPorcentaje
    } else {
      expenseForm.gastoPorcentaje = ventas > 0 ? expenseForm.gastoMonto / ventas : 0
    }
  },
)

const loadCut = async () => {
  loading.value = true
  try {
    const active = await fetchActiveCut()
    applyCut(active)
    if (!active) {
      const last = await fetchLastClosed()
      if (last) {
        openForm.saldoNetoAnterior = last.saldoNetoResultante
        openForm.gastoPorcentaje = last.gastoPorcentaje
      }
    }
  } finally {
    loading.value = false
  }
}

onMounted(loadCut)

const refresh = () => loadCut()

const handleOpen = async () => {
  loading.value = true
  try {
    const next = await openCut({
      saldoNetoAnterior: openForm.saldoNetoAnterior,
      gastoPorcentaje: openForm.gastoPorcentaje,
    })
    applyCut(next)
  } finally {
    loading.value = false
  }
}

const handlePurchase = async (payload: { totalPagado: number; tomadoFondo: number; descripcion?: string }) => {
  loading.value = true
  try {
    const next = await createPurchase(payload)
    applyCut(next)
  } finally {
    loading.value = false
  }
}

const handleExpenseAmountInput = () => {
  if (!cut.value) return
  expenseMode.value = 'amount'
  const ventas = salesForm.ventasDelDia ?? 0
  if (ventas <= 0) {
    expenseForm.gastoPorcentaje = 0
    return
  }
  expenseForm.gastoPorcentaje = expenseForm.gastoMonto / ventas
}

const handleExpensePercentageInput = () => {
  if (!cut.value) return
  expenseMode.value = 'percentage'
  const ventas = salesForm.ventasDelDia ?? 0
  expenseForm.gastoMonto = ventas * expenseForm.gastoPorcentaje
}

const updateExpense = async () => {
  if (!cut.value) return
  loading.value = true
  try {
    const payload: { gastoMonto?: number; gastoPorcentaje?: number } = {}
    if (expenseMode.value === 'amount') {
      payload.gastoMonto = expenseForm.gastoMonto
    } else {
      payload.gastoPorcentaje = expenseForm.gastoPorcentaje
    }
    const next = await apiUpdateExpense(payload)
    applyCut(next)
  } finally {
    loading.value = false
  }
}

const setAutoExpense = async () => {
  if (!cut.value) return
  loading.value = true
  try {
    const next = await apiUpdateExpense({ useAutoGasto: true })
    expenseMode.value = 'percentage'
    applyCut(next)
  } finally {
    loading.value = false
  }
}

const handleUpdateSales = async () => {
  if (!cut.value) return
  loading.value = true
  try {
    const next = await updateSales({ ventasDelDia: salesForm.ventasDelDia })
    applyCut(next)
  } finally {
    loading.value = false
  }
}

const handleClose = async () => {
  if (!cut.value) return
  if (!confirm('¿Confirmas que deseas cerrar el corte con las ventas capturadas?')) return
  loading.value = true
  try {
    const next = await closeCut({ ventasDelDia: salesForm.ventasDelDia })
    applyCut(next)
    await loadCut()
  } finally {
    loading.value = false
  }
}

const handleDelete = async (id: number) => {
  if (!confirm('¿Seguro que quieres eliminar esta compra?')) return
  loading.value = true
  try {
    const next = await deletePurchase(id)
    applyCut(next)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.page-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 2rem;
  align-items: flex-start;
}

.left-column,
.right-column {
  display: grid;
  gap: 1.2rem;
}

@media (max-width: 1024px) {
  .page-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

.header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

h2 {
  margin: 0 0 0.35rem;
}

.muted {
  color: var(--muted);
  margin: 0;
}

.actions {
  display: flex;
  justify-content: flex-end;
}
</style>

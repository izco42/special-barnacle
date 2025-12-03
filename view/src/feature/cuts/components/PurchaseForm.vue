<template>
  <form class="card grid" @submit.prevent="submit">
    <h3 class="title">Registrar compra</h3>
    <label class="field">
      <span>Total pagado</span>
      <input v-model.number="form.totalPagado" type="number" min="0" step="0.01" class="input" required />
    </label>
    <label class="field">
      <span>Tomado de fondo</span>
      <input v-model.number="form.tomadoFondo" type="number" min="0" step="0.01" class="input" required />
    </label>
    <label class="field">
      <span>Descripción (opcional)</span>
      <input v-model="form.descripcion" type="text" class="input" placeholder="Ej: Proveedor lácteos" />
    </label>
    <div class="actions">
      <button class="btn" type="submit" :disabled="loading">Agregar compra</button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'

const emit = defineEmits<{
  (e: 'submit', payload: { totalPagado: number; tomadoFondo: number; descripcion?: string }): void
}>()
const props = defineProps<{ loading?: boolean }>()
const loading = computed(() => props.loading ?? false)

const form = reactive({ totalPagado: 0, tomadoFondo: 0, descripcion: '' })

const submit = () => {
  emit('submit', {
    totalPagado: form.totalPagado,
    tomadoFondo: form.tomadoFondo,
    descripcion: form.descripcion || undefined,
  })
  form.totalPagado = 0
  form.tomadoFondo = 0
  form.descripcion = ''
}
</script>

<style scoped>
.title {
  margin: 0;
}

.actions {
  display: flex;
  justify-content: flex-end;
}
</style>

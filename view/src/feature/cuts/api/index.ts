import http from '../../../lib/http'
import type { CutDto } from '../types'

export async function fetchActiveCut(): Promise<CutDto | null> {
  const { data } = await http.get<CutDto | null>('/cuts/active')
  return data
}

export async function openCut(payload: {
  saldoNetoAnterior: number
  gastoPorcentaje?: number
  gastoMonto?: number
}): Promise<CutDto> {
  const { data } = await http.post<CutDto>('/cuts/open', payload)
  return data
}

export async function closeCut(payload: { ventasDelDia?: number; gastoMonto?: number }): Promise<CutDto> {
  const { data } = await http.post<CutDto>('/cuts/close', payload)
  return data
}

export async function createPurchase(payload: {
  totalPagado: number
  tomadoFondo: number
  descripcion?: string
}): Promise<CutDto> {
  const { data } = await http.post<CutDto>('/cuts/purchases', payload)
  return data
}

export async function updatePurchase(
  id: number,
  payload: { totalPagado?: number; tomadoFondo?: number; descripcion?: string },
): Promise<CutDto> {
  const { data } = await http.patch<CutDto>(`/cuts/purchases/${id}`, payload)
  return data
}

export async function deletePurchase(id: number): Promise<CutDto> {
  const { data } = await http.delete<CutDto>(`/cuts/purchases/${id}`)
  return data
}

export async function deleteCut(id: number): Promise<{ success: true }> {
  const { data } = await http.delete<{ success: true }>(`/cuts/${id}`)
  return data
}

export async function updateExpense(payload: { gastoPorcentaje?: number; gastoMonto?: number; useAutoGasto?: boolean }): Promise<CutDto> {
  const { data } = await http.patch<CutDto>('/cuts/expense', payload)
  return data
}

export async function updateSales(payload: { ventasDelDia: number }): Promise<CutDto> {
  const { data } = await http.patch<CutDto>('/cuts/sales', payload)
  return data
}

export async function fetchHistory(): Promise<CutDto[]> {
  const { data } = await http.get<CutDto[]>('/cuts')
  return data
}

export async function fetchLastClosed(): Promise<CutDto | null> {
  const { data } = await http.get<CutDto | null>('/cuts/last-closed')
  return data
}

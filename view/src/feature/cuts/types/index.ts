export interface PurchaseDto {
  id: number
  descripcion?: string | null
  totalPagado: number
  tomadoFondo: number
  tomadoCaja: number
  createdAt: string
}

export interface CutDto {
  id: number
  status: 'open' | 'closed'
  date: string
  saldoNetoAnterior: number
  ventasDelDia: number | null
  gastoPorcentaje: number
  gastoMonto: number | null
  gastoEsManual: boolean
  comprasTotales: number
  tomadoFondo: number
  tomadoCaja: number
  utilidadOperativa: number
  saldoNetoResultante: number
  purchases: PurchaseDto[]
  createdAt: string
  updatedAt: string
}

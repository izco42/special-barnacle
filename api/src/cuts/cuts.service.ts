import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cut, CutStatus } from './cut.entity';
import { Purchase } from './purchase.entity';
import { OpenCutDto } from './dto/open-cut.dto';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { CloseCutDto } from './dto/close-cut.dto';
import { UpdateSalesDto } from './dto/update-sales.dto';

@Injectable()
export class CutsService {
  constructor(
    @InjectRepository(Cut) private readonly cutsRepo: Repository<Cut>,
    @InjectRepository(Purchase)
    private readonly purchasesRepo: Repository<Purchase>,
  ) {}

  async getActiveCut(): Promise<Cut | null> {
    return this.cutsRepo.findOne({
      where: { status: CutStatus.OPEN },
      relations: ['purchases'],
      order: { createdAt: 'DESC' },
    });
  }

  async listClosedCuts(): Promise<Cut[]> {
    return this.cutsRepo.find({
      where: { status: CutStatus.CLOSED },
      relations: ['purchases'],
      order: { createdAt: 'DESC' },
    });
  }

  async getLastClosedCut(): Promise<Cut | null> {
    return this.cutsRepo.findOne({
      where: { status: CutStatus.CLOSED },
      relations: ['purchases'],
      order: { createdAt: 'DESC' },
    });
  }

  async openCut(dto: OpenCutDto): Promise<Cut> {
    const existing = await this.getActiveCut();
    if (existing) {
      throw new BadRequestException('Ya hay un corte abierto. Ciérralo antes de abrir otro.');
    }

    const gastoEsManual = dto.gastoMonto !== undefined && dto.gastoMonto !== null;
    const cut = this.cutsRepo.create({
      status: CutStatus.OPEN,
      saldoNetoAnterior: dto.saldoNetoAnterior,
      gastoPorcentaje: dto.gastoPorcentaje ?? 0.15,
      gastoMonto: dto.gastoMonto ?? 0,
      gastoEsManual,
      ventasDelDia: null,
      comprasTotales: 0,
      tomadoFondo: 0,
      tomadoCaja: 0,
      utilidadOperativa: 0,
      saldoNetoResultante: dto.saldoNetoAnterior,
    });

    const saved = await this.cutsRepo.save(cut);
    return this.recalculate(saved.id);
  }

  async createPurchase(dto: CreatePurchaseDto): Promise<Cut> {
    const cut = await this.requireActiveCut();
    if (dto.tomadoFondo > dto.totalPagado) {
      throw new BadRequestException('El monto tomado del fondo no puede exceder el total pagado.');
    }

    const purchase = this.purchasesRepo.create({
      descripcion: dto.descripcion ?? null,
      totalPagado: dto.totalPagado,
      tomadoFondo: dto.tomadoFondo,
      tomadoCaja: dto.totalPagado - dto.tomadoFondo,
      cut,
    });

    await this.purchasesRepo.save(purchase);
    return this.recalculate(cut.id);
  }

  async updatePurchase(id: number, dto: UpdatePurchaseDto): Promise<Cut> {
    const purchase = await this.purchasesRepo.findOne({
      where: { id },
      relations: ['cut'],
    });
    if (!purchase) {
      throw new NotFoundException('Compra no encontrada.');
    }
    if (purchase.cut.status !== CutStatus.OPEN) {
      throw new BadRequestException('Solo puedes modificar compras de un corte abierto.');
    }

    const totalPagado = dto.totalPagado ?? purchase.totalPagado;
    const tomadoFondo = dto.tomadoFondo ?? purchase.tomadoFondo;
    if (tomadoFondo > totalPagado) {
      throw new BadRequestException('El monto tomado del fondo no puede exceder el total pagado.');
    }

    purchase.totalPagado = totalPagado;
    purchase.tomadoFondo = tomadoFondo;
    purchase.tomadoCaja = totalPagado - tomadoFondo;
    if (dto.descripcion !== undefined) {
      purchase.descripcion = dto.descripcion;
    }

    await this.purchasesRepo.save(purchase);
    return this.recalculate(purchase.cut.id);
  }

  async deletePurchase(id: number): Promise<Cut> {
    const purchase = await this.purchasesRepo.findOne({
      where: { id },
      relations: ['cut'],
    });
    if (!purchase) {
      throw new NotFoundException('Compra no encontrada.');
    }
    if (purchase.cut.status !== CutStatus.OPEN) {
      throw new BadRequestException('Solo puedes eliminar compras de un corte abierto.');
    }

    await this.purchasesRepo.remove(purchase);
    return this.recalculate(purchase.cut.id);
  }

  async deleteCut(id: number): Promise<{ success: true }> {
    const cut = await this.cutsRepo.findOne({ where: { id } });
    if (!cut) {
      throw new NotFoundException('Corte no encontrado.');
    }
    if (cut.status !== CutStatus.CLOSED) {
      throw new BadRequestException('Solo puedes eliminar cortes cerrados.');
    }

    await this.cutsRepo.remove(cut);
    return { success: true };
  }

  async updateExpense(dto: UpdateExpenseDto): Promise<Cut> {
    const cut = await this.requireActiveCut();

    if (dto.useAutoGasto) {
      cut.gastoEsManual = false;
    }

    if (dto.gastoPorcentaje !== undefined) {
      cut.gastoPorcentaje = dto.gastoPorcentaje;
      cut.gastoEsManual = false;
    }

    if (dto.gastoMonto !== undefined) {
      cut.gastoMonto = dto.gastoMonto;
      cut.gastoEsManual = true;
    }

    await this.cutsRepo.save(cut);
    return this.recalculate(cut.id);
  }

  async updateSales(dto: UpdateSalesDto): Promise<Cut> {
    const cut = await this.requireActiveCut();
    cut.ventasDelDia = dto.ventasDelDia;
    await this.cutsRepo.save(cut);
    return this.recalculate(cut.id);
  }

  async closeCut(dto: CloseCutDto): Promise<Cut> {
    const cut = await this.requireActiveCut();
    if (dto.ventasDelDia !== undefined) {
      cut.ventasDelDia = dto.ventasDelDia;
    }
    if (cut.ventasDelDia === null || cut.ventasDelDia === undefined) {
      throw new BadRequestException('Debes capturar las ventas del día antes de cerrar el corte.');
    }

    if (dto.gastoMonto !== undefined) {
      cut.gastoMonto = dto.gastoMonto;
      cut.gastoEsManual = true;
    }

    cut.status = CutStatus.CLOSED;
    await this.cutsRepo.save(cut);
    return this.recalculate(cut.id);
  }

  private async requireActiveCut(): Promise<Cut> {
    const cut = await this.getActiveCut();
    if (!cut) {
      throw new BadRequestException('No hay un corte abierto. Ábrelo antes de registrar compras.');
    }
    return cut;
  }

  private applyMetrics(cut: Cut): Cut {
    const purchases = cut.purchases ?? [];
    const comprasTotales = purchases.reduce((sum, p) => sum + (p.totalPagado ?? 0), 0);
    const tomadoFondo = purchases.reduce((sum, p) => sum + (p.tomadoFondo ?? 0), 0);
    const tomadoCaja = comprasTotales - tomadoFondo;
    const ventas = cut.ventasDelDia ?? 0;
    const gastoAuto = ventas * cut.gastoPorcentaje;
    let gastoMonto: number;
    if (cut.gastoEsManual) {
      gastoMonto = cut.gastoMonto ?? 0;
      cut.gastoMonto = gastoMonto;
      if (ventas > 0) {
        cut.gastoPorcentaje = gastoMonto / ventas;
      } else if (gastoMonto === 0) {
        cut.gastoPorcentaje = 0;
      }
    } else {
      gastoMonto = gastoAuto;
      cut.gastoMonto = gastoMonto;
    }
    const utilidadOperativa = ventas - tomadoCaja - gastoMonto;
    const saldoNetoResultante = cut.saldoNetoAnterior + utilidadOperativa;

    cut.comprasTotales = comprasTotales;
    cut.tomadoFondo = tomadoFondo;
    cut.tomadoCaja = tomadoCaja;
    cut.utilidadOperativa = utilidadOperativa;
    cut.saldoNetoResultante = saldoNetoResultante;
    cut.gastoMonto = gastoMonto;

    return cut;
  }

  private async recalculate(cutId: number): Promise<Cut> {
    const cut = await this.cutsRepo.findOne({
      where: { id: cutId },
      relations: ['purchases'],
    });
    if (!cut) {
      throw new NotFoundException('Corte no encontrado.');
    }

    const updated = this.applyMetrics(cut);
    return this.cutsRepo.save(updated);
  }
}

import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Purchase } from './purchase.entity';

export enum CutStatus {
  OPEN = 'open',
  CLOSED = 'closed',
}

@Entity()
export class Cut {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', default: CutStatus.OPEN })
  status: CutStatus;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  @Column({ type: 'real' })
  saldoNetoAnterior: number;

  @Column({ type: 'real', nullable: true })
  ventasDelDia: number | null;

  @Column({ type: 'real', default: 0.15 })
  gastoPorcentaje: number;

  @Column({ type: 'real', nullable: true })
  gastoMonto: number | null;

  @Column({ type: 'boolean', default: false })
  gastoEsManual: boolean;

  @Column({ type: 'real', default: 0 })
  comprasTotales: number;

  @Column({ type: 'real', default: 0 })
  tomadoFondo: number;

  @Column({ type: 'real', default: 0 })
  tomadoCaja: number;

  @Column({ type: 'real', default: 0 })
  utilidadOperativa: number;

  @Column({ type: 'real', default: 0 })
  saldoNetoResultante: number;

  @OneToMany(() => Purchase, (purchase) => purchase.cut, { cascade: true })
  purchases: Purchase[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

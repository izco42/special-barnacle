import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Cut } from './cut.entity';

@Entity()
export class Purchase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  descripcion?: string | null;

  @Column({ type: 'real' })
  totalPagado: number;

  @Column({ type: 'real' })
  tomadoFondo: number;

  @Column({ type: 'real' })
  tomadoCaja: number;

  @ManyToOne(() => Cut, (cut) => cut.purchases, { onDelete: 'CASCADE' })
  cut: Cut;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

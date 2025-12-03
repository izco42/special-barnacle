import { IsBoolean, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateExpenseDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  gastoPorcentaje?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  gastoMonto?: number;

  // Permite volver al cálculo automático (ventas * porcentaje)
  @IsOptional()
  @IsBoolean()
  useAutoGasto?: boolean;
}

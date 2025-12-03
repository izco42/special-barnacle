import { IsNumber, IsOptional, Min } from 'class-validator';

export class OpenCutDto {
  @IsNumber()
  saldoNetoAnterior: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  gastoPorcentaje?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  gastoMonto?: number;
}

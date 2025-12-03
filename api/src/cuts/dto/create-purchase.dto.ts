import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePurchaseDto {
  @IsNumber()
  @Min(0)
  totalPagado: number;

  @IsNumber()
  @Min(0)
  tomadoFondo: number;

  @IsOptional()
  @IsString()
  descripcion?: string;
}

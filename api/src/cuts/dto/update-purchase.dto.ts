import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdatePurchaseDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalPagado?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  tomadoFondo?: number;

  @IsOptional()
  @IsString()
  descripcion?: string;
}

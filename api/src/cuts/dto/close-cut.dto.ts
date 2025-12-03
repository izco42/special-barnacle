import { IsNumber, IsOptional, Min } from 'class-validator';

export class CloseCutDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  ventasDelDia?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  gastoMonto?: number;
}

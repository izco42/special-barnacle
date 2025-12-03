import { IsNumber, Min } from 'class-validator';

export class UpdateSalesDto {
  @IsNumber()
  @Min(0)
  ventasDelDia: number;
}


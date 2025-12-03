import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cut } from './cut.entity';
import { Purchase } from './purchase.entity';
import { CutsService } from './cuts.service';
import { CutsController } from './cuts.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Cut, Purchase])],
  controllers: [CutsController],
  providers: [CutsService],
})
export class CutsModule {}

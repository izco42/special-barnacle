import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { CutsModule } from './cuts/cuts.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DATABASE_PATH || join(__dirname, '..', '..', 'data', 'database.sqlite'),
      autoLoadEntities: true,
      synchronize: true,
    }),
    CutsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

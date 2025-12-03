import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CutsService } from './cuts.service';
import { OpenCutDto } from './dto/open-cut.dto';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { CloseCutDto } from './dto/close-cut.dto';
import { UpdateSalesDto } from './dto/update-sales.dto';

@Controller('cuts')
export class CutsController {
  constructor(private readonly cutsService: CutsService) {}

  @Post('open')
  openCut(@Body() dto: OpenCutDto) {
    return this.cutsService.openCut(dto);
  }

  @Get('active')
  getActive() {
    return this.cutsService.getActiveCut();
  }

  @Get()
  listClosed() {
    return this.cutsService.listClosedCuts();
  }

  @Get('last-closed')
  lastClosed() {
    return this.cutsService.getLastClosedCut();
  }

  @Post('purchases')
  createPurchase(@Body() dto: CreatePurchaseDto) {
    return this.cutsService.createPurchase(dto);
  }

  @Patch('purchases/:id')
  updatePurchase(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePurchaseDto,
  ) {
    return this.cutsService.updatePurchase(id, dto);
  }

  @Delete('purchases/:id')
  deletePurchase(@Param('id', ParseIntPipe) id: number) {
    return this.cutsService.deletePurchase(id);
  }

  @Delete(':id')
  deleteCut(@Param('id', ParseIntPipe) id: number) {
    return this.cutsService.deleteCut(id);
  }

  @Patch('expense')
  updateExpense(@Body() dto: UpdateExpenseDto) {
    return this.cutsService.updateExpense(dto);
  }

  @Patch('sales')
  updateSales(@Body() dto: UpdateSalesDto) {
    return this.cutsService.updateSales(dto);
  }

  @Post('close')
  closeCut(@Body() dto: CloseCutDto) {
    return this.cutsService.closeCut(dto);
  }
}

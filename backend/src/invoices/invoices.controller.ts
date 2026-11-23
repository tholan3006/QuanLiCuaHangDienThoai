import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { FilterInvoiceDto } from './dto/filter-invoice.dto';
import { InvoicesService } from './invoices.service';

@ApiTags('Invoices - Quản lý Hóa đơn Bán hàng (TV5)')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @ApiOperation({
    summary: 'Lập hóa đơn mới cho đơn hàng đã duyệt (Dành cho Nhân viên / TV4 tích hợp)',
  })
  createInvoice(@Body() dto: CreateInvoiceDto) {
    return this.invoicesService.createInvoice(dto);
  }

  @Patch(':madonhang/void')
  @ApiOperation({
    summary: 'Chuyển hóa đơn sang trạng thái VOID khi đơn hàng đã duyệt bị hủy',
  })
  voidInvoice(@Param('madonhang', ParseIntPipe) madonhang: number) {
    return this.invoicesService.voidInvoice(madonhang);
  }

  @Get()
  @ApiOperation({
    summary: 'Tra cứu danh sách hóa đơn bán hàng theo khoảng thời gian (Staff/Admin)',
  })
  findAll(@Query() filter: FilterInvoiceDto) {
    return this.invoicesService.findAll(filter);
  }

  @Get('by-order/:madonhang')
  @ApiOperation({
    summary: 'Tìm hóa đơn theo mã đơn hàng',
  })
  findByOrder(@Param('madonhang', ParseIntPipe) madonhang: number) {
    return this.invoicesService.findByOrder(madonhang);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Xem chi tiết hóa đơn theo mã mahoadon (để in ấn A4)',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.invoicesService.findOne(id);
  }
}

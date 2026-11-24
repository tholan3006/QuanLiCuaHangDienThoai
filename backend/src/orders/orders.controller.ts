import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser, CurrentUser, OrdersAuthGuard } from './auth-user';
import { CreateOrderDto } from './dto/create-order.dto';
import { FilterOrderDto } from './dto/filter-order.dto';
import { OrdersService } from './orders.service';

@ApiTags('Orders - Quản lý Đơn hàng & Tồn kho (TV4)')
@ApiBearerAuth()
@ApiHeader({ name: 'x-account-id', required: false, description: 'Chỉ để test khi chưa có JWT: mataikhoan' })
@ApiHeader({ name: 'x-role', required: false, description: 'Chỉ để test khi chưa có JWT: ADMIN | NHAN_VIEN | KHACH_HANG' })
@UseGuards(OrdersAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Khách đặt hàng: tạo đơn CHO_XAC_NHAN (chưa trừ kho)' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(user, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Khách xem lịch sử "Đơn mua của tôi"' })
  findMine(@CurrentUser() user: AuthUser, @Query() filter: FilterOrderDto) {
    return this.ordersService.findMine(user, filter);
  }

  @Get()
  @ApiOperation({ summary: 'Nhân viên/Admin xem toàn bộ đơn hàng, lọc theo trạng thái và ngày' })
  findAll(@CurrentUser() user: AuthUser, @Query() filter: FilterOrderDto) {
    return this.ordersService.findAll(user, filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết đơn hàng (khách chỉ xem đơn của mình)' })
  findOne(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(user, id);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Duyệt đơn: trừ kho + lập hóa đơn ISSUED trong cùng transaction' })
  approve(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.ordersService.approveOrder(user, id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Hủy đơn: đơn đã duyệt thì hoàn kho + hóa đơn VOID' })
  cancel(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.ordersService.cancelOrder(user, id);
  }
}

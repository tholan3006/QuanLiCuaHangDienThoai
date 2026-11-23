import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { FilterReportDto } from './dto/filter-report.dto';
import { ReportsService } from './reports.service';

@ApiTags('Reports - Báo cáo & Thống kê Doanh thu (TV5)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'STAFF')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('summary')
  @ApiOperation({
    summary:
      'Tổng quan Dashboard: Doanh thu bán ròng (chỉ tính ISSUED, trừ VOID), tỷ lệ hủy đơn, số máy đã bán',
  })
  getDashboardSummary(@Query() filter: FilterReportDto) {
    return this.reportsService.getDashboardSummary(filter);
  }

  @Get('revenue-trend')
  @ApiOperation({
    summary: 'Dữ liệu biểu đồ biến động doanh thu theo thời gian (Line Chart)',
  })
  getRevenueTrend(@Query() filter: FilterReportDto) {
    return this.reportsService.getRevenueTrend(filter);
  }

  @Get('top-products')
  @ApiOperation({
    summary: 'Danh sách 5 sản phẩm bán chạy nhất (Top Selling Products)',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getTopSellingProducts(
    @Query('limit') limit?: number,
    @Query() filter?: FilterReportDto,
  ) {
    return this.reportsService.getTopSellingProducts(limit ? Number(limit) : 5, filter);
  }

  @Get('payment-and-status')
  @ApiOperation({
    summary: 'Thống kê theo phương thức thanh toán và trạng thái đơn hàng (Doughnut Chart)',
  })
  getPaymentAndOrderStatusStats(@Query() filter: FilterReportDto) {
    return this.reportsService.getPaymentAndOrderStatusStats(filter);
  }

  @Post('snapshot')
  @ApiOperation({
    summary: 'Kết xuất và lưu trữ bản ghi tổng kết vào bảng BAO_CAO_DOANH_THU',
  })
  createReportSnapshot(@Body() filter: FilterReportDto) {
    return this.reportsService.createReportSnapshot(filter);
  }
}

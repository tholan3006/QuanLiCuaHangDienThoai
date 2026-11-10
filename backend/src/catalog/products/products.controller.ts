import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateProductDto } from './dto/create-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateStockPriceDto } from './dto/update-stock-price.dto';
import { ProductsService } from './products.service';

@ApiTags('Products - Quản lý Sản phẩm & Tồn kho iPhone (TV2)')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({
    summary:
      'Danh sách, tìm kiếm & lọc sản phẩm cho Khách hàng (Tự động ẩn sản phẩm NGUNG_KINH_DOANH)',
  })
  findAllForStore(@Query() filter: FilterProductDto) {
    return this.productsService.findAllForStore(filter);
  }

  @Get('staff')
  @ApiOperation({
    summary:
      'Danh sách quản lý sản phẩm cho Nhân viên bán hàng (Hiển thị đầy đủ cả sản phẩm đã ẩn & thống kê tồn kho)',
  })
  findAllForStaff(@Query() filter: FilterProductDto) {
    return this.productsService.findAllForStaff(filter);
  }

  @Get('staff/:id')
  @ApiOperation({
    summary: 'Xem chi tiết sản phẩm & lịch sử cập nhật tồn kho (TON_KHO) dành cho Nhân viên',
  })
  findOneForStaff(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOneForStaff(id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Xem chi tiết sản phẩm cho Khách hàng (Chặn nếu sản phẩm đã NGUNG_KINH_DOANH)',
  })
  findOneForStore(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOneForStore(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Thêm mới phiên bản sản phẩm iPhone (kèm khởi tạo bản ghi TON_KHO)',
  })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Chỉnh sửa thông tin phiên bản sản phẩm iPhone',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Patch(':id/stock-price')
  @ApiOperation({
    summary: 'Cập nhật nhanh Giá bán, Số lượng tồn kho (ghi vào TON_KHO) và Hình ảnh',
  })
  updatePriceStockImage(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStockPriceDto,
  ) {
    return this.productsService.updatePriceStockImage(id, dto);
  }

  @Patch(':id/hide')
  @ApiOperation({
    summary: 'Ẩn / Ngừng kinh doanh sản phẩm (Soft Delete - TrangThai = NGUNG_KINH_DOANH)',
  })
  hideProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.softDelete(id);
  }

  @Patch(':id/restore')
  @ApiOperation({
    summary: 'Khôi phục kinh doanh sản phẩm đã ẩn',
  })
  restoreProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.restore(id);
  }

  @Delete(':id')
  @ApiOperation({
    summary:
      'Ngừng kinh doanh sản phẩm (Thực hiện Soft Delete, tuyệt đối không xóa vật lý sản phẩm đã có đơn hàng)',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.softDelete(id);
  }

  @Post(':id/check-purchasable')
  @ApiOperation({
    summary:
      'Kiểm tra sản phẩm có hợp lệ để khách đặt mua không (Chặn sản phẩm đã ẩn / hết hàng)',
  })
  @ApiQuery({ name: 'quantity', required: false, type: Number })
  checkPurchasable(
    @Param('id', ParseIntPipe) id: number,
    @Query('quantity') quantity?: string,
  ) {
    return this.productsService.verifyPurchasable(id, quantity ? Number(quantity) : 1);
  }
}

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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('Categories - Quản lý Danh mục iPhone (TV2)')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách các dòng iPhone (kèm số lượng sản phẩm)' })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
    description: 'true: Lấy cả danh mục đang ẩn (dành cho Nhân viên/Admin)',
  })
  findAll(@Query('includeInactive') includeInactive?: string) {
    return this.categoriesService.findAll(includeInactive === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết danh mục và các sản phẩm thuộc danh mục' })
  @ApiQuery({
    name: 'includeInactiveProducts',
    required: false,
    type: Boolean,
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('includeInactiveProducts') includeInactiveProducts?: string,
  ) {
    return this.categoriesService.findOne(id, includeInactiveProducts === 'true');
  }

  @Post()
  @ApiOperation({ summary: 'Thêm mới danh mục dòng iPhone' })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Chỉnh sửa thông tin danh mục dòng iPhone' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Xóa danh mục iPhone (Bảo toàn dữ liệu: chặn xóa nếu danh mục đang có sản phẩm)',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.remove(id);
  }
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class FilterProductDto {
  @ApiPropertyOptional({
    description: 'Từ khóa tìm kiếm theo tensanpham, mausac hoặc mã SKU',
    example: 'iPhone 16 Pro Max',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo mã danh mục dòng iPhone (madanhmuc)',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  madanhmuc?: number;

  @ApiPropertyOptional({
    description: 'Lọc theo dung lượng bộ nhớ (64GB, 128GB, 256GB, 512GB, 1TB, 2TB)',
    example: '256GB',
  })
  @IsOptional()
  @IsString()
  dungluong?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo màu sắc phiên bản',
    example: 'Titan Sa Mạc',
  })
  @IsOptional()
  @IsString()
  mausac?: string;

  @ApiPropertyOptional({
    description: 'Giá tối thiểu (VNĐ)',
    example: 15000000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Giá tối đa (VNĐ)',
    example: 45000000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Lọc theo trạng thái (DANG_BAN | NGUNG_KINH_DOANH | HET_HANG) - Dành cho Nhân viên',
  })
  @IsOptional()
  @IsString()
  trangthai?: string;

  @ApiPropertyOptional({
    description: 'Sắp xếp: price_asc | price_desc | newest | name_asc',
    default: 'newest',
  })
  @IsOptional()
  @IsIn(['price_asc', 'price_desc', 'newest', 'name_asc'])
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'name_asc';

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export const VALID_STORAGES = ['64GB', '128GB', '256GB', '512GB', '1TB', '2TB'] as const;
export const VALID_PRODUCT_STATUSES = ['DANG_BAN', 'NGUNG_KINH_DOANH', 'HET_HANG'] as const;

export class CreateProductDto {
  @ApiProperty({
    example: 'iPhone 16 Pro Max',
    description: 'Tên sản phẩm iPhone (tensanpham)',
  })
  @IsString({ message: 'tensanpham phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'tensanpham không được để trống' })
  @MaxLength(200, { message: 'tensanpham tối đa 200 ký tự' })
  tensanpham: string;

  @ApiProperty({
    example: 1,
    description: 'Mã danh mục dòng iPhone (madanhmuc)',
  })
  @Type(() => Number)
  @IsInt({ message: 'madanhmuc phải là số nguyên' })
  @Min(1, { message: 'madanhmuc không hợp lệ' })
  madanhmuc: number;

  @ApiProperty({
    example: '256GB',
    enum: VALID_STORAGES,
    description: 'Dung lượng bộ nhớ phiên bản (dungluong)',
  })
  @IsString()
  @IsIn(VALID_STORAGES, {
    message: 'dungluong phải thuộc một trong các mức: 64GB, 128GB, 256GB, 512GB, 1TB, 2TB',
  })
  dungluong: string;

  @ApiProperty({
    example: 'Titan Sa Mạc',
    description: 'Màu sắc của phiên bản iPhone (mausac)',
  })
  @IsString({ message: 'mausac phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'mausac không được để trống' })
  @MaxLength(50, { message: 'mausac tối đa 50 ký tự' })
  mausac: string;

  @ApiProperty({
    example: 34990000,
    description: 'Giá bán niêm yết (giaban > 0)',
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'giaban phải là số' })
  @Min(1, { message: 'giaban phải lớn hơn 0' })
  giaban: number;

  @ApiPropertyOptional({
    example: '[SKU: IP16PM-256-DES] Màn hình Super Retina XDR 6.9 inch, Chip A18 Pro.',
    description: 'Mô tả chi tiết sản phẩm (mota)',
  })
  @IsOptional()
  @IsString()
  mota?: string;

  @ApiPropertyOptional({
    example: 'IP16PM-256-DES',
    description: 'Mã SKU phiên bản riêng biệt (tự động gắn vào mô tả/định danh nếu truyền)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  sku?: string;

  @ApiPropertyOptional({
    example: '/images/products/iphone-16-pro-max-desert.png',
    description: 'Đường dẫn hình ảnh sản phẩm (hinhanh)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  hinhanh?: string;

  @ApiPropertyOptional({
    example: 25,
    default: 0,
    description: 'Số lượng tồn kho lưu vào bảng TON_KHO (soluong >= 0)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'soluong phải là số nguyên' })
  @Min(0, { message: 'soluong không được nhỏ hơn 0' })
  soluong?: number;

  @ApiPropertyOptional({
    example: 'DANG_BAN',
    enum: VALID_PRODUCT_STATUSES,
    default: 'DANG_BAN',
    description: 'Trạng thái kinh doanh (DANG_BAN | NGUNG_KINH_DOANH | HET_HANG)',
  })
  @IsOptional()
  @IsString()
  @IsIn(VALID_PRODUCT_STATUSES, {
    message: 'trangthai phải là DANG_BAN, NGUNG_KINH_DOANH hoặc HET_HANG',
  })
  trangthai?: string;
}

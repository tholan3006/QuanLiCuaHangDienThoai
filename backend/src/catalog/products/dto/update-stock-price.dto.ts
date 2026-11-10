import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateStockPriceDto {
  @ApiPropertyOptional({
    example: 33990000,
    description: 'Giá bán mới (giaban > 0)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'giaban phải là số' })
  @Min(1, { message: 'giaban phải lớn hơn 0' })
  giaban?: number;

  @ApiPropertyOptional({
    example: 30,
    description: 'Số lượng tồn kho mới cập nhật vào bảng TON_KHO (soluong >= 0)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'soluong phải là số nguyên' })
  @Min(0, { message: 'soluong không được âm' })
  soluong?: number;

  @ApiPropertyOptional({
    example: '/images/products/iphone-16-pro-max-desert.png',
    description: 'Đường dẫn hình ảnh mới (hinhanh)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  hinhanh?: string;
}

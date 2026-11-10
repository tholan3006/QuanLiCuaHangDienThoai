import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'iPhone 16 Series',
    description: 'Tên danh mục dòng iPhone (tendanhmuc - duy nhất)',
  })
  @IsString({ message: 'tendanhmuc phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'tendanhmuc không được để trống' })
  @MaxLength(150, { message: 'tendanhmuc tối đa 150 ký tự' })
  tendanhmuc: string;

  @ApiPropertyOptional({
    example: 'Thế hệ iPhone 16 Series mới nhất với chip A18 / A18 Pro.',
    description: 'Mô tả chi tiết dòng sản phẩm iPhone (mota)',
  })
  @IsOptional()
  @IsString()
  mota?: string;
}

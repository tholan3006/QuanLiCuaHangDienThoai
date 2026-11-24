import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsIn, IsInt, IsOptional, Min, ValidateNested } from 'class-validator';

export class OrderItemDto {
  @ApiProperty({ description: 'Mã sản phẩm (masanpham)', example: 1 })
  @IsInt({ message: 'Mã sản phẩm phải là số nguyên' })
  masanpham: number;

  @ApiProperty({ description: 'Số lượng mua', example: 2 })
  @IsInt({ message: 'Số lượng phải là số nguyên' })
  @Min(1, { message: 'Số lượng phải lớn hơn hoặc bằng 1' })
  soluong: number;
}

/**
 * Khách hàng chỉ gửi danh sách sản phẩm + số lượng.
 * KHÔNG nhận makhachhang, dongia, tongtien từ client: server tự lấy từ JWT và CSDL.
 */
export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ArrayMinSize(1, { message: 'Đơn hàng phải có ít nhất 1 sản phẩm' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiPropertyOptional({ enum: ['COD', 'CHUYEN_KHOAN'], default: 'COD' })
  @IsOptional()
  @IsIn(['COD', 'CHUYEN_KHOAN'], { message: 'Phương thức thanh toán chỉ nhận COD hoặc CHUYEN_KHOAN' })
  phuongthucthanhtoan?: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateInvoiceDto {
  @ApiProperty({
    description: 'Mã đơn hàng cần lập hóa đơn (madonhang)',
    example: 2,
  })
  @IsInt({ message: 'Mã đơn hàng phải là số nguyên' })
  madonhang: number;

  @ApiPropertyOptional({
    description: 'Tổng tiền hóa đơn (nếu bỏ trống sẽ lấy theo tổng tiền đơn hàng)',
    example: 34990000,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Tổng tiền phải là dạng số' })
  @IsPositive({ message: 'Tổng tiền phải lớn hơn 0' })
  tongtien?: number;

  @ApiPropertyOptional({
    description: 'Hình thức thanh toán (COD | CHUYEN_KHOAN)',
    example: 'CHUYEN_KHOAN',
  })
  @IsOptional()
  @IsString({ message: 'Hình thức thanh toán phải là chuỗi' })
  hinhthuctt?: string;

  @ApiPropertyOptional({
    description: 'Mã nhân viên lập hóa đơn (manhanvien)',
    example: 1,
  })
  @IsOptional()
  @IsInt({ message: 'Mã nhân viên phải là số nguyên' })
  manhanvien?: number;

  @ApiPropertyOptional({
    description: 'Trạng thái hóa đơn (ISSUED | VOID)',
    enum: ['ISSUED', 'VOID'],
    default: 'ISSUED',
  })
  @IsOptional()
  @IsEnum(['ISSUED', 'VOID'], { message: 'Trạng thái hóa đơn chỉ nhận ISSUED hoặc VOID' })
  trangthai?: 'ISSUED' | 'VOID';
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class FilterInvoiceDto {
  @ApiPropertyOptional({
    description: 'Từ khóa tìm kiếm (Mã HĐ, Mã đơn, Tên KH, SĐT KH)',
    example: 'Nam',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo trạng thái hóa đơn (ISSUED | VOID | ALL)',
    example: 'ISSUED',
  })
  @IsOptional()
  @IsString()
  trangthai?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo hình thức thanh toán (COD | CHUYEN_KHOAN)',
    example: 'COD',
  })
  @IsOptional()
  @IsString()
  hinhthuctt?: string;

  @ApiPropertyOptional({
    description: 'Từ ngày (YYYY-MM-DD)',
    example: '2026-11-01',
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({
    description: 'Đến ngày (YYYY-MM-DD)',
    example: '2026-11-30',
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo nhân viên lập hóa đơn',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  manhanvien?: number;

  @ApiPropertyOptional({
    description: 'Trang hiển thị',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Số lượng mục trên một trang',
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  limit?: number = 10;
}

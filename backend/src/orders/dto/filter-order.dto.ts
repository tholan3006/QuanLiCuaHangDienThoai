import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class FilterOrderDto {
  @ApiPropertyOptional({
    description: 'Trạng thái đơn: CHO_XAC_NHAN | DA_XAC_NHAN | DA_HUY | ALL',
    example: 'CHO_XAC_NHAN',
  })
  @IsOptional()
  @IsIn(['ALL', 'CHO_XAC_NHAN', 'DA_XAC_NHAN', 'DANG_GIAO', 'HOAN_THANH', 'DA_HUY'])
  trangthai?: string;

  @ApiPropertyOptional({ description: 'Tìm theo mã đơn, tên hoặc SĐT khách (chỉ dùng cho nhân viên)' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Từ ngày đặt (YYYY-MM-DD)', example: '2026-11-01' })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({ description: 'Đến ngày đặt (YYYY-MM-DD)', example: '2026-11-30' })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

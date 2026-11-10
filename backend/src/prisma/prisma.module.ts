import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * PrismaModule (@Global) - Cung cấp PrismaService dùng chung cho toàn bộ các module trong Backend
 * Phụ trách: Thành viên 2
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}

import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * PrismaService - Quản lý kết nối và truy vấn CSDL PostgreSQL qua Prisma ORM
 * Phụ trách: Thành viên 2 (Quản trị CSDL & Quản lý Danh mục, Sản phẩm)
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Đã kết nối cơ sở dữ liệu PostgreSQL thành công qua Prisma ORM.');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Đã đóng kết nối cơ sở dữ liệu PostgreSQL.');
  }
}

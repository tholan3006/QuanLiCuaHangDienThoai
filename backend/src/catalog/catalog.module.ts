import { Module } from '@nestjs/common';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';

/**
 * CatalogModule - Phân hệ Quản lý Danh mục & Sản phẩm iPhone (TV2)
 */
@Module({
  imports: [CategoriesModule, ProductsModule],
  exports: [CategoriesModule, ProductsModule],
})
export class CatalogModule {}

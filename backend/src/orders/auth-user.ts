import {
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

/**
 * Người dùng đang đăng nhập, lấy từ JWT của TV1 (req.user).
 * role trùng tên bảng VAI_TRO trong seed: ADMIN | NHAN_VIEN | KHACH_HANG
 */
export type Role = 'ADMIN' | 'NHAN_VIEN' | 'KHACH_HANG';

export interface AuthUser {
  mataikhoan: number;
  role: Role;
}

export const isStaff = (user: AuthUser) => user.role === 'ADMIN' || user.role === 'NHAN_VIEN';

export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext): AuthUser => {
  return ctx.switchToHttp().getRequest().user;
});

/**
 * Guard TẠM cho module orders.
 * - Nếu TV1 đã gắn req.user (JwtAuthGuard) thì dùng luôn.
 * - Nếu chưa có JWT: khi NODE_ENV khác production cho phép test nhanh bằng 2 header
 *   x-account-id (mataikhoan) và x-role (ADMIN | NHAN_VIEN | KHACH_HANG).
 * => Khi TV1 merge, thay @UseGuards(OrdersAuthGuard) bằng JwtAuthGuard thật là xong.
 */
@Injectable()
export class OrdersAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();

    const u = req.user;
    if (u) {
      const mataikhoan = Number(u.mataikhoan ?? u.sub ?? u.userId ?? u.id);
      const role = u.role ?? u.vaitro ?? u.tenvaitro;
      if (mataikhoan && role) {
        req.user = { mataikhoan, role } as AuthUser;
        return true;
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      const id = Number(req.headers['x-account-id']);
      const role = String(req.headers['x-role'] ?? '').toUpperCase();
      if (id && ['ADMIN', 'NHAN_VIEN', 'KHACH_HANG'].includes(role)) {
        req.user = { mataikhoan: id, role } as AuthUser;
        return true;
      }
    }

    throw new UnauthorizedException('Bạn cần đăng nhập để thực hiện thao tác này');
  }
}

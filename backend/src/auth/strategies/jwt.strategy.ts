import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { toAppRole } from '../auth.constants';

interface JwtPayload {
  sub: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const account = await this.prisma.tAI_KHOAN.findUnique({
      where: { mataikhoan: payload.sub },
      include: { VAI_TRO: true },
    });
    const role = account && toAppRole(account.VAI_TRO.tenvaitro);
    const isActive = account?.trangthai === 'HOAT_DONG';

    if (!account || !isActive || !role) {
      throw new UnauthorizedException('Tài khoản không hoạt động hoặc không hợp lệ');
    }

    return {
      mataikhoan: account.mataikhoan,
      tendangnhap: account.tendangnhap,
      email: account.email,
      role,
    };
  }
}

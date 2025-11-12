import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async createUser(login: string, password: string) {
    const hashed = await bcrypt.hash(password, 10);
    return this.prisma.user.create({ data: { login, password: hashed } });
  }

  async login(login: string, password: string) {
    if (!login) return null;

    const user = await this.prisma.user.findUnique({ where: { login } });
    if (!user) return null;

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return null;

    if (user.session) return null;

    const sessionToken = randomBytes(32).toString('hex');
    await this.prisma.user.update({
      where: { id: user.id },
      data: { session: sessionToken },
    });

    return { user, sessionToken };
  }

  async logout(sessionToken: string) {
    return this.prisma.user.updateMany({
      where: { session: sessionToken },
      data: { session: null },
    });
  }

  async getMe(sessionToken: string) {
    const user = await this.prisma.user.findFirst({
      where: { session: sessionToken },
    });
    return !!user;
  }
}

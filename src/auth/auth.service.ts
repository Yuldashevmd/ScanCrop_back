import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly JWT_SECRET = process.env.COOKIE_SECRET || 'supersecret';

  async createUser(login: string, password: string) {
    return this.prisma.user.create({ data: { login, password } });
  }

  async validateUser(login: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { login } });
    if (!user) return null;

    const valid = user.password === password;
    return valid ? user : null;
  }

  async signToken(id: number, login: string) {
    return jwt.sign({ id, login }, this.JWT_SECRET, { expiresIn: '7d' });
  }

  async verifyToken(token: string) {
    try {
      const payload = jwt.verify(token, this.JWT_SECRET) as {
        id: number;
        login: string;
      };
      return payload;
    } catch {
      return null;
    }
  }
  async getUsers() {
    return this.prisma.user.findMany();
  }

  async deleteUser(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }
}

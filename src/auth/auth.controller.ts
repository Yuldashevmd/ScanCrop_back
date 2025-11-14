import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  Get,
  HttpCode,
  Delete,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Request, Response } from 'express';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Cookie configuration
  private getCookieOptions() {
    const isProd = process.env.NODE_ENV === 'production';
    return {
      httpOnly: true,
      sameSite: isProd ? 'none' : 'lax',
      secure: isProd,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    } as const;
  }

  @Post('register')
  async register(@Body() body: CreateUserDto, @Res() res: Response) {
    const user = await this.authService.createUser(body.login, body.password);
    const token = await this.authService.signToken(user.id, user.login);

    res.cookie('token', token, this.getCookieOptions());
    return res.json({ message: 'Registered and logged in' });
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() body: LoginUserDto, @Res() res: Response) {
    const user = await this.authService.validateUser(body.login, body.password);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = await this.authService.signToken(user.id, user.login);
    res.cookie('token', token, this.getCookieOptions());
    return res.json({ message: 'Logged in' });
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('token', this.getCookieOptions());
    return res.json({ message: 'Logged out' });
  }

  @Get('me')
  async getMe(@Req() req: Request) {
    const token = req.cookies['token'];
    if (!token) return { isAuth: false };

    const user = await this.authService.verifyToken(token);
    return { isAuth: !!user, user };
  }

  @Get('users')
  async getUsers() {
    return this.authService.getUsers();
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.authService.deleteUser(Number(id));
  }
}

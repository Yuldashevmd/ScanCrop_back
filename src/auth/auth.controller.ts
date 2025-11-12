import { Controller, Post, Body, Req, Res, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Request, Response } from 'express';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('createUser')
  async createUser(@Body() body: { login: string; password: string }) {
    return this.authService.createUser(body.login, body.password);
  }

  @Post('login')
  async login(
    @Body() body: { login: string; password: string },
    @Res() res: Response,
  ) {
    const { login, password } = body;

    if (!login || !password) {
      return res
        .status(400)
        .json({ message: 'Login and password are required' });
    }

    const result = await this.authService.login(login, password);
    if (!result)
      return res
        .status(401)
        .json({ message: 'Invalid credentials or already logged in' });

    res.cookie('session', result.sessionToken, { httpOnly: true });
    return res.json({ message: 'Logged in' });
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const sessionToken = req.cookies['session'] as string | undefined;
    if (sessionToken) await this.authService.logout(sessionToken);
    res.clearCookie('session');
    return res.json({ message: 'Logged out' });
  }

  @Get('me')
  async getMe(@Req() req: Request) {
    const sessionToken = req.cookies['session'] as string | undefined;
    const isAuth = sessionToken
      ? await this.authService.getMe(sessionToken)
      : false;
    return { isAuth };
  }
}

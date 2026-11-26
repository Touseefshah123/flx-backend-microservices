import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';

import {
  clearRefreshCookie,
  readRefreshCookie,
  REFRESH_COOKIE,
  setRefreshCookie,
} from './cookies/refresh-cookie.util';
import { LoginDto } from './dtos/login.dto';
import { SignupDto } from './dtos/signup.dto';
import { toAuthResponseDto } from './mappers/auth-response.mapper';
import { AuthService } from './services/auth.service';
import {
  ApiLogin,
  ApiLogout,
  ApiRefresh,
  ApiSignup,
} from './swagger/auth.swagger';
import { AuthResponseDto } from './swagger/dtos/auth-response.dto';

// Public routes: the gateway forwards them unsigned, so no ServiceAuthGuard here.
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('signup')
  @ApiSignup()
  async signUp(
    @Body() dto: SignupDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const result = await this.authService.signUp(dto);
    setRefreshCookie(res, result, this.isProd());
    return toAuthResponseDto(result);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiLogin()
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const result = await this.authService.login(dto);
    setRefreshCookie(res, result, this.isProd());
    return toAuthResponseDto(result);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiRefresh()
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const token = readRefreshCookie(req);
    const result = await this.authService.refresh(token);
    setRefreshCookie(res, result, this.isProd());
    return toAuthResponseDto(result);
  }

  // Never fails: a missing or expired cookie still gets cleared.
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiLogout()
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.authService.logout(req.cookies?.[REFRESH_COOKIE]);
    clearRefreshCookie(res);
  }

  private isProd(): boolean {
    return this.configService.get<string>('NODE_ENV') === 'production';
  }
}

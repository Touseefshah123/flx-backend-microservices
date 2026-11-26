import { Controller, Get } from '@nestjs/common';

import { TokenService } from './services/token.service';

@Controller('.well-known')
export class JwksController {
  constructor(private readonly tokenService: TokenService) {}

  @Get('jwks.json')
  getJwks() {
    return { keys: [this.tokenService.getPublicJwk()] };
  }
}

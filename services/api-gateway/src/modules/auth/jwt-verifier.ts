import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createRemoteJWKSet, jwtVerify } from 'jose';

@Injectable()
export class JwtVerifier {
  private readonly jwks: ReturnType<typeof createRemoteJWKSet>;
  private readonly issuer: string;
  private readonly audience: string;

  constructor(private readonly config: ConfigService) {
    this.jwks = createRemoteJWKSet(
      new URL(this.config.get<string>('AUTH_JWKS_URL')!),
    );
    this.issuer = this.config.get<string>('JWT_ISSUER')!;
    this.audience = this.config.get<string>('JWT_AUDIENCE')!;
  }

  async verify(token: string): Promise<{ sub: string; email: string }> {
    const { payload } = await jwtVerify(token, this.jwks, {
      issuer: this.issuer,
      audience: this.audience,
    });
    return { sub: payload.sub as string, email: payload.email as string };
  }
}
